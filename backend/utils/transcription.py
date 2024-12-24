import requests
from cerebras_config import load_api_key, load_api_url  # Import both load_api_key and load_api_url
import whisper


def transcribe_audio(file_path):
    """
    Transcribes an audio file using the Cerebras API for fast inference.
    Falls back to Whisper transcription if Cerebras API fails.
    
    Args:
        file_path (str): Path to the audio file.

    Returns:
        str: The transcription text.
    """
    try:
        # Load the API key and URL
        api_key = load_api_key()
        api_url = load_api_url()
        
        print("Using Cerebras Cloud for transcription...")
        
        # Open the file and send it to the Cerebras API
        with open(file_path, "rb") as f:
            response = requests.post(
                f"{api_url}/transcribe",  # Add `/transcribe` to the URL
                headers={"Authorization": f"Bearer {api_key}"},
                files={"file": f}
            )
        
        # Handle the API response
        if response.status_code == 200:
            return response.json().get("transcript", "No transcript found.")
        else:
            raise Exception(f"Cerebras API failed: {response.status_code} - {response.text}")
    
    except Exception as e:
        # Log the error and fallback to Whisper
        print(f"Error: {e}. Falling back to local Whisper transcription...")
        
        # Load the Whisper model and transcribe
        model = whisper.load_model("base")
        result = model.transcribe(file_path)
        return result["text"]
