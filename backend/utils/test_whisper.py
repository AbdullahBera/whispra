import whisper

model = whisper.load_model("base")
result = model.transcribe("/Users/bera/Desktop/audio.mp3")
print(result["text"])
