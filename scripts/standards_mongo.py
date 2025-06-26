# upload_standards_to_mongo.py

import json
from pymongo import MongoClient

# Replace with your MongoDB URI
MONGO_URI = "mongodb+srv://vishnu23ai:cM1pyTMjulNyDKqI@dotbot-cluster.grahhbu.mongodb.net/?retryWrites=true&w=majority&appName=dotbot-cluster"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["dotbot"]
collection = db["construction_standards"]

# Load JSON file
with open("cleaned_standards_for_mongo.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Insert all records
collection.insert_many(data)

print(f"✅ Inserted {len(data)} records into 'construction_standards'")
