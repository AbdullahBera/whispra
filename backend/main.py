from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from utils.transcription import transcribe_audio
from utils.retrieval import build_index, get_top_k_chunks
from utils.qa import generate_answer
import os
import logging
from dotenv import load_dotenv  # Import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to restrict origins if necessary
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for text processing
text_chunks = []
index = None
embeddings = None

# Configure logging
logging.basicConfig(level=logging.INFO)

# Directory for temporary files
TEMP_DIR = os.getenv("TEMP_DIR", "temp")


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Endpoint to transcribe audio and build FAISS index.
    """
    try:
        # Save uploaded file temporarily
        os.makedirs(TEMP_DIR, exist_ok=True)
        temp_path = os.path.join(TEMP_DIR, file.filename)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        logging.info(f"File {file.filename} uploaded and saved at {temp_path}.")

        # Transcribe audio
        transcript = transcribe_audio(temp_path)
        if not transcript:
            raise HTTPException(status_code=500, detail="Transcription failed.")

        logging.info(f"Transcription completed: {transcript[:50]}...")

        # Build FAISS index
        global text_chunks, index, embeddings
        text_chunks = transcript.split(". ")  # Split into sentences or chunks
        index, embeddings = build_index(text_chunks)

        if index is None or embeddings is None:
            raise HTTPException(status_code=500, detail="Failed to build FAISS index.")

        logging.info("FAISS index built successfully.")

        # Clean up temporary file
        os.remove(temp_path)
        logging.info(f"Temporary file {temp_path} deleted.")

        return {"transcript": transcript}

    except Exception as e:
        logging.error(f"Error in /transcribe: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask/")
async def ask_question(question: str):
    """
    Endpoint to answer questions using retrieved context and Cerebras/local model.
    """
    try:
        global text_chunks, index, embeddings
        if not index:
            raise HTTPException(status_code=400, detail="Please transcribe audio first.")

        logging.info(f"Received question: {question}")

        # Retrieve top-k relevant text chunks
        top_chunks = get_top_k_chunks(question, index, text_chunks, embeddings, k=3)
        if not top_chunks:
            raise HTTPException(status_code=404, detail="No relevant chunks found.")

        context = " ".join(top_chunks)
        logging.info(f"Top chunks retrieved: {context[:100]}...")

        # Generate answer using Cerebras or local model
        answer = generate_answer(context, question)
        logging.info(f"Answer generated: {answer}")

        return {"answer": answer}

    except Exception as e:
        logging.error(f"Error in /ask: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    """
    Health check endpoint.
    """
    return {"message": "Whispra backend is running."}
