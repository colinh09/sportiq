from openai import AzureOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

print("Loading chat.py...")
client = AzureOpenAI(
    api_key = os.getenv("AZURE_OPENAI_API_KEY"),  
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint= os.getenv("AZURE_OPENAI_ENDPOINT")
)

# Example chat completion request
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
]

response = client.chat.completions.create(
    model=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"),
    messages=messages,
    temperature=0.7,
    max_tokens=1000
)
