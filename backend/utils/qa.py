import requests
from cerebras_config import load_api_key
from transformers import pipeline

def generate_answer(context, question):
    try:
        api_key = load_api_key()
        print("Using Cerebras Cloud for Q&A...")
        url = "https://api.cerebras.net/api/v0/qa"  # Replace with the actual endpoint
        payload = {"context": context, "question": question}

        response = requests.post(
            url,
            headers={"Authorization": f"Bearer {api_key}"},
            json=payload
        )

        if response.status_code == 200:
            return response.json()["answer"]
        else:
            raise Exception(f"Cerebras Q&A API failed: {response.text}")

    except Exception as e:
        print(f"Error: {e}. Falling back to local Q&A inference...")
        qa_pipeline = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")
        return qa_pipeline(question=question, context=context)["answer"]
