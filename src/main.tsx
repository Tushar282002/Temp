import { StictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

from flask import Flask, request, render_template_string
import mysql.connector

app = Flask(__name__)

# Database connection
db = mysql.connector.connect(
    host="localhost",
    user="your_db_user",
    password="your_db_password",
    database="your_db_name"
)

# HTML form template
FORM_HTML = """
<!DOCTYPE html>
<html>
<head>
  <title>Edit Time</title>
</head>
<body style="font-family:sans-serif; max-width:400px; margin:40px auto;">
  <h2>Edit Task Time</h2>
  <form method="POST">
    <p><b>Task ID:</b> {{ task_id }}</p>
    <p><b>Assigned To:</b> {{ user }}</p>
    <input type="hidden" name="task_id" value="{{ task_id }}">
    <label for="time">New Time:</label>
    <input type="time" name="time" required><br><br>
    <button type="submit">Save</button>
  </form>
  {% if message %}
    <p style="color:green;">{{ message }}</p>
  {% endif %}
</body>
</html>
"""

@app.route('/edit')
def edit_form():
    task_id = request.args.get('task_id')
    user = request.args.get('user')
    return render_template_string(FORM_HTML, task_id=task_id, user=user, message=None)

@app.route('/edit', methods=['POST'])
def save_time():
    task_id = request.form.get('task_id')
    time = request.form.get('time')

    cursor = db.cursor()
    query = "UPDATE your_table SET time_field = %s WHERE number = %s"
    cursor.execute(query, (time, task_id))
    db.commit()
    cursor.close()

    return render_template_string(FORM_HTML, task_id=task_id, user="N/A", message="Time updated successfully!")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
                               
