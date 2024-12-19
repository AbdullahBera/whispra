import os
import json

CONFIG_FILE = os.path.expanduser("~/.cerebras_config")

def save_api_key(api_key):
    with open(CONFIG_FILE, "w") as f:
        json.dump({"api_key": api_key}, f)
    print("Cerebras API key saved successfully!")

def load_api_key():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r") as f:
            return json.load(f).get("api_key")
    else:
        print("Cerebras API key not found.")
        api_key = input("Please enter your Cerebras API key: ").strip()
        save_api_key(api_key)
        return api_key
