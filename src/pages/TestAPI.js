// src/pages/TestAPI.js
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signInAnonymously, onAuthStateChanged, getIdToken } from 'firebase/auth';

const TestAPI = () => {
  const [idToken, setIdToken] = useState(null);

  useEffect(() => {
    // Automatically sign in anonymously
    signInAnonymously(auth).catch((error) => {
      console.error('Anonymous sign-in error:', error);
    });

    // Get ID token once logged in
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await getIdToken(user);
        setIdToken(token);
        console.log('Authenticated as:', user.uid);
      }
    });
  }, []);

  const handleSaveChat = async () => {
    try {
      const response = await fetch('https://api-azjv7cvnxq-uc.a.run.app/save-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`, // Pass the token here
        },
        body: JSON.stringify({
          prompt: 'Test prompt from frontend',
          response: 'This is a test GPT response',
        }),
      });

      const data = await response.json();
      console.log('Response from API:', data);
      alert(JSON.stringify(data));
    } catch (error) {
      console.error('Error hitting the API:', error); 
      alert('API request failed');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Test API Page (With Auth)</h2>
      <button onClick={handleSaveChat} disabled={!idToken}>
        Test Save Chat
      </button>
    </div>
  );
};

export default TestAPI;
