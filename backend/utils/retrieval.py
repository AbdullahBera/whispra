import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Initialize SBERT model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize FAISS index
dimension = 384  # SBERT embedding size
index = faiss.IndexFlatL2(dimension)

# Metadata storage (map embeddings to text or IDs)
metadata = {}

def add_embedding(text, metadata_id):
    """
    Add an embedding to FAISS index with metadata.
    """
    embedding = model.encode([text])
    index.add(np.array(embedding))  # Add to FAISS
    metadata[len(metadata)] = {"id": metadata_id, "text": text}

def search_embeddings(query, k=5):
    """
    Search for similar embeddings.
    """
    query_embedding = model.encode([query])
    distances, indices = index.search(np.array(query_embedding), k)
    results = [metadata[i] for i in indices[0] if i in metadata]
    return results
