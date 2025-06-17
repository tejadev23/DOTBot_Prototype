// src/pages/Login.js
import React, { useState } from 'react'; // ✅ Fixed: added useState
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../auth/firebase';
import { useNavigate } from 'react-router-dom';
import { facebookAuthProvider } from '../auth/firebase';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithPopup(auth, facebookAuthProvider);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      <hr />
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
      <button onClick={handleFacebookLogin}>Sign in with Facebook</button>
      <p>
        Don't have an account? <a href="/signup">Sign up here</a>
      </p>
      <p>
        <a href="/forgot-password">Forgot Password?</a>
      </p>
    </div>
  );
}

export default Login;
