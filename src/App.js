import { useEffect, useState } from "react";

function App() {
  const [editingId, setEditingId] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });

  // Fetch tasks from the backend
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    fetch(`${process.env.REACT_APP_API_BASE}/tasks/`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Error fetching tasks:", err));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${process.env.REACT_APP_API_BASE}/tasks/${editingId}/`
      : `${process.env.REACT_APP_API_BASE}/tasks/`;
    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, completed: false }),
    })
      .then((res) => res.json())
      .then(() => {
        setForm({ title: "", description: "" });
        setEditingId(null);
        fetchTasks();
      });
  };


  const handleDelete = (id) => {
    fetch(`${process.env.REACT_APP_API_BASE}/tasks/${id}/`, {
      method: "DELETE",
    })
      .then(() => fetchTasks())
      .catch((err) => console.error("Error deleting task:", err));
  };


  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1>My Tasks</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>Add Task</button>
      </form>

      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong> – {task.description}{" "}
              {task.completed ? "(done)" : ""}
              {" "}
              <button onClick={() => handleDelete(task.id)} style={{ marginLeft: "1rem", color: "red" }}>
                Delete
              </button>
              <button
                onClick={() => {
                  setForm({ title: task.title, description: task.description });
                  setEditingId(task.id);
                }}
                style={{ marginLeft: "0.5rem" }}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
