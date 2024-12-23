import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

class EmbeddingManager:
    def __init__(self):
        # Initialize SBERT model
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.dimension = 384  # SBERT embedding size
        self.reset_index()

    def reset_index(self):
        """Reset the FAISS index and metadata"""
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata = {}

# Create a global instance
embedding_manager = EmbeddingManager()

def build_index(text_chunks):
    """
    Build FAISS index from text chunks.
    Returns index and embeddings for future use.
    """
    # Reset the index for new transcription
    embedding_manager.reset_index()
    
    # Generate embeddings for all chunks
    embeddings = embedding_manager.model.encode(text_chunks)
    
    # Add to FAISS index
    embedding_manager.index.add(np.array(embeddings))
    
    # Store text chunks as metadata
    for i, text in enumerate(text_chunks):
        embedding_manager.metadata[i] = {"id": str(i), "text": text}
    
    return embedding_manager.index, embeddings

def get_top_k_chunks(query, index, text_chunks, embeddings, k=3):
    """
    Retrieve top-k most relevant chunks for a query.
    """
    query_embedding = embedding_manager.model.encode([query])
    distances, indices = index.search(np.array(query_embedding), k)
    
    # Return the corresponding text chunks
    return [text_chunks[i] for i in indices[0]]

def add_embedding(text, metadata_id):
    """
    Add a single embedding to FAISS index with metadata.
    """
    embedding = embedding_manager.model.encode([text])
    embedding_manager.index.add(np.array(embedding))
    embedding_manager.metadata[len(embedding_manager.metadata)] = {
        "id": metadata_id, 
        "text": text
    }

def search_embeddings(query, k=5):
    """
    Search for similar embeddings using metadata.
    """
    query_embedding = embedding_manager.model.encode([query])
    distances, indices = embedding_manager.index.search(np.array(query_embedding), k)
    results = [embedding_manager.metadata[i] for i in indices[0] 
              if i in embedding_manager.metadata]
    return results