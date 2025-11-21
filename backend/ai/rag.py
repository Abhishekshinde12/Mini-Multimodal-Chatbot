from uuid import uuid4
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings, HuggingFaceInferenceAPIEmbeddings
from langchain_community.vectorstores import Chroma
# from django.conf import settings
import os 

HUGGINGFACEHUB_API_TOKEN = os.getenv('HUGGINGFACEHUB_API_TOKEN')

# 1. Embedding model

# # a. model locally present
# embedding_model = HuggingFaceEmbeddings(
#     model_name="Qwen/Qwen3-Embedding-0.6B"
# )

# b. using inference api
embedding_model = HuggingFaceInferenceAPIEmbeddings(
    api_key=HUGGINGFACEHUB_API_TOKEN,
    model_name="Qwen/Qwen3-Embedding-0.6B"   # or any HF embedding model
)

# 2. Persistent Chroma vector store
vector_store = Chroma(
    collection_name="example_collection",
    embedding_function=embedding_model,
    persist_directory="./chroma_langchain_db"
)

# --- INGESTION ---
def ingest_from_document(file_path):
    loader = PyPDFLoader(file_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=150,
        chunk_overlap=20,
        separators=["\n\n", "\n", " ", ""]
    )

    chunks = splitter.split_documents(docs)

    # Set metadata
    for chunk in chunks:
        chunk.metadata["source"] = file_path

    # Add with unique IDs
    vector_store.add_documents(
        chunks,
        ids=[str(uuid4()) for _ in chunks]
    )

    vector_store.persist()
    return f"Inserted {len(chunks)} chunks from {file_path}"


# --- RETRIEVAL ---
def retrieve_documents(query, k=3):
    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={"k": k}
    )
    return retriever.invoke(query)