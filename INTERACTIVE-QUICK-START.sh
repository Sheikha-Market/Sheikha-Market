#!/bin/bash

# 🎊 Sheikha Cloud Platform v3.0 - QUICK START GUIDE
# دليل البدء السريع — منصة سحابة شيخة الموحد

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   🚀 SHEIKHA CLOUD PLATFORM v3.0 - QUICK START GUIDE          ║"
echo "║      دليل البدء السريع — منصة سحابة شيخة الموحد               ║"
echo "║                                                                ║"
echo "║      تم تفعيل وتحسين الكل للأفضل والأحسن ✅                 ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 AVAILABLE COMMANDS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Menu options
show_menu() {
    echo -e "${GREEN}SELECT AN OPTION:${NC}"
    echo ""
    echo -e "${YELLOW}1)${NC} Start All Services (تشغيل جميع الخدمات)"
    echo -e "${YELLOW}2)${NC} Apply Performance Optimizations (تطبيق تحسينات الأداء)"
    echo -e "${YELLOW}3)${NC} Run Advanced OS Optimization (تشغيل تحسين النظام المتقدم)"
    echo -e "${YELLOW}4)${NC} Run Integration Tests (تشغيل اختبارات التكامل)"
    echo -e "${YELLOW}5)${NC} View System Verification Report (عرض تقرير التحقق)"
    echo -e "${YELLOW}6)${NC} Deploy to Production (النشر إلى الإنتاج)"
    echo -e "${YELLOW}7)${NC} View Monitoring Dashboards (عرض لوحات المراقبة)"
    echo -e "${YELLOW}8)${NC} View Complete Reports (عرض التقارير الشاملة)"
    echo -e "${YELLOW}9)${NC} Health Check (فحص صحة النظام)"
    echo -e "${YELLOW}10)${NC} View Advanced Optimization Report (عرض تقرير التحسين المتقدم)"
    echo -e "${YELLOW}0)${NC} Exit (خروج)"
    echo ""
}

# Functions for each command
start_services() {
    echo -e "${GREEN}🚀 Starting all services...${NC}"
    echo "تشغيل جميع الخدمات..."
    echo ""
    node activate-all-systems.js
    echo -e "${GREEN}✅ All services started!${NC}"
}

apply_optimizations() {
    echo -e "${GREEN}⚡ Applying performance optimizations...${NC}"
    echo "تطبيق تحسينات الأداء..."
    echo ""
    node optimize-performance.js
    echo -e "${GREEN}✅ Optimizations applied!${NC}"
}

run_advanced_optimization() {
    echo -e "${GREEN}🔧 Running advanced OS optimization...${NC}"
    echo "تشغيل تحسين النظام المتقدم..."
    echo ""
    node sheikha-os-advanced-optimization.js
    echo -e "${GREEN}✅ Advanced optimization complete!${NC}"
}

run_tests() {
    echo -e "${GREEN}🧪 Running integration tests...${NC}"
    echo "تشغيل اختبارات التكامل..."
    echo ""
    node tests/integration-tests-dev.js
    echo -e "${GREEN}✅ Tests completed!${NC}"
}

view_verification() {
    echo -e "${GREEN}📊 System verification report...${NC}"
    echo "تقرير التحقق من النظام..."
    echo ""
    bash final-master-verification.sh
}

deploy_production() {
    echo -e "${GREEN}🚀 Preparing production deployment...${NC}"
    echo "تحضير النشر إلى الإنتاج..."
    echo ""
    echo -e "${YELLOW}Make sure Docker and Docker Compose are installed!${NC}"
    echo "تأكد من تثبيت Docker و Docker Compose!"
    echo ""
    echo -e "${BLUE}Choose deployment option:${NC}"
    echo "اختر خيار النشر:"
    echo ""
    echo "1) Docker Compose"
    echo "2) Kubernetes"
    echo "3) View deployment script"
    echo ""
    read -p "Enter option (1-3): " deploy_opt
    
    case $deploy_opt in
        1)
            echo "Starting Docker Compose deployment..."
            docker-compose -f docker-compose-production.yml up -d
            ;;
        2)
            echo "Starting Kubernetes deployment..."
            kubectl apply -f kubernetes-manifests/
            ;;
        3)
            echo "Showing deployment script..."
            cat deploy-production.sh
            ;;
        *)
            echo "Invalid option"
            ;;
    esac
}

