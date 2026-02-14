import weaviate
import os
import weaviate.classes.config as wvc
from weaviate.classes.tenants import Tenant
from dotenv import load_dotenv

load_dotenv()

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_URL"),
    auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    headers={
        "X-Mistral-Api-Key": os.getenv("MISTRAL_API_KEY")
    }
)

GLOBAL_COLLECTION_NAME = "SessionDocuments"

def init_global_collection():
    """
    It creates the main 'Table' with Multi-Tenancy enabled.
    """
    if client.collections.exists(GLOBAL_COLLECTION_NAME):
        print(f"Collection '{GLOBAL_COLLECTION_NAME}' ready.")
        return

    try:
        client.collections.create(
            name=GLOBAL_COLLECTION_NAME,
            
            multi_tenancy_config=wvc.Configure.multi_tenancy(enabled=True),
            
            vectorizer_config=wvc.Configure.Vectorizer.text2vec_mistral(
                model="mistral-embed"
            ),
            
            generative_config=wvc.Configure.Generative.mistral(
                model="open-mistral-7b"
            ),
            
            properties=[
                wvc.Property(name="content", data_type=wvc.DataType.TEXT),
                wvc.Property(name="source", data_type=wvc.DataType.TEXT),
            ]
        )
        print(f"Global Collection '{GLOBAL_COLLECTION_NAME}' created with Multi-Tenancy.")
    except Exception as e:
        print(f"Error initializing collection: {e}")

def create_tenant(session_id: str):
    collection = client.collections.get(GLOBAL_COLLECTION_NAME)
    collection.tenants.create(
        tenants=[Tenant(name=session_id)]
    )
    print(f"Tenant '{session_id}' created.")

def delete_tenant(session_id: str):
    """Wipes the user's data."""
    try:
        collection = client.collections.get(GLOBAL_COLLECTION_NAME)
        collection.tenants.remove([session_id])
        print(f"Tenant '{session_id}' deleted.")
    except Exception as e:
        print(f"Error deleting tenant: {e}")