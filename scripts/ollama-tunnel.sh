#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🧠 Sheikha Ollama SSH Tunnel Manager
# منظومة شيخة — مدير نفق SSH لـ Ollama
# ═══════════════════════════════════════════════════════════════════════════════

set -e

VPS_HOST="31.97.190.74"
VPS_SSH_USER="root"
VPS_OLLAMA_PORT="11434"
LOCAL_TUNNEL_PORT="11435"

TUNNEL_PID_FILE="/tmp/sheikha-ollama-tunnel.pid"
LOG_FILE="/tmp/sheikha-ollama-tunnel.log"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─── FUNCTIONS ────────────────────────────────────────────────────────────────

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  🧠 Sheikha Ollama SSH Tunnel Manager                    ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_status() {
    echo -e "${GREEN}[✅]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[ℹ️ ]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️ ]${NC} $1"
}

start_tunnel() {
    print_header
    echo ""
    print_info "Starting SSH tunnel to VPS Ollama..."
    echo "  • VPS Host: $VPS_HOST"
    echo "  • VPS Port: $VPS_OLLAMA_PORT"
    echo "  • Local Port: $LOCAL_TUNNEL_PORT"
    echo ""
    
    # Check if tunnel already running
    if [ -f "$TUNNEL_PID_FILE" ]; then
        OLD_PID=$(cat "$TUNNEL_PID_FILE")
        if kill -0 "$OLD_PID" 2>/dev/null; then
            print_warning "Tunnel already running (PID: $OLD_PID)"
            test_tunnel
            return 0
        else
            print_info "Removing stale PID file..."
            rm -f "$TUNNEL_PID_FILE"
        fi
    fi
    
    # Start SSH tunnel
    if ssh -f -N -o StrictHostKeyChecking=no \
        -L "$LOCAL_TUNNEL_PORT:localhost:$VPS_OLLAMA_PORT" \
        "$VPS_SSH_USER@$VPS_HOST" 2>"$LOG_FILE"; then
        
        # Get the PID of the SSH process
        TUNNEL_PID=$(ps aux | grep "ssh -f -N" | grep -v grep | awk '{print $2}' | head -1)
        if [ -n "$TUNNEL_PID" ]; then
            echo "$TUNNEL_PID" > "$TUNNEL_PID_FILE"
            print_status "SSH tunnel started (PID: $TUNNEL_PID)"
        else
            print_warning "Could not determine tunnel PID, but tunnel should be running"
        fi
        
        # Give tunnel time to establish
        sleep 2
        
        # Test connection
        test_tunnel
    else
        print_error "Failed to start SSH tunnel"
        echo "Log:"
        cat "$LOG_FILE"
        return 1
    fi
}

stop_tunnel() {
    print_header
    echo ""
    
    if [ -f "$TUNNEL_PID_FILE" ]; then
        PID=$(cat "$TUNNEL_PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID" 2>/dev/null
            print_status "SSH tunnel stopped (PID: $PID)"
            rm -f "$TUNNEL_PID_FILE"
        else
            print_info "Tunnel PID ($PID) not running"
            rm -f "$TUNNEL_PID_FILE"
        fi
    else
        print_warning "No tunnel PID file found"
    fi
    
    echo ""
}

test_tunnel() {
    echo ""
    print_info "Testing tunnel connection..."
    
    if curl -m 5 -sf "http://localhost:$LOCAL_TUNNEL_PORT/api/tags" > /tmp/ollama_tags.json 2>/dev/null; then
        MODELS=$(jq -r '.models[] | .name' /tmp/ollama_tags.json 2>/dev/null | tr '\n' ',' | sed 's/,$//')
        print_status "SSH tunnel working!"
        echo "  • Endpoint: http://localhost:$LOCAL_TUNNEL_PORT"
        echo "  • Models: $MODELS"
        
        if echo "$MODELS" | grep -q "Sheikha-Core"; then
            print_status "Sheikha-Core model detected on VPS"
        else
            print_warning "Sheikha-Core model not found on VPS"
        fi
    else
        print_error "Cannot connect through tunnel to VPS Ollama"
        print_info "Try: ssh root@$VPS_HOST 'curl http://localhost:11434/api/tags'"
        return 1
    fi
}

status_tunnel() {
    print_header
    echo ""
    
    if [ -f "$TUNNEL_PID_FILE" ]; then
        PID=$(cat "$TUNNEL_PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            print_status "SSH tunnel is RUNNING (PID: $PID)"
            test_tunnel
        else
            print_error "Tunnel PID file exists but process not running"
            rm -f "$TUNNEL_PID_FILE"
        fi
    else
        print_warning "No active SSH tunnel"
    fi
    
    # Also check local Ollama
    echo ""
    print_info "Checking local Ollama (localhost:11434)..."
    if curl -m 5 -sf "http://localhost:11434/api/tags" > /tmp/ollama_local.json 2>/dev/null; then
        LOCAL_MODELS=$(jq -r '.models[] | .name' /tmp/ollama_local.json 2>/dev/null | tr '\n' ',' | sed 's/,$//')
        print_status "Local Ollama is RUNNING"
        echo "  • Models: $LOCAL_MODELS"
    else
        print_error "Local Ollama not responding on localhost:11434"
    fi
    
    echo ""
}

usage() {
    cat << EOF
Usage: $(basename "$0") [COMMAND]

Commands:
  start       Start SSH tunnel to VPS Ollama (runs in background)
  stop        Stop SSH tunnel
  status      Show tunnel and local Ollama status
  test        Test tunnel connection
  help        Show this help message

Examples:
  # Start tunnel for production VPS access
  $(basename "$0") start
  
  # Check if tunnel is running
  $(basename "$0") status
  
  # Stop tunnel when done
  $(basename "$0") stop

Configuration:
  VPS Host:          $VPS_HOST
  VPS Ollama Port:   $VPS_OLLAMA_PORT
  Local Tunnel Port: $LOCAL_TUNNEL_PORT
  PID File:          $TUNNEL_PID_FILE
  Log File:          $LOG_FILE

SSH Tunnel Details:
  Command: ssh -L $LOCAL_TUNNEL_PORT:localhost:$VPS_OLLAMA_PORT root@$VPS_HOST
  
  Once tunnel is running, access VPS Ollama at:
    http://localhost:$LOCAL_TUNNEL_PORT/api/tags

EOF
}

# ─── MAIN ────────────────────────────────────────────────────────────────────

case "${1:-status}" in
    start)
        start_tunnel
        ;;
    stop)
        stop_tunnel
        ;;
    status)
        status_tunnel
        ;;
    test)
        test_tunnel
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        usage
        exit 1
        ;;
esac