view_dashboards() {
    echo -e "${GREEN}📊 Monitoring dashboards available:${NC}"
    echo "لوحات المراقبة المتاحة:"
    echo ""
    echo -e "${BLUE}Grafana:${NC}      http://localhost:3000"
    echo -e "${BLUE}Prometheus:${NC}   http://localhost:9090"
    echo -e "${BLUE}Kibana:${NC}       http://localhost:5601"
    echo -e "${BLUE}API Health:${NC}   http://localhost:3000/health"
    echo ""
    read -p "Open dashboard in browser? (y/n): " open_dash
    if [[ $open_dash == "y" || $open_dash == "Y" ]]; then
        read -p "Which dashboard? (1=Grafana, 2=Prometheus, 3=Kibana): " dash_choice
        case $dash_choice in
            1) xdg-open http://localhost:3000 ;;
            2) xdg-open http://localhost:9090 ;;
            3) xdg-open http://localhost:5601 ;;
        esac
    fi
}

view_reports() {
    echo -e "${GREEN}📋 Available reports:${NC}"
    echo "التقارير المتاحة:"
    echo ""
    echo "1) Final Achievement Report (تقرير الإنجازات النهائي)"
    echo "2) Comprehensive Data Summary (ملخص البيانات الشامل)"
    echo "3) Final Completion Checklist (قائمة الاكتمال النهائية)"
    echo "4) Completion Summary (ملخص الاكتمال)"
    echo "5) Master Completion Summary (الملخص الرئيسي الشامل)"
    echo ""
    read -p "Enter choice (1-5): " report_choice
    
    case $report_choice in
        1) node FINAL-ACHIEVEMENT-REPORT.js ;;
        2) node COMPREHENSIVE-DATA-SUMMARY.js ;;
        3) node FINAL-COMPREHENSIVE-CHECKLIST.js ;;
        4) node FINAL-COMPLETION-SUMMARY.js ;;
        5) cat MASTER-COMPLETION-SUMMARY.md ;;
        *) echo "Invalid option" ;;
    esac
}

health_check() {
    echo -e "${GREEN}💓 Running health checks...${NC}"
    echo "إجراء فحوصات الصحة..."
    echo ""
    
    # Check API
    echo -n "API Health: "
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Check PostgreSQL
    echo -n "PostgreSQL: "
    if nc -z localhost 5432 > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Check Redis
    echo -n "Redis: "
    if nc -z localhost 6379 > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Check Prometheus
    echo -n "Prometheus: "
    if nc -z localhost 9090 > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Check GraphQL
    echo -n "GraphQL: "
    if nc -z localhost 4000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    echo ""
}

view_advanced_report() {
    echo -e "${GREEN}📊 Advanced OS Optimization Report${NC}"
    echo "تقرير تحسين نظام شيخة الموحد المتقدم"
    echo ""
    if [ -f "SHEIKHA-OS-ADVANCED-OPTIMIZATION-REPORT.json" ]; then
        cat SHEIKHA-OS-ADVANCED-OPTIMIZATION-REPORT.json | python3 -m json.tool | head -100
        echo ""
        echo -e "${YELLOW}... (report saved in SHEIKHA-OS-ADVANCED-OPTIMIZATION-REPORT.json)${NC}"
    else
        echo -e "${RED}Report not found. Run advanced optimization first.${NC}"
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice [0-10]: " choice
    
    case $choice in
        1) start_services ;;
        2) apply_optimizations ;;
        3) run_advanced_optimization ;;
        4) run_tests ;;
        5) view_verification ;;
        6) deploy_production ;;
        7) view_dashboards ;;
        8) view_reports ;;
        9) health_check ;;
        10) view_advanced_report ;;
        0) 
            echo ""
            echo -e "${GREEN}Thank you for using Sheikha Cloud Platform v3.0!${NC}"
            echo "شكراً لاستخدامك منصة سحابة شيخة الموحد!"
            exit 0
            ;;
        *) 
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${BLUE}─────────────────────────────────────────────────────────────${NC}"
    echo ""
    read -p "Press Enter to continue..."
    clear
done
