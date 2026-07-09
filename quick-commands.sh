#!/bin/bash

# 🚀 SHEIKHA CLOUD - Quick Commands
# أوامر سريعة لإدارة منصة سحابة شيخة

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 SHEIKHA CLOUD - QUICK COMMANDS                         ║"
echo "║     أوامر سريعة — تحكم شامل بالنظام                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

show_menu() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}1.${NC}  🚀 Activate All Systems"
    echo -e "${GREEN}2.${NC}  ⚡ Run Performance Optimization"
    echo -e "${GREEN}3.${NC}  🖥️  Run OS Integration Demo"
    echo -e "${GREEN}4.${NC}  🧪 Run Integration Tests"
    echo -e "${GREEN}5.${NC}  📊 Generate Status Report"
    echo -e "${GREEN}6.${NC}  💻 Start REST API Server"
    echo -e "${GREEN}7.${NC}  📈 Start GraphQL Server"
    echo -e "${GREEN}8.${NC}  📊 Start Monitoring (Grafana)"
    echo -e "${GREEN}9.${NC}  🔍 Check Health Status"
    echo -e "${GREEN}10.${NC} 📝 View System Logs"
    echo -e "${GREEN}11.${NC} 🔧 Configure System"
    echo -e "${GREEN}12.${NC} 📖 Show Documentation"
    echo -e "${GREEN}0.${NC}  ❌ Exit"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

activate_all() {
    echo -e "${YELLOW}🚀 Activating all systems...${NC}"
    node activate-all-systems.js
}

optimize_performance() {
    echo -e "${YELLOW}⚡ Running performance optimization...${NC}"
    node optimize-performance.js
}

demo_os() {
    echo -e "${YELLOW}🖥️  Running OS Integration demo...${NC}"
    node demo-sheikha-os-integration.js
}

run_tests() {
    echo -e "${YELLOW}🧪 Running integration tests...${NC}"
    node tests/integration-tests-dev.js
}

status_report() {
    echo -e "${YELLOW}📊 Generating status report...${NC}"
    node PROJECT-STATUS-REPORT.js
}

start_api() {
    echo -e "${YELLOW}💻 Starting REST API Server on port 3000...${NC}"
    node test-server.js
}

start_graphql() {
    echo -e "${YELLOW}📈 Starting GraphQL Server on port 4000...${NC}"
    node js/sheikha-graphql-api.js
}

start_monitoring() {
    echo -e "${YELLOW}📊 Starting monitoring services...${NC}"
    docker-compose -f docker-compose-production.yml up grafana prometheus -d 2>/dev/null || echo "Docker not available. Use: sudo apt install docker-compose"
}

health_check() {
    echo -e "${YELLOW}🔍 Checking system health...${NC}"
    echo ""
    echo "System Health Report:"
    echo "====================="
    echo ""
    
    # Check if services are running
    echo "Checking services..."
    echo ""
    
    if command -v curl &> /dev/null; then
        echo -e "${GREEN}REST API (port 3000):${NC}"
        curl -s http://localhost:3000/api/health | jq . 2>/dev/null || echo "❌ Not responding"
        echo ""
        
        echo -e "${GREEN}GraphQL (port 4000):${NC}"
        curl -s http://localhost:4000/health 2>/dev/null | jq . 2>/dev/null || echo "❌ Not responding"
        echo ""
    fi
    
    echo -e "${GREEN}OS Integration Status:${NC}"
    node -e "
    const {getIntegration} = require('./js/sheikha-os-integration');
    const int = getIntegration();
    int.initialize().then(r => {
        const health = int.getHealthCheck();
        console.log(JSON.stringify(health, null, 2));
    });
    " 2>/dev/null || echo "OS not initialized"
}

view_logs() {
    echo -e "${YELLOW}📝 System Logs:${NC}"
    echo ""
    
    if [ -f "ACTIVATION-REPORT.json" ]; then
        echo "Last Activation Report:"
        tail -20 ACTIVATION-REPORT.json
    else
        echo "No logs available. Run 'Activate All Systems' first."
    fi
}

configure_system() {
    echo -e "${YELLOW}🔧 System Configuration${NC}"
    echo ""
    echo "Available configurations:"
    echo "  1. Database Configuration"
    echo "  2. Cache Configuration"
    echo "  3. Security Settings"
    echo "  4. Performance Tuning"
    echo "  5. Monitoring Setup"
    echo ""
    read -p "Select configuration (1-5): " config_choice
    
    case $config_choice in
        1) echo "Configuring database..." ;;
        2) echo "Configuring cache..." ;;
        3) echo "Configuring security..." ;;
        4) echo "Tuning performance..." ;;
        5) echo "Setting up monitoring..." ;;
        *) echo "Invalid choice" ;;
    esac
}

show_docs() {
    echo -e "${YELLOW}📖 Documentation:${NC}"
    echo ""
    echo "Available documentation:"
    echo ""
    
    docs=(
        "SHEIKHA-OS-INTEGRATION-GUIDE.md"
        "DEPLOYMENT-GUIDE.md"
        "ADVANCED-FEATURES-GUIDE.md"
        "README-FINAL.md"
        "COMPLETE-PROJECT-SUMMARY.md"
    )
    
    for i in "${!docs[@]}"; do
        if [ -f "${docs[$i]}" ]; then
            echo -e "${GREEN}$((i+1)). ${docs[$i]}${NC}"
        fi
    done
    
    echo ""
    read -p "Enter doc number or 'q' to quit: " doc_choice
    
    if [ "$doc_choice" != "q" ]; then
        if [ -n "${docs[$((doc_choice-1))]}" ]; then
            less "${docs[$((doc_choice-1))]}"
        fi
    fi
}

# Main menu loop
if [ $# -eq 0 ]; then
    while true; do
        show_menu
        read -p "Enter your choice (0-12): " choice
        
        case $choice in
            1) activate_all ;;
            2) optimize_performance ;;
            3) demo_os ;;
            4) run_tests ;;
            5) status_report ;;
            6) start_api ;;
            7) start_graphql ;;
            8) start_monitoring ;;
            9) health_check ;;
            10) view_logs ;;
            11) configure_system ;;
            12) show_docs ;;
            0) echo "Exiting..."; exit 0 ;;
            *) echo "Invalid choice. Please try again." ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
        clear
    done
else
    # Direct command execution
    case $1 in
        activate) activate_all ;;
        optimize) optimize_performance ;;
        demo) demo_os ;;
        test) run_tests ;;
        report) status_report ;;
        api) start_api ;;
        graphql) start_graphql ;;
        monitor) start_monitoring ;;
        health) health_check ;;
        logs) view_logs ;;
        config) configure_system ;;
        docs) show_docs ;;
        *)
            echo "Usage: ./quick-commands.sh [command]"
            echo ""
            echo "Commands:"
            echo "  activate   - Activate all systems"
            echo "  optimize   - Run performance optimization"
            echo "  demo       - Run OS integration demo"
            echo "  test       - Run integration tests"
            echo "  report     - Generate status report"
            echo "  api        - Start REST API server"
            echo "  graphql    - Start GraphQL server"
            echo "  monitor    - Start monitoring"
            echo "  health     - Check system health"
            echo "  logs       - View system logs"
            echo "  config     - Configure system"
            echo "  docs       - Show documentation"
            echo ""
            echo "Run without arguments for interactive menu"
            ;;
    esac
fi
