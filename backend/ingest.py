from db import client, GLOBAL_COLLECTION_NAME

def chunk_text(text, chunk_size=500):
    paragraphs = text.split("\n\n")
    chunks = []
    for p in paragraphs:
        p = p.strip()
        if not p: continue
        if len(p) < 1000:
            chunks.append(p)
        else:
            for i in range(0, len(p), chunk_size):
                chunks.append(p[i:i+chunk_size])
    return chunks

def ingest_files(session_id: str, files_data: list):
    collection = client.collections.get(GLOBAL_COLLECTION_NAME)
    
    tenant_collection = collection.with_tenant(session_id)
    
    with tenant_collection.batch.dynamic() as batch:
        for file in files_data:
            chunks = chunk_text(file['content'])
            
            for chunk in chunks:
                batch.add_object(
                    properties={
                        "content": chunk,
                        "source": file['filename']
                    }
                )
                
    if tenant_collection.batch.failed_objects:
        print(f"Errors importing for {session_id}: {tenant_collection.batch.failed_objects}")
    else:
        print(f"Ingestion complete for {session_id}")