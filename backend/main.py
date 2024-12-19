from fastapi import FastAPI, UploadFile, File, HTTPException
from utils.transcription import transcribe_audio
from utils.retrieval import build_index, get_top_k_chunks
from utils.qa import generate_answer
import os

app = FastAPI()
text_chunks = []
index = None
embeddings = None

@app.post("/transcribe/")
async def transcribe(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, file.filename)
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    # Transcribe audio
    transcript = transcribe_audio(temp_path)

    # Build FAISS index
    global text_chunks, index, embeddings
    text_chunks = transcript.split(". ")
    index, embeddings = build_index(text_chunks)

    # Clean up
    os.remove(temp_path)

    return {"transcript": transcript}

@app.post("/ask/")
async def ask_question(question: str):
    global text_chunks, index, embeddings
    if not index:
        raise HTTPException(status_code=400, detail="Please transcribe audio first.")

    # Retrieve top-k relevant text chunks
    top_chunks = get_top_k_chunks(question, index, text_chunks, embeddings, k=3)
    context = " ".join(top_chunks)

    # Generate answer using Cerebras or local model
    answer = generate_answer(context, question)
    return {"answer": answer}
