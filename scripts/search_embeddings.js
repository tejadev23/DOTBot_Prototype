const { MongoClient } = require('mongodb');
const fs = require('fs');

// Connection URL (update with your MongoDB URI if different)
const uri = 'mongodb+srv://vishnu23ai:cM1pyTMjulNyDKqI@dotbot-cluster.grahhbu.mongodb.net/?retryWrites=true&w=majority&appName=dotbot-cluster';
const dbName = 'dotbot';
const collectionName = 'spec_chunks';

// Function to calculate cosine similarity
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
  return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
}

async function search(query) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Load pre-generated query embedding
    const queryEmbedding = JSON.parse(fs.readFileSync('query_embedding.json', 'utf8')).embedding;

    // Fetch all embeddings and compute similarity
    const allChunks = await collection.find({}, { projection: { _id: 0, embedding: 1, section_id: 1, title: 1, text: 1 } }).toArray();
    const results = allChunks
      .map(chunk => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 results

    console.log('Search Results:', results);
    return results;
  } catch (error) {
    console.error('Error searching data:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Example usage
search('What are the bidding requirements?').catch(console.dir);