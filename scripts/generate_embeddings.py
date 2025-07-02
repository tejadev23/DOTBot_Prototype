from sentence_transformers import SentenceTransformer
import json
import os

# Load the pre-trained model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load the chunked data
with open('spec_chunks.json', 'r', encoding='utf-8') as f:
    chunks = json.load(f)

# Generate embeddings for each chunk
embedded_chunks = []
for chunk in chunks:
    embedding = model.encode(chunk['text']).tolist()  # Convert to list for JSON compatibility
    embedded_chunks.append({
        'section_id': chunk['section_id'],
        'title': chunk['title'],
        'text': chunk['text'],
        'embedding': embedding
    })

# Save the result with embeddings
with open('spec_chunks.json', 'w', encoding='utf-8') as f:
    json.dump(embedded_chunks, f, indent=2)
print(f"Generated embeddings for {len(embedded_chunks)} chunks and saved to spec_chunks.json")