import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);






const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serves form.html

// DB connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_db_user',
  password: 'your_db_password',
  database: 'your_db_name'
});

// Insert time value
app.post('/save', (req, res) => {
  const { task_id, time } = req.body;
  const sql = 'INSERT INTO task_time_log (task_id, time_value) VALUES (?, ?)';
  db.execute(sql, [task_id, time], (err) => {
    if (err) return res.send('Error: ' + err.message);
    res.send('Saved successfully!');
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});



<!DOCTYPE html>
<html>
<head>
  <title>Edit Time</title>
</head>
<body>
  <h2>Edit Time for Task ID: <span id="taskId"></span></h2>
  <form action="/save" method="POST">
    <input type="hidden" name="task_id" id="task_id_input">
    <label for="time">Time:</label>
    <input type="time" name="time" required>
    <button type="submit">Save</button>
  </form>

  <script>
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('task_id');
    document.getElementById('taskId').textContent = taskId;
    document.getElementById('task_id_input').value = taskId;
  </script>
</body>
</html>
