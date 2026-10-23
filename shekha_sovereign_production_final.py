import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="منظومة شيخة للذكاء الاصطناعي السيادي - Shekha AI Sovereign Core",
    description="النواة المركزية لتحقيق السيادة الرقمية والواقعية، الموجهة بالكتاب والسنة.",
    version="5.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FORBIDDEN_KEYWORDS = ["ربا", "قمار", "احتيال", "فيروس", "تخريب", "احتكار"]

class PromptRequest(BaseModel):
    prompt: str
    target_language: Optional[str] = None
    is_commercial: bool = True

class CleanPaymentRequest(BaseModel):
    amount: float
    enterprise_name: str
    is_charity_waqf: bool = False

@app.get("/")
def read_root():
    return {
        "status": "مفعّل وبإذن الله مستقر على مسار السيادة",
        "system": "منصة شيخة السيادية المركزية 2026",
        "governance": "مستمد بالكامل من الكتاب والسنة"
    }

@app.post("/api/v1/process")
def process_request(request: PromptRequest):
    for word in FORBIDDEN_KEYWORDS:
        if word in request.prompt:
            raise HTTPException(
                status_code=400, 
                detail="عذراً، تم رصد انحراف تشغيلي. بروتوكول السيادة والامتثال يحظر المعاملات الضارة والربوية تلقائياً."
            )
    
    scarcity_status = "نص عام / استشارة أعمال سيادية"
    if request.target_language:
        lang = request.target_language.lower()
        if lang in ["شيخة", "shekha"]:
            scarcity_status = "لغة شيخة السيادية الأصلية (المستقلة بالكامل)"
        elif lang in ["python", "javascript", "c++", "java", "rust", "go"]:
            scarcity_status = "لغة برمجية شائعة تحت المعالجة والاحتواء"
        else:
            scarcity_status = "لغة نادرة أو مخصصة تحت الفهرسة"

    route_type = "مسار الإنتاج التجاري المفوتر المستقل" if request.is_commercial else "مسار النفع العام والتمكين المعرفي الوقفي"

    return {
        "status": "success",
        "language_classification": scarcity_status,
        "production_track": route_type,
        "compliance": "متوافق مع محددات السيادة الأصلية والضوابط الشرعية المتقنة"
    }

@app.post("/api/v1/sovereign-payment")
def process_clean_payment(payload: CleanPaymentRequest):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="المبلغ يجب أن يكون قيمة موجبة حقيقية.")
    track = "حساب الوقف العلمي لتمكين المجتمعات" if payload.is_charity_waqf else "حساب الأرباح التجارية النقية لمنظومة شيخة"
    return {
        "status": "success",
        "message": f"تمت معالجة المعاملة المالية النظيفة بنجاح لصالح {payload.enterprise_name}",
        "allocated_account": track,
        "governance": "معاملة مالية تجارية شرعية خالية من الربا"
    }
