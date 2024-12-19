from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

def build_index(text_chunks):
    embeddings = model.encode(text_chunks)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(np.array(embeddings))
    return index, embeddings

def get_top_k_chunks(question, index, text_chunks, embeddings, k=3):
    question_embedding = model.encode([question])
    distances, indices = index.search(np.array(question_embedding), k)
    return [text_chunks[i] for i in indices[0]]
