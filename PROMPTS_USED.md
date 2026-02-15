# PROMPTS

### 1.
Problem statement A: Private Knowledge Q&A (your mini workspace) Build a web app where I can: 
* add a few documents (text files are enough)
* see the list of uploaded documents 
* ask a question 
* get an answer 
* see “where the answer came from” (show which document and the part of it that helped) 
Make it your own: for example, you can choose how documents are stored and how the UI looks. 

Let's start building this project by using the following techstack: database weaviate, embedding by weaviate, llm by weaviate integration, backend fastapi, frontend next.js, project management git, ide vs code.

### 2.
This will be my structure paper-trace/backend, this dir will have 
app.py 
db.py 
ingest.py 
requirements.txt 
.env 
paper-trace/frontend dir will be standard dir provided by next.js

### 3.
I want to understand why schema is getting created in weaviate when direct collection can be created. I will check if there’s an existing collection if yes then good else a new collection will be created when this collection is created next thing that will happen is ingestion. After collection creation the uploaded text file will be ingested into the vector database and then query operation will be carried out. It will allow user to upload the text file, this text file will go through database creation why because for each file upload a new collection will be created and after some time it will be destroyed automatically, when database is created then the text is ingested into the database and then query operation happens and after sometime this database will be destroyed, user can upload max 5 docs at a time and all these docs will be text, I will be using weaviate 4

### 4.
weaviate.exceptions.WeaviateQueryError: Query call with protocol GRPC search failed with message explorer: get class: vectorize params: could not vectorize input for collection Session_ca7fcf6587064d2e94b7d6a5763b2ca9 with search-type nearText. Make sure a vectorizer module is configured for this collection

I see this error message debug this message

### 5.
There is no such thing as generative-huggingface lets use generative-ollama which is by default integrated on weaviate

### 6.
I will use mistral integration provided by weaviate 

### 7.
As per my thinking I created a session managed collection in a vector database as it isolates the documents from other people and also it self cleans the database after 30 minutes, what do you think about this, is this production grade?

### 8.
I have competed the backend now lets build the frontend

### 9.
The files are getting uploaded and tenants are also getting created but I see error for fetch that says failed to fetch

### 10.
I want you to give me status page code to check the database the backend health and I will deploy this backend on render, frontend on vercel and database is already on weaviate how can I create a status page that centralizes everything in one page?

### 11.
Instead of creating a component I want you to allow user to enter text that says status and then a message bubble will come that tells the status

### 12.
How can I make the frontend show the error message as the popup?