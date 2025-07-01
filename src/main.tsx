import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);


<!DOCTYPE html>
<html>
<head>
  <title>Edit Task Time</title>
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



  from flask import Flask, request, render_template
import mysql.connector  # or use sqlite3 if needed

app = Flask(__name__)

# DB Config (MySQL)
db_config = {
    'host': 'localhost',
    'user': 'your_user',
    'password': 'your_password',
    'database': 'your_db'
}

@app.route('/')
def form():
    return render_template('form.html')

@app.route('/save', methods=['POST'])
def save():
    task_id = request.form['task_id']
    time_value = request.form['time']
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    sql = "INSERT INTO task_time_log (task_id, time_value) VALUES (%s, %s)"
    cursor.execute(sql, (task_id, time_value))
    conn.commit()
    cursor.close()
    conn.close()
    
    return f"<h3>Time saved for Task ID: {task_id}</h3>"

if __name__ == '__main__':
    app.run(port=5000)
