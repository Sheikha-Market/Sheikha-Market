use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::fs::{self, OpenOptions};
use std::io::{Read, Write};
use std::net::{SocketAddr, TcpStream};
use std::path::PathBuf;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, State, WebviewUrl, WebviewWindowBuilder};

const APP_VERSION: &str = "1.0.51";
const LOOPBACK_ADDRESS: &str = "127.0.0.1:8080";
const MAX_PAYLOAD_BYTES: usize = 64 * 1024;
const MAX_MESSAGE_BYTES: usize = 4 * 1024;
const MAX_RESPONSE_BYTES: u64 = 6 * 1024 * 1024;

#[derive(Clone)]
struct RuntimeState {
    smoke_mode: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HumanApproval {
    approved: bool,
    approval_id: String,
    approved_by: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct UiRequest {
    request_id: String,
    actor_id: String,
    capability: String,
    #[serde(default)]
    payload: Value,
    human_approval: Option<HumanApproval>,
}

#[derive(Clone, Copy, Debug)]
struct CapabilityContract {
    capability: &'static str,
    method: &'static str,
    path: &'static str,
    impact: &'static str,
    timeout_seconds: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct GovernanceDecision {
    status: &'static str,
    reason: &'static str,
    impact: &'static str,
    human_approval_status: &'static str,
    human_final_decision: bool,
    artificial_intelligence_can_authorize: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct GovernedResponse {
    ok: bool,
    request_id: String,
    capability: String,
    http_status: u16,
    data: Value,
    governance: GovernanceDecision,
    audit_recorded: bool,
    audit_sha256: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AuditRecord<'a> {
    schema_version: &'static str,
    system: &'static str,
    timestamp_epoch_ms: u128,
    request_id: &'a str,
    actor_id: &'a str,
    capability: &'a str,
    payload_sha256: &'a str,
    governance_decision: &'a str,
    human_approval_status: &'a str,
    outcome: &'a str,
    local_adapter: &'static str,
    payload_stored: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SmokeMarkers {
    health: bool,
    chat: bool,
    inspector: bool,
    window: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SmokeAcknowledgement {
    ok: bool,
    marker: &'static str,
    auto_close_scheduled: bool,
}

fn capability_contract(capability: &str) -> Option<CapabilityContract> {
    let contract = match capability {
        "runtime.health.read" => CapabilityContract {
            capability: "runtime.health.read",
            method: "GET",
            path: "/api/health",
            impact: "read-only",
            timeout_seconds: 8,
        },
        "distribution.v2.read" => CapabilityContract {
            capability: "distribution.v2.read",
            method: "GET",
            path: "/api/sheikha/distribution-apex/v2/status",
            impact: "read-only",
            timeout_seconds: 8,
        },
        "distribution.v3.read" => CapabilityContract {
            capability: "distribution.v3.read",
            method: "GET",
            path: "/api/sheikha/distribution-apex/v3/status",
            impact: "read-only",
            timeout_seconds: 8,
        },
        "distribution.v31.registry.read" => CapabilityContract {
            capability: "distribution.v31.registry.read",
            method: "GET",
            path: "/api/sheikha/distribution-apex/v3.1/release-index",
            impact: "read-only",
            timeout_seconds: 8,
        },
        "bare-metal.status.read" => CapabilityContract {
            capability: "bare-metal.status.read",
            method: "GET",
            path: "/api/sheikha/distribution-apex/v2/status",
            impact: "read-only",
            timeout_seconds: 8,
        },
        "l24.apex.read" => CapabilityContract {
            capability: "l24.apex.read",
            method: "GET",
            path: "/api/sheikha/technical-capability-apex/v1/status",
            impact: "read-only",
            timeout_seconds: 8,
        },
        "inspector.status.read" => CapabilityContract {
            capability: "inspector.status.read",
            method: "GET",
            path: "/api/sheikha/enterprise-inspector/v3/status",
            impact: "read-only",
            timeout_seconds: 12,
        },
        "chat.status.read" => CapabilityContract {
            capability: "chat.status.read",
            method: "GET",
            path: "/api/sheikha/conversation-engine/v1/status",
            impact: "read-only",
            timeout_seconds: 8,
        },
        "chat.message.submit" => CapabilityContract {
            capability: "chat.message.submit",
            method: "POST",
            path: "/api/sheikha/conversation-engine/v1/chat",
            impact: "low",
            timeout_seconds: 45,
        },
        _ => return None,
    };
    Some(contract)
}

fn validate_request(request: &UiRequest) -> Result<(), String> {
    let request_id_valid = (8..=80).contains(&request.request_id.len())
        && request
            .request_id
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || character == '-');
    if !request_id_valid {
        return Err("SCHEMA_REQUEST_ID_INVALID".to_string());
    }
    if request.actor_id.is_empty() || request.actor_id.len() > 120 {
        return Err("SCHEMA_ACTOR_ID_INVALID".to_string());
    }
    if request.capability.is_empty() || request.capability.len() > 120 {
        return Err("SCHEMA_CAPABILITY_INVALID".to_string());
    }
    let payload = serde_json::to_vec(&request.payload)
        .map_err(|_| "SCHEMA_PAYLOAD_NOT_JSON".to_string())?;
    if payload.len() > MAX_PAYLOAD_BYTES {
        return Err("SCHEMA_PAYLOAD_TOO_LARGE".to_string());
    }
    Ok(())
}

fn governance_decision(
    contract: CapabilityContract,
    approval: Option<&HumanApproval>,
) -> Result<GovernanceDecision, String> {
    let high_impact = matches!(contract.impact, "high" | "critical");
    if high_impact {
        let approval = approval.ok_or_else(|| "HUMAN_APPROVAL_REQUIRED".to_string())?;
        if !approval.approved
            || approval.approval_id.trim().is_empty()
            || approval.approved_by.trim().is_empty()
        {
            return Err("HUMAN_APPROVAL_EVIDENCE_INVALID".to_string());
        }
    }
    Ok(GovernanceDecision {
        status: "PERMITTED",
        reason: "SCHEMA_CAPABILITY_AND_GOVERNANCE_GATES_PASSED",
        impact: contract.impact,
        human_approval_status: if high_impact {
            "VERIFIED"
        } else {
            "NOT_REQUIRED_READ_ONLY_OR_LOW_IMPACT"
        },
        human_final_decision: true,
        artificial_intelligence_can_authorize: false,
    })
}

fn payload_sha256(payload: &Value) -> Result<String, String> {
    let bytes = serde_json::to_vec(payload).map_err(|_| "PAYLOAD_SERIALIZATION_FAILED".to_string())?;
    Ok(format!("{:x}", Sha256::digest(bytes)))
}

fn audit_path(app: &AppHandle) -> Result<PathBuf, String> {
    let root = app
        .path()
        .app_local_data_dir()
        .map_err(|_| "AUDIT_DIRECTORY_RESOLUTION_FAILED".to_string())?;
    Ok(root.join("audit").join("native-desktop-v4.jsonl"))
}

fn append_audit(
    app: &AppHandle,
    request: &UiRequest,
    payload_hash: &str,
    decision: &str,
    human_approval_status: &str,
    outcome: &str,
) -> Result<String, String> {
    let record = AuditRecord {
        schema_version: "4.0.0",
        system: "SHEIKHA_NATIVE_DESKTOP_AUDIT_V4",
        timestamp_epoch_ms: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|_| "AUDIT_CLOCK_INVALID".to_string())?
            .as_millis(),
        request_id: &request.request_id,
        actor_id: &request.actor_id,
        capability: &request.capability,
        payload_sha256: payload_hash,
        governance_decision: decision,
        human_approval_status,
        outcome,
        local_adapter: "FIXED_LOOPBACK_HTTP_127_0_0_1_8080",
        payload_stored: false,
    };
    let bytes = serde_json::to_vec(&record).map_err(|_| "AUDIT_SERIALIZATION_FAILED".to_string())?;
    let path = audit_path(app)?;
    let parent = path
        .parent()
        .ok_or_else(|| "AUDIT_DIRECTORY_INVALID".to_string())?;
    fs::create_dir_all(parent).map_err(|_| "AUDIT_DIRECTORY_CREATE_FAILED".to_string())?;
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|_| "AUDIT_FILE_OPEN_FAILED".to_string())?;
    file.write_all(&bytes)
        .and_then(|_| file.write_all(b"\n"))
        .and_then(|_| file.sync_data())
        .map_err(|_| "AUDIT_FILE_WRITE_FAILED".to_string())?;
    Ok(format!("{:x}", Sha256::digest(bytes)))
}

fn request_body(contract: CapabilityContract, payload: &Value) -> Result<Vec<u8>, String> {
    if contract.method == "GET" {
        return Ok(Vec::new());
    }
    if contract.capability != "chat.message.submit" {
        return Err("POST_CAPABILITY_NOT_IMPLEMENTED".to_string());
    }
    let message = payload
        .get("message")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| "CHAT_MESSAGE_REQUIRED".to_string())?;
    if message.len() > MAX_MESSAGE_BYTES {
        return Err("CHAT_MESSAGE_TOO_LARGE".to_string());
    }
    let mode = payload
        .get("mode")
        .and_then(Value::as_str)
        .filter(|value| matches!(*value, "smart" | "generative" | "rag"))
        .unwrap_or("smart");
    serde_json::to_vec(&json!({
        "message": message,
        "mode": mode,
        "channel": "native-desktop-v4",
        "language": "ar"
    }))
    .map_err(|_| "CHAT_BODY_SERIALIZATION_FAILED".to_string())
}

fn find_bytes(haystack: &[u8], needle: &[u8], start: usize) -> Option<usize> {
    haystack
        .get(start..)?
        .windows(needle.len())
        .position(|window| window == needle)
        .map(|position| position + start)
}

fn decode_chunked(body: &[u8]) -> Result<Vec<u8>, String> {
    let mut cursor = 0usize;
    let mut decoded = Vec::new();
    loop {
        let line_end = find_bytes(body, b"\r\n", cursor)
            .ok_or_else(|| "HTTP_CHUNK_HEADER_INVALID".to_string())?;
        let size_text = std::str::from_utf8(&body[cursor..line_end])
            .map_err(|_| "HTTP_CHUNK_SIZE_INVALID".to_string())?;
        let size_hex = size_text.split(';').next().unwrap_or_default().trim();
        let size = usize::from_str_radix(size_hex, 16)
            .map_err(|_| "HTTP_CHUNK_SIZE_INVALID".to_string())?;
        cursor = line_end + 2;
        if size == 0 {
            return Ok(decoded);
        }
        let chunk_end = cursor
            .checked_add(size)
            .ok_or_else(|| "HTTP_CHUNK_SIZE_OVERFLOW".to_string())?;
        if chunk_end + 2 > body.len() || &body[chunk_end..chunk_end + 2] != b"\r\n" {
            return Err("HTTP_CHUNK_BODY_INVALID".to_string());
        }
        decoded.extend_from_slice(&body[cursor..chunk_end]);
        if decoded.len() as u64 > MAX_RESPONSE_BYTES {
            return Err("HTTP_RESPONSE_TOO_LARGE".to_string());
        }
        cursor = chunk_end + 2;
    }
}

fn parse_http_response(raw: &[u8]) -> Result<(u16, Value), String> {
    let header_end = find_bytes(raw, b"\r\n\r\n", 0)
        .ok_or_else(|| "HTTP_RESPONSE_HEADERS_INVALID".to_string())?;
    let headers = std::str::from_utf8(&raw[..header_end])
        .map_err(|_| "HTTP_RESPONSE_HEADERS_NOT_UTF8".to_string())?;
    let status = headers
        .lines()
        .next()
        .and_then(|line| line.split_whitespace().nth(1))
        .and_then(|value| value.parse::<u16>().ok())
        .ok_or_else(|| "HTTP_RESPONSE_STATUS_INVALID".to_string())?;
    let body = &raw[header_end + 4..];
    let decoded = if headers
        .lines()
        .any(|line| line.to_ascii_lowercase().starts_with("transfer-encoding: chunked"))
    {
        decode_chunked(body)?
    } else {
        body.to_vec()
    };
    if decoded.is_empty() {
        return Ok((status, Value::Null));
    }
    let data = serde_json::from_slice(&decoded)
        .map_err(|_| "HTTP_RESPONSE_BODY_NOT_JSON".to_string())?;
    Ok((status, data))
}

fn execute_local_adapter(
    contract: CapabilityContract,
    payload: &Value,
) -> Result<(u16, Value), String> {
    let address: SocketAddr = LOOPBACK_ADDRESS
        .parse()
        .map_err(|_| "LOOPBACK_ADDRESS_INVALID".to_string())?;
    let mut stream = TcpStream::connect_timeout(&address, Duration::from_secs(3))
        .map_err(|_| "LOCAL_API_CONNECTION_FAILED".to_string())?;
    let timeout = Duration::from_secs(contract.timeout_seconds);
    stream
        .set_read_timeout(Some(timeout))
        .and_then(|_| stream.set_write_timeout(Some(timeout)))
        .map_err(|_| "LOCAL_API_TIMEOUT_CONFIGURATION_FAILED".to_string())?;
    let body = request_body(contract, payload)?;
    let request = format!(
        "{} {} HTTP/1.1\r\nHost: 127.0.0.1:8080\r\nUser-Agent: Sheikha-Native-Desktop-V4/{}\r\nAccept: application/json\r\nAccept-Encoding: identity\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        contract.method,
        contract.path,
        APP_VERSION,
        body.len()
    );
    stream
        .write_all(request.as_bytes())
        .and_then(|_| stream.write_all(&body))
        .and_then(|_| stream.flush())
        .map_err(|_| "LOCAL_API_REQUEST_WRITE_FAILED".to_string())?;
    let mut raw = Vec::new();
    stream
        .take(MAX_RESPONSE_BYTES + 1)
        .read_to_end(&mut raw)
        .map_err(|_| "LOCAL_API_RESPONSE_READ_FAILED".to_string())?;
    if raw.len() as u64 > MAX_RESPONSE_BYTES {
        return Err("LOCAL_API_RESPONSE_TOO_LARGE".to_string());
    }
    parse_http_response(&raw)
}

#[tauri::command]
fn governed_request(app: AppHandle, request: UiRequest) -> Result<GovernedResponse, String> {
    validate_request(&request)?;
    let payload_hash = payload_sha256(&request.payload)?;
    let contract = match capability_contract(&request.capability) {
        Some(value) => value,
        None => {
            append_audit(
                &app,
                &request,
                &payload_hash,
                "DENIED",
                "NOT_APPLICABLE",
                "CAPABILITY_NOT_ALLOWLISTED",
            )?;
            return Err("CAPABILITY_NOT_ALLOWLISTED".to_string());
        }
    };
    let governance = governance_decision(contract, request.human_approval.as_ref())?;
    append_audit(
        &app,
        &request,
        &payload_hash,
        governance.status,
        governance.human_approval_status,
        "AUTHORIZED",
    )?;
    match execute_local_adapter(contract, &request.payload) {
        Ok((http_status, data)) => {
            let outcome = if (200..300).contains(&http_status) {
                "SUCCEEDED"
            } else {
                "LOCAL_API_REJECTED"
            };
            let audit_sha256 = append_audit(
                &app,
                &request,
                &payload_hash,
                governance.status,
                governance.human_approval_status,
                outcome,
            )?;
            Ok(GovernedResponse {
                ok: (200..300).contains(&http_status),
                request_id: request.request_id,
                capability: request.capability,
                http_status,
                data,
                governance,
                audit_recorded: true,
                audit_sha256,
            })
        }
        Err(error) => {
            append_audit(
                &app,
                &request,
                &payload_hash,
                governance.status,
                governance.human_approval_status,
                "FAILED",
            )?;
            Err(error)
        }
    }
}

#[tauri::command]
fn native_smoke_ready(
    app: AppHandle,
    state: State<'_, RuntimeState>,
    markers: SmokeMarkers,
) -> Result<SmokeAcknowledgement, String> {
    if !markers.window || !markers.health || !markers.chat || !markers.inspector {
        return Err("NATIVE_SMOKE_MARKERS_INCOMPLETE".to_string());
    }
    let main_window = app
        .get_webview_window("main")
        .ok_or_else(|| "NATIVE_SMOKE_MAIN_WINDOW_MISSING".to_string())?;
    let main_window_visible = main_window
        .is_visible()
        .map_err(|error| format!("NATIVE_SMOKE_WINDOW_VISIBILITY_FAILED:{error}"))?;
    if !main_window_visible {
        return Err("NATIVE_SMOKE_MAIN_WINDOW_NOT_VISIBLE".to_string());
    }
    println!("SHEIKHA_NATIVE_DESKTOP_V4_WINDOW_OK");
    println!("SHEIKHA_NATIVE_DESKTOP_V4_HEALTH_OK");
    println!("SHEIKHA_NATIVE_DESKTOP_V4_CHAT_OK");
    println!("SHEIKHA_NATIVE_DESKTOP_V4_INSPECTOR_OK");
    println!("SHEIKHA_NATIVE_DESKTOP_V4_SMOKE_OK");
    let auto_close_scheduled = state.smoke_mode;
    if auto_close_scheduled {
        std::thread::spawn(move || {
            std::thread::sleep(Duration::from_millis(1500));
            println!("SHEIKHA_NATIVE_DESKTOP_V4_CLEAN_SHUTDOWN_OK");
            let _ = std::io::stdout().flush();
            app.exit(0);
        });
    }
    Ok(SmokeAcknowledgement {
        ok: true,
        marker: "SHEIKHA_NATIVE_DESKTOP_V4_SMOKE_OK",
        auto_close_scheduled,
    })
}

fn allowed_navigation(url: &tauri::Url) -> bool {
    match url.scheme() {
        "tauri" | "asset" => true,
        "http" | "https" => url.host_str() == Some("tauri.localhost"),
        _ => false,
    }
}

fn run_desktop(smoke_mode: bool) {
    tauri::Builder::default()
        .manage(RuntimeState { smoke_mode })
        .setup(|app| {
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("شيخة | سطح المكتب")
                .inner_size(1280.0, 820.0)
                .min_inner_size(960.0, 640.0)
                .resizable(true)
                .center()
                .devtools(false)
                .on_navigation(allowed_navigation)
                .build()?;
            println!("SHEIKHA_NATIVE_DESKTOP_V4_LAUNCH_OK");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            governed_request,
            native_smoke_ready
        ])
        .run(tauri::generate_context!())
        .expect("Sheikha native desktop runtime failed");
    println!("SHEIKHA_NATIVE_DESKTOP_V4_CLEAN_SHUTDOWN_OK");
}

fn main() {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    if arguments.iter().any(|argument| argument == "--version") {
        println!("sheikha-native-desktop {}", APP_VERSION);
        return;
    }
    if arguments.iter().any(|argument| argument == "--probe") {
        println!(
            "{{\"system\":\"SHEIKHA_NATIVE_DESKTOP_EXECUTABLE_V4\",\"version\":\"{}\",\"platform\":\"linux\",\"architecture\":\"x86_64\",\"framework\":\"tauri-2\",\"marker\":\"SHEIKHA_NATIVE_DESKTOP_V4_PROBE_OK\"}}",
            APP_VERSION
        );
        return;
    }
    let smoke_mode = arguments.iter().any(|argument| argument == "--smoke");
    run_desktop(smoke_mode);
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request(capability: &str, payload: Value) -> UiRequest {
        UiRequest {
            request_id: "native-v4-test-0001".to_string(),
            actor_id: "human-test".to_string(),
            capability: capability.to_string(),
            payload,
            human_approval: None,
        }
    }

    #[test]
    fn capability_allowlist_is_fixed_to_loopback_routes() {
        let health = capability_contract("runtime.health.read").expect("health contract");
        let chat = capability_contract("chat.message.submit").expect("chat contract");
        assert_eq!(health.method, "GET");
        assert_eq!(health.path, "/api/health");
        assert_eq!(chat.method, "POST");
        assert_eq!(chat.path, "/api/sheikha/conversation-engine/v1/chat");
        assert!(capability_contract("shell.execute").is_none());
        assert!(capability_contract("filesystem.read").is_none());
        assert!(capability_contract("network.request").is_none());
    }

    #[test]
    fn schema_rejects_invalid_request_ids_and_large_messages() {
        let invalid = request("runtime.health.read", json!({}));
        assert!(validate_request(&invalid).is_ok());
        let mut bad = request("runtime.health.read", json!({}));
        bad.request_id = "bad/id".to_string();
        assert_eq!(validate_request(&bad), Err("SCHEMA_REQUEST_ID_INVALID".to_string()));
        let chat = capability_contract("chat.message.submit").expect("chat contract");
        let large = json!({ "message": "x".repeat(MAX_MESSAGE_BYTES + 1) });
        assert_eq!(
            request_body(chat, &large),
            Err("CHAT_MESSAGE_TOO_LARGE".to_string())
        );
    }

    #[test]
    fn governance_keeps_human_authority_final() {
        let contract = capability_contract("chat.message.submit").expect("chat contract");
        let decision = governance_decision(contract, None).expect("low impact decision");
        assert!(decision.human_final_decision);
        assert!(!decision.artificial_intelligence_can_authorize);
        assert_eq!(decision.human_approval_status, "NOT_REQUIRED_READ_ONLY_OR_LOW_IMPACT");
    }

    #[test]
    fn chunked_json_is_decoded_without_external_network_code() {
        let response = b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n7\r\n{\"ok\":t\r\n4\r\nrue}\r\n0\r\n\r\n";
        let (status, body) = parse_http_response(response).expect("chunked response");
        assert_eq!(status, 200);
        assert_eq!(body, json!({ "ok": true }));
    }
}
