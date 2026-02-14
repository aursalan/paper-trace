import uuid
import asyncio
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from typing import List
from pydantic import BaseModel
from contextlib import asynccontextmanager

from db import init_global_collection, create_tenant, delete_tenant, client, GLOBAL_COLLECTION_NAME
from ingest import ingest_files
from dotenv import load_dotenv
import os

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up... connecting to Weaviate.")
    init_global_collection()
    yield
    print("Shutting down... closing connection.")
    client.close()

app = FastAPI(lifespan=lifespan)

FRONTEND_URL = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SESSION_TTL = 1800 

async def schedule_tenant_deletion(session_id: str):
    """Wait for TTL then delete the tenant."""
    await asyncio.sleep(SESSION_TTL)
    delete_tenant(session_id)

@app.post("/upload")
async def upload_documents(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Max 5 files allowed")
    
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    session_id = f"sess_{uuid.uuid4().hex}"
    
    try:
        files_data = []
        for file in files:
            content = await file.read()
            
            try:
                text_content = content.decode("utf-8")
            except UnicodeDecodeError:
                print(f"Skipping binary file: {file.filename}")
                continue
            
            files_data.append({
                "filename": file.filename,
                "content": text_content
            })

        if not files_data:
            raise HTTPException(
                status_code=400, 
                detail="No valid text files found. Please upload .txt files."
            )

        create_tenant(session_id)

        ingest_files(session_id, files_data)

        background_tasks.add_task(schedule_tenant_deletion, session_id)

        return {
            "session_id": session_id, 
            "message": "Files uploaded. You can now ask questions."
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/documents/{session_id}")
def list_documents(session_id: str):
    try:
        collection = client.collections.get(GLOBAL_COLLECTION_NAME)
        tenant_collection = collection.with_tenant(session_id)

        response = tenant_collection.query.fetch_objects(
            limit=100
        )

        docs = list(set(
            obj.properties.get("source")
            for obj in response.objects
        ))

        return {"documents": docs}

    except Exception as e:
        if "tenant" in str(e).lower() and "not found" in str(e).lower():
             return {"documents": []}
        raise HTTPException(status_code=500, detail=str(e))

class QueryRequest(BaseModel):
    session_id: str
    question: str

@app.post("/ask")
def ask_question(req: QueryRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        collection = client.collections.get(GLOBAL_COLLECTION_NAME)
        
        tenant_collection = collection.with_tenant(req.session_id)
        
        response = tenant_collection.generate.near_text(
            query=req.question,
            limit=2,
            single_prompt=f"Answer the question based ONLY on the following context: {{content}}. Question: {req.question}"
        )

        if response.objects:
            best_match = response.objects[0]
            
            return {
                "answer": best_match.generated,
                "source_document": best_match.properties.get('source'),
                "source_excerpt": best_match.properties.get('content')
            }
        
        return {
            "answer": "I couldn't find an answer in the documents.", 
            "source_document": None, 
            "source_excerpt": None
        }

    except Exception as e:
        print(f"Query Error: {str(e)}")
        if "tenant" in str(e).lower() and "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Session expired or invalid.")
            
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Aggregates health status of Backend, Database (Weaviate), and LLM Integration.
    """
    status_report = {
        "backend": "online",
        "database": "unknown",
        "llm_integration": "unknown"
    }

    try:
        if client.is_ready():
            status_report["database"] = "connected"
        else:
            status_report["database"] = "unresponsive"
    except Exception as e:
        status_report["database"] = f"error: {str(e)}"

    if status_report["database"] == "connected":
        status_report["llm_integration"] = "active"
    else:
        status_report["llm_integration"] = "disconnected"

    return status_report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)