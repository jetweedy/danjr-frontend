import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE;

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));

  // Log in and get token
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api-token-auth/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      console.log("Received token:", data.token);
      localStorage.setItem('token', data.token);
      setLoggedIn(true);
      setError('');
      loadTasks();
    } catch (err) {
      setError('Login failed. Check username and password.');
    }
  };

  // Fetch tasks with token
  const loadTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("Token used in fetch:", token);
      const response = await fetch(`${API_BASE}/tasks/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) throw new Error('Unauthorized or invalid token');

      const data = await response.json();
      setTasks(data);
      setError('');
    } catch (err) {
      setError('Failed to load tasks. Are you logged in?');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setTasks([]);
  };

  useEffect(() => {
    if (loggedIn) {
      loadTasks();
    }
  }, [loggedIn]);

  return (
    <div>
      <h1>My Tasks</h1>

      {!loggedIn ? (
        <form onSubmit={handleLogin}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>
          <ul>
            {console.log("Fetched tasks:", tasks)}
            {tasks.map((task, i) => (
              <li key={i}>{task.title}</li>
            ))}
          </ul>
        </>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
