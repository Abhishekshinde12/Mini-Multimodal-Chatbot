import os
from uuid import uuid4
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_chroma import Chroma 

# now the chroma store stored in the same folder as the ai/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # ai/ folder
PERSIST_DIR = os.path.join(BASE_DIR, "chroma_langchain_db")

# 1. Loading env variable - django loads it automatically

# 2. Embedding model
embedding_model = HuggingFaceEndpointEmbeddings(
    # model="Qwen/Qwen2.5-Coder-32B-Instruct", # might not have inference API so using sentence transformer
    model="sentence-transformers/all-MiniLM-L6-v2",
    task='feature-extraction',
    # huggingfacehub_api_token='hf_token_goes_here' # used when running file alone
)


# 3. Persistent Chroma vector store
vector_store = Chroma(
    collection_name="example_collection",
    embedding_function=embedding_model,
    persist_directory=PERSIST_DIR
)

# --- INGESTION ---
def ingest_from_document(file_path, chat_id):
    if not os.path.exists(file_path):
        return f"Error: File {file_path} does not exist."

    try:
        print(f"Loading {file_path}...")
        loader = PyPDFLoader(file_path)
        docs = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", " ", ""]
        )

        chunks = splitter.split_documents(docs)

        # Set metadata
        for chunk in chunks:
            chunk.metadata["source"] = file_path
            chunk.metadata["chat_id"] = str(chat_id)

        print(f"Adding {len(chunks)} chunks to Vector Store...")
        
        # Add with unique IDs
        vector_store.add_documents(
            chunks,
            ids=[str(uuid4()) for _ in chunks]
        )
        
        # vector_store.persist() is NOT needed in newer versions (it is automatic)
        return f"Successfully inserted {len(chunks)} chunks."

    except Exception as e:
        return f"Ingestion Error: {str(e)}"



# --- RETRIEVAL ---
def retrieve_documents(query, chat_id, k=3):
    try:
        # Check if collection is empty to prevent errors
        if vector_store._collection.count() == 0:
            print("Vector Store is Empty !!!!")
            return []

        retriever = vector_store.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k" : k,
                "filter": {"chat_id" : str(chat_id)}       
            }
        )

        # retrieved relevant docs
        output = retriever.invoke(query)
        
        # storing the page content in list to provide as context
        results = []
        for i, doc in enumerate(output):
            results.append(f"Result {i+1}:\n{doc.page_content}\nSource: {doc.metadata.get('source', 'unknown')}\n")
        
        return "\n".join(results)

    except Exception as e:
        return f"Retrieval Error: {str(e)}"



# --- MAIN EXECUTION ---
if __name__ == "__main__":
    # 1. Ingest a file
    pdf_path = "resume.pdf" 
    chat_id = ""
    print(ingest_from_document(pdf_path, chat_id))

    # 2. Retrieve
    query = "How are you?"
    print(f"Querying: {query}")
    print("-" * 30)
    print(retrieve_documents(query, chat_id))