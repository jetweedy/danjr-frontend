import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE;

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));

  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`,
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api-token-auth/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error('Login failed');

      const data = await res.json();
      localStorage.setItem('token', data.token);
      setLoggedIn(true);
      setError('');
      loadTasks();
    } catch {
      setError('Login failed. Check your credentials.');
    }
  };

  const loadTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks/`, { headers });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load tasks.');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await fetch(`${API_BASE}/tasks/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: newTask }),
      });
      setNewTask('');
      loadTasks();
    } catch {
      setError('Failed to add task.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}/`, {
        method: 'DELETE',
        headers,
      });
      loadTasks();
    } catch {
      setError('Failed to delete task.');
    }
  };

  const handleEdit = async (id) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ title: editingText }),
      });
      setEditingId(null);
      setEditingText('');
      loadTasks();
    } catch {
      setError('Failed to update task.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setTasks([]);
  };

  useEffect(() => {
    if (loggedIn) loadTasks();
  }, [loggedIn]);

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>My Tasks</h1>

      {!loggedIn ? (
        <form onSubmit={handleLogin}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>

          <form onSubmit={handleAdd}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="New task"
            />
            <button type="submit">Add</button>
          </form>

          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                {editingId === task.id ? (
                  <>
                    <input value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                    <button onClick={() => handleEdit(task.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    {task.title}
                    <button onClick={() => {
                      setEditingId(task.id);
                      setEditingText(task.title);
                    }}>Edit</button>
                    <button onClick={() => handleDelete(task.id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
