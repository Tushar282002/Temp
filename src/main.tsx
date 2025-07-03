import { StictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

http://your_server_ip:5000/edit?task_id=${__data.fields.task_id}&user=${__data.fields.username}
http://localhost:5000/edit?task_id=${__data.fields.task_id}&user=${__data.fields.username}


from flask import Flask, request, render_template_string

app = Flask(__name__)

# Simple HTML form template (NO DB)
FORM_HTML = """
<!DOCTYPE html>
<html>
<head>
  <title>Edit Task</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 400px;
      margin: 40px auto;
      background-color: #f2f2f2;
      padding: 20px;
      border-radius: 8px;
    }
    label, input {
      display: block;
      width: 100%;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <h2>Edit Task Time</h2>
  <p><strong>Task ID:</strong> {{ task_id }}</p>
  <p><strong>Assigned To:</strong> {{ user }}</p>

  <form method="POST">
    <label for="time">New Time:</label>
    <input type="time" name="time" required>
    <button type="submit">Save</button>
  </form>

  {% if message %}
    <p style="color: green;">{{ message }}</p>
  {% endif %}
</body>
</html>
"""

@app.route('/edit', methods=['GET', 'POST'])
def edit():
    task_id = request.args.get('task_id', 'N/A')
    user = request.args.get('user', 'N/A')

    message = None
    if request.method == 'POST':
        time = request.form.get('time')
        message = f"Time '{time}' received for Task ID {task_id} (but not saved yet — no DB)."

    return render_template_string(FORM_HTML, task_id=task_id, user=user, message=message)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

                               
