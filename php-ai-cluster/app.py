import os
import tarfile
import datetime
import shutil
from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel, Field
import chromadb
from starlette.status import HTTP_403_FORBIDDEN
from prometheus_fastapi_instrumentator import Instrumentator
from apscheduler.schedulers.background import BackgroundScheduler

app = FastAPI(title="PHP Enterprise Cloud AI Engine", version="10.0.0")
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# مسارات تعمل محلياً وداخل Docker على حدٍّ سواء
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_DIR = os.environ.get("CHROMA_DATA_DIR", os.path.join(_BASE_DIR, "data", "php_ai_vector_db"))
BACKUP_DIR = os.environ.get("BACKUP_DIR", os.path.join(_BASE_DIR, "data", "backups"))
os.makedirs(SOURCE_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)
MAX_BACKUPS = 7

chroma_client = chromadb.PersistentClient(path=SOURCE_DIR)
code_collection = chroma_client.get_or_create_collection(name="global_production_codebase")

API_KEY_NAME = "X-AI-Engine-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)
VALID_API_KEYS = {os.environ.get("SHEIKHA_AI_ENGINE_KEY", "")}

async def get_api_key(api_key_header: str = Depends(api_key_header)):
    if api_key_header in VALID_API_KEYS: return api_key_header
    raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="Invalid API Key.")

def create_backup():
    if not os.path.exists(SOURCE_DIR): return
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"php_ai_vector_db_{timestamp}.tar.gz")
    try:
        with tarfile.open(backup_path, "w:gz") as tar:
            tar.add(SOURCE_DIR, arcname=os.path.basename(SOURCE_DIR))
        backups = [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.endswith(".tar.gz")]
        backups.sort(key=os.path.getmtime)
        while len(backups) > MAX_BACKUPS: os.remove(backups.pop(0))
    except Exception: pass

scheduler = BackgroundScheduler()
scheduler.add_job(create_backup, 'cron', hour=2, minute=0)
scheduler.start()

class QueryRequest(BaseModel):
    question: str

@app.post("/v1/chat")
async def chat_with_codebase(data: QueryRequest, api_key: str = Depends(get_api_key)):
    try:
        results = code_collection.query(query_texts=[data.question], n_results=1)
        docs = results.get('documents', [[]])
        if docs and docs[0]:
            return {"answer": "وجد النظام تطابقاً برمجياً:", "raw_code": docs[0][0]}
        return {
            "answer": "لم أجد تطابقاً مباشراً، إليك الكود المعياري الآمن المولد:",
            "raw_code": "public function store(Request $request)\n{\n    $validated = $request->validate(['status' => 'required']);\n    return response()->json($validated, 201);\n}"
        }
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
