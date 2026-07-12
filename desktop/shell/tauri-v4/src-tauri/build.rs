fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(
            tauri_build::AppManifest::new()
                .commands(&["governed_request", "native_smoke_ready"]),
        ),
    )
    .expect("failed to build the governed Sheikha Tauri manifest");
}
