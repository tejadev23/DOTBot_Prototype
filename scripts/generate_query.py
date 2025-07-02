from sentence_transformers import SentenceTransformer
import json

model = SentenceTransformer('all-MiniLM-L6-v2')

query = input("Enter your search query: ")
query_embedding = model.encode(query).tolist()

with open('query_embedding.json', 'w', encoding='utf-8') as f:
    json.dump({'embedding': query_embedding}, f, indent=2)
print("Query embedding saved to query_embedding.json")