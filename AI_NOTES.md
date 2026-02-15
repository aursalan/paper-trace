# AI Notes

### 1. What I Used AI For
I utilized AI (Gemini and ChatGPT) as Senior Pair Programmers and Technical Architects to accelerate development across the entire stack.

- Backend Development (Assisted by Gemini)
  
  - **Boilerplate & Core Logic:** Gemini generated the initial FastAPI structure, including the lifespan manager for database connections and the BackgroundTasks logic for session cleanup.
    
  - **Weaviate Integration:** It helped write the client logic for schema definition, multi-tenant class creation, and the RAG (Retrieval-Augmented Generation) pipeline.

  - **DevOps & Debugging:** Gemini assisted in resolving "Internal Server Errors," configuring Docker, and managing CORS middleware to allow secure communication with the frontend.


 - Frontend & UX Design (Assisted by ChatGPT)
 
   - **Architectural Guidance:** ChatGPT helped structure the Next.js App Router project, specifically recommending the use of SessionContext to manage global state and avoid prop drilling.
     
   - **Responsive UI Implementation:** It was used to convert a desktop-only AppShell into a mobile-first responsive layout, including a slide-out drawer menu and optimized touch targets.
     
   - **UI Refinement:** I used it to improve visual hierarchy, refine microcopy, and fix framework-specific constraints like the "use client" vs. metadata conflict.

### 2. What I Did Myself
While the AI tools provided code segments and architectural validation, I acted as the Product Owner and Lead Systems Engineer, making all final strategic decisions.
- **System Architecture & Strategy:** I defined the "Private Workspace" requirement and explicitly chose the multi-tenant strategy to ensure user data isolation.
  
- **Strategic Tech Pivots:** I rejected AI suggestions for "Client-Side Embeddings" to fix cloud errors, insisting instead on a native integration approach for a cleaner, production-grade architecture.
  
- **Full Integration & Logic:** I personally implemented the document ingestion pipeline, the chunking strategy, and the session-based TTL (Time-to-Live) cleanup logic.
  
- **Deployment & Security:** I managed the sensitive configuration of the Weaviate Cloud cluster, environment variable wiring (.env), and the final deployment to Render (backend) and Vercel (frontend).
  
- **Manual Validation:** I performed end-to-end testing—from document upload and chunk verification in the database to validating that answers were accurately grounded in the source text.

### 3. Which LLM My Application Uses (and Why)
The Paper Trace application is built using the Mistral AI platform via Weaviate Cloud’s native integration.

The Stack

- Vector Database: **Weaviate Cloud (WCS).**
  
- LLM (Generative): **open-mistral-7b.**
  
- Embeddings: **mistral-embed.**

Why This Choice?

- **Native Integration:** By using Weaviate’s generative-mistral module, the database handles both retrieval and generation in a single API call (near_text). This removes the need for complex "glue code" or orchestration libraries like LangChain.

- **Efficiency & Performance:** Offloading the RAG process to the database layer reduced latency and kept the backend code incredibly clean.

- **Privacy-First Multi-Tenancy:** Weaviate’s architecture allowed me to create isolated, temporary "spaces" for each user session, ensuring that one user’s data never leaks into another's and is easily wiped after 30 minutes.

- **Cost-Effectiveness:** Using Mistral through Weaviate’s integration allowed for high-performance RAG without the need for expensive, separate API keys for every component.