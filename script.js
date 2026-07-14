const { useEffect, useMemo, useState } = React;

const STORAGE_KEY = "student-kanban-board";
const THEME_KEY = "kanban-theme";
const RATING_KEY = "task-management-rating";

const DEFAULT_TASKS = [];

const COLUMNS = [
  { key: "todo", title: "To Do" },
  { key: "progress", title: "In Progress" },
  { key: "done", title: "Done" }
];

function loadInitialTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : DEFAULT_TASKS;
}

function getInitialTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

function getInitialRating() {
  return Number(localStorage.getItem(RATING_KEY)) || 0;
}

function App() {
  const [tasks, setTasks] = useState(loadInitialTasks);
  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(getInitialRating);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(RATING_KEY, String(rating));
  }, [rating]);

  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase();
    return tasks.filter(task => task.text.toLowerCase().includes(query));
  }, [tasks, search]);

  const counts = useMemo(() => {
    const result = { total: tasks.length, todo: 0, progress: 0, done: 0 };
    for (const task of tasks) result[task.status] += 1;
    return result;
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    const text = taskText.trim();
    if (!text) return;

    setTasks(prev => [
      { id: Date.now(), text, status: "todo", priority },
      ...prev
    ]);
    setTaskText("");
    setPriority("medium");
    setShowRating(true);
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const moveTask = (id, status) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, status } : task));
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = (id) => {
    const text = editingText.trim();
    if (!text) return;

    setTasks(prev => prev.map(task => task.id === id ? { ...task, text } : task));
    setEditingId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  return (
    <div className="app">
      <section className="topbar">
        <div className="toprow">
          <div className="brand">
            <h1>Task Management</h1>
            <p>
              A simple React task board for personal use with add, edit, delete, move,
              priority labels, search, and browser storage.
            </p>
          </div>

          <div className="themeSwitch">
            <span className="themeText">{theme === "light" ? "Day" : "Night"}</span>
            <button
              type="button"
              className={`switch ${theme === "dark" ? "on" : ""}`}
              onClick={() => setTheme(prev => (prev === "light" ? "dark" : "light"))}
              aria-label="Toggle theme"
            />
          </div>
        </div>

        <div className="stats">
          <div className="stat"><span className="label">Total</span><span className="value">{counts.total}</span></div>
          <div className="stat"><span className="label">To Do</span><span className="value">{counts.todo}</span></div>
          <div className="stat"><span className="label">In Progress</span><span className="value">{counts.progress}</span></div>
          <div className="stat"><span className="label">Done</span><span className="value">{counts.done}</span></div>
        </div>
      </section>

      {showRating && (
        <div className="ratingOverlay" onClick={() => setShowRating(false)}>
          <div className="ratingModal" onClick={(e) => e.stopPropagation()}>
            <div className="ratingTitle">Submit successfully! Rate this app</div>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star ${rating >= star ? "active" : ""}`}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="ratingInfo">
              {rating ? `${rating} / 5 stars selected` : "Click a star to rate"}
            </div>
            <div className="ratingActions">
              <button type="button" className="btn-primary" onClick={() => setShowRating(false)}>Done</button>
              <button type="button" className="btn-warning" onClick={() => { setRating(0); setShowRating(false); }}>Reset</button>
            </div>
          </div>
        </div>
      )}

      <div className="toolbar">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." />
        <input value="localStorage enabled" readOnly />
      </div>

      <form className="form" onSubmit={addTask}>
        <input
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Enter a new task..."
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button type="submit" className="btn-primary">Add Task</button>
      </form>

      <div className="board">
        {COLUMNS.map(column => {
          const columnTasks = filteredTasks.filter(task => task.status === column.key);

          return (
            <div className="column" key={column.key}>
              <h2>
                {column.title}
                <span className="count">{columnTasks.length} items</span>
              </h2>

              {columnTasks.map(task => (
                <div className={`task ${task.priority}`} key={task.id}>
                  <div className="task-header">
                    {editingId === task.id ? (
                      <input
                        className="editInput"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <p className="task-title" onClick={() => startEdit(task)}>
                        {task.text}
                      </p>
                    )}
                    <span className={`priority ${task.priority}`}>{task.priority}</span>
                  </div>

                  {editingId === task.id ? (
                    <div className="task-actions">
                      <button type="button" className="btn-success" onClick={() => saveEdit(task.id)}>Save</button>
                      <button type="button" className="btn-warning" onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <div className="task-actions">
                      <button type="button" className="btn-primary" onClick={() => moveTask(task.id, "todo")}>To Do</button>
                      <button type="button" className="btn-warning" onClick={() => moveTask(task.id, "progress")}>In Progress</button>
                      <button type="button" className="btn-success" onClick={() => moveTask(task.id, "done")}>Done</button>
                      <button type="button" className="btn-danger" onClick={() => deleteTask(task.id)}>Delete</button>
                    </div>
                  )}
                </div>
              ))}

              {columnTasks.length === 0 && <div className="empty">No tasks available in this column.</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);