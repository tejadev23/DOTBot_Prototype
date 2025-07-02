const { MongoClient } = require('mongodb');
const fs = require('fs');
const readline = require('readline');

// Connection URL (update with your MongoDB URI if different)
const uri = 'mongodb+srv://vishnu23ai:cM1pyTMjulNyDKqI@dotbot-cluster.grahhbu.mongodb.net/?retryWrites=true&w=majority&appName=dotbot-cluster';
const dbName = 'dotbot';
const specCollectionName = 'spec_chunks';
const chartCollectionName = 'construction_standards'; // New collection for chart metadata

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
    const specCollection = db.collection(specCollectionName);
    const chartCollection = db.collection(chartCollectionName);

    // Load pre-generated query embedding
    const queryEmbedding = JSON.parse(fs.readFileSync('query_embedding.json', 'utf8')).embedding;

    // Search spec chunks
    const allChunks = await specCollection.find({}, { projection: { _id: 0, embedding: 1, section_id: 1, title: 1, text: 1 } }).toArray();
    const specResults = allChunks
      .map(chunk => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 1); // Top 1 spec result

    // Search chart metadata (simple keyword match for now)
    const chartResults = await chartCollection.find({
      $or: [
        { description: { $regex: query, $options: 'i' } },
        { standard_id: { $regex: query, $options: 'i' } }
      ]
    }).toArray();

    // Combine response
    let response = specResults.length ? specResults[0].text : 'Sorry, I couldn’t find a relevant answer in the specs.';
    if (chartResults.length) {
      response += `\n\nRelated Chart Details:\n`;
      chartResults.forEach(chart => {
        response += `- Standard ID: ${chart.standard_id}, Description: ${chart.description}, Image: ${chart.image_url}\n`;
      });
    }

    console.log('Chatbot Response:', response);
    return response;
  } catch (error) {
    console.error('Error searching data:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Set up readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion() {
  rl.question('Ask me anything about the specifications or standards (or type "exit" to quit): ', async (query) => {
    if (query.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    // Generate query embedding using Python script
    const { exec } = require('child_process');
    exec(`python scripts/generate_embeddings.py "${query}"`, (error) => {
      if (error) {
        console.error('Error generating embedding:', error);
        return;
      }

      // Perform search after embedding is generated
      search(query).then(() => askQuestion());
    });
  });
}

// Start the chatbot
console.log('Welcome to the DOTBot Chatbot! I can answer questions about specifications and construction standards.');
askQuestion();