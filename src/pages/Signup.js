// src/pages/Signup.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../auth/firebase';
import { useNavigate } from 'react-router-dom';
import { db } from '../auth/firebase';
import { doc, setDoc } from 'firebase/firestore';


function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState('');


  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

    // Save username and email to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: username,
            email: email,
            createdAt: new Date()
    });
    setSuccess(true);
    console.log('✅ Success flag set!');
    //navigate('/dashboard');
  } catch (err) {
    setError(err.message);
  }
};
console.log('Rendering signup, success:', success);

  return (
    <div style={{ padding: 40 }}>
      <h2>Signup</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && (
        <>
          <p style={{ color: 'green' }}>Account created successfully!</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </>
      )}
      {!success && (
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br /><br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Signup</button>
      </form>
        )}
    </div>
  );
}

export default Signup;
