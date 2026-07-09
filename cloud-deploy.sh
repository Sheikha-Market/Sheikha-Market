#!/bin/bash

################################################################################
#                                                                              #
#     🌐 نظام شيخة السحابي — سكريبت النشر الموحد                            #
#     Sheikha Cloud Deployment Script v3.0                                   #
#                                                                              #
################################################################################

set -e

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# المتغيرات
PROJECT_NAME="sheikha-os"
VERSION="3.0.0"
DOCKER_IMAGE="$PROJECT_NAME:$VERSION"

# الوظائف المساعدة
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# فحص المتطلبات
check_requirements() {
    print_header "فحص المتطلبات"
    
    local required=("docker" "git")
    for cmd in "${required[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            print_error "$cmd غير مثبت"
            exit 1
        fi
        print_success "$cmd مثبت"
    done
}

# بناء Docker Image
build_docker_image() {
    print_header "بناء Docker Image"
    
    if [ ! -f "Dockerfile" ]; then
        print_error "لم يتم العثور على Dockerfile"
        exit 1
    fi
    
    docker build -t $DOCKER_IMAGE .
    print_success "Docker Image تم بناؤه: $DOCKER_IMAGE"
}

# اختبار محلي
test_locally() {
    print_header "اختبار محلي"
    
    print_info "تشغيل الحاوية..."
    docker run -d \
        -p 3000:3000 \
        -e NODE_ENV=test \
        -e PORT=3000 \
        --name sheikha-test \
        $DOCKER_IMAGE
    
    sleep 3
    
    print_info "اختبار الـ Health Check..."
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Health Check نجح"
    else
        print_error "Health Check فشل"
        docker stop sheikha-test
        docker rm sheikha-test
        exit 1
    fi
    
    docker stop sheikha-test
    docker rm sheikha-test
    print_success "الاختبار المحلي نجح"
}

# النشر على AWS
deploy_aws() {
    print_header "النشر على AWS ECS Fargate"
    
    print_info "المتطلبات: AWS CLI مثبت ومُصرّح"
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI غير مثبت"
        exit 1
    fi
    
    read -p "أدخل AWS Account ID: " AWS_ACCOUNT_ID
    read -p "أدخل AWS Region [us-east-1]: " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}
    
    local ECR_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    print_info "تسجيل الدخول إلى ECR..."
    aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin $ECR_URL
    
    print_info "إنشاء ECR Repository..."
    aws ecr create-repository \
        --repository-name $PROJECT_NAME \
        --region $AWS_REGION || true
    
    print_info "بناء وارسال الـ Image..."
    docker tag $DOCKER_IMAGE $ECR_URL/$DOCKER_IMAGE
    docker push $ECR_URL/$DOCKER_IMAGE
    
    print_success "تم النشر على AWS ECR"
    echo -e "${GREEN}الخطوة التالية: إنشاء ECS Cluster و Service${NC}"
}

# النشر على Heroku
deploy_heroku() {
    print_header "النشر على Heroku"
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI غير مثبت"
        exit 1
    fi
    
    read -p "أدخل اسم التطبيق على Heroku: " HEROKU_APP
    
    print_info "المصادقة مع Heroku..."
    heroku login
    
    print_info "إنشاء التطبيق..."
    heroku create $HEROKU_APP || true
    
    print_info "إضافة MongoDB..."
    heroku addons:create mongolab:sandbox --app $HEROKU_APP || true
    
    print_info "إضافة Redis..."
    heroku addons:create heroku-redis:premium-0 --app $HEROKU_APP || true
    
    print_info "النشر..."
    git push heroku main
    
    print_success "تم النشر على Heroku"
}

# نشر محلي باستخدام Docker Compose
deploy_local() {
    print_header "نشر محلي باستخدام Docker Compose"
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose غير مثبت"
        exit 1
    fi
    
    print_info "تشغيل docker-compose..."
    docker-compose up -d
    
    sleep 3
    
    print_info "التحقق من الصحة..."
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "التطبيق يعمل بنجاح!"
        echo -e "${GREEN}الوصول إلى التطبيق:${NC}"
        echo "  📱 Mobile: http://localhost:3000/mobile"
        echo "  🖥️  OS Dashboard: http://localhost:3000/os"
        echo "  🌐 Main: http://localhost:3000"
    else
        print_error "فشل الاتصال"
        exit 1
    fi
}

# القائمة الرئيسية
show_menu() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}      🌐 نظام شيخة السحابي — خيارات النشر${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo "  1) فحص المتطلبات"
    echo "  2) بناء Docker Image"
    echo "  3) اختبار محلي"
    echo "  4) نشر محلي (Docker Compose)"
    echo "  5) نشر على AWS ECS"
    echo "  6) نشر على Heroku"
    echo "  0) خروج"
    echo ""
}

# البرنامج الرئيسي
main() {
    print_header "🌐 نظام شيخة السحابي — سكريبت النشر v3.0"
    
    while true; do
        show_menu
        read -p "اختر خياراً: " choice
        
        case $choice in
            1) check_requirements ;;
            2) build_docker_image ;;
            3) test_locally ;;
            4) deploy_local ;;
            5) deploy_aws ;;
            6) deploy_heroku ;;
            0)
                print_info "شكراً لاستخدام نظام شيخة!"
                exit 0
                ;;
            *)
                print_error "خيار غير صحيح"
                ;;
        esac
        
        echo ""
        read -p "اضغط Enter للمتابعة..."
    done
}

# تشغيل البرنامج
main
