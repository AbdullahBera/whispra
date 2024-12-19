import requests
from cerebras_config import load_api_key
import whisper

def transcribe_audio(file_path):
    try:
        api_key = load_api_key()
        print("Using Cerebras Cloud for transcription...")
        url = "https://api.cerebras.net/api/v0/transcribe"  # Replace with the actual endpoint

        with open(file_path, "rb") as f:
            response = requests.post(
                url,
                headers={"Authorization": f"Bearer {api_key}"},
                files={"file": f}
            )

        if response.status_code == 200:
            return response.json()["transcript"]
        else:
            raise Exception(f"Cerebras API failed: {response.text}")

    except Exception as e:
        print(f"Error: {e}. Falling back to local Whisper transcription...")
        model = whisper.load_model("base")
        result = model.transcribe(file_path)
        return result["text"]
