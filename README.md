# 📄 Paper Trace
> An AI-powered document intelligence platform that allows users to upload text documents and ask contextual questions using semantic search and LLM-powered generation.

- It enables users to upload up to 5 text documents per session and interact with them conversationally.
- Each session is isolated using tenant-based architecture to ensure secure and temporary document storage.
- The system leverages vector search and generative AI to provide context-aware answers grounded strictly in uploaded content.
- The platform follows a modern fullstack architecture with a FastAPI backend, Next.js frontend, and cloud-hosted vector database.

---- 

### How to Run the Project
**1. Clone the Repository:** 
```
git clone https://github.com/aursalan/paper-trace.git
cd paper-trace
```

**2. Backend Setup (FastAPI):**
```
cd backend
python -m venv venv
```

- Activate virtual environment:
  - Windows:
  ```
  venv\Scripts\activate
  ```

  - Mac/Linux
  ```
  source venv/bin/activate
  ```

- Install dependencies:
```
pip install -r requirements.txt
```

- Create a .env file inside backend/:
```
WEAVIATE_URL=your_weaviate_cluster_url
WEAVIATE_API_KEY=your_weaviate_api_key
MISTRAL_API_KEY=your_mistral_api_key
FRONTEND_URL=http://localhost:3000
```

- Start backend:
```
fastapi dev
```

You can now access the backend at http://localhost:8000

**3. Frontend Setup (Next.js)**
```
cd frontend
npm install
```

- Create .env.local inside frontend/:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

- Start frontend:
```
npm run dev
```

You can now access the frontend at http://localhost:3000

---- 

### What is Done
- Multi-file upload (max 5 text documents per session)
- Tenant-based session isolation using Weaviate
- Semantic search with vector embeddings
- LLM-based answer generation grounded in document context
- Source document reference + excerpt display
- Session expiration with automatic cleanup
- Health check endpoint (/health)
- Environment variable based configuration
- CORS secured for production domain

----
### What is Not Done
- Support for PDF / DOCX files
- Streaming token-by-token responses
- User authentication & persistent sessions
- File management (delete / rename documents)
- Chat history persistence
- Rate limiting & abuse protection
- Logging & monitoring dashboard
- Docker-based deployment setup
