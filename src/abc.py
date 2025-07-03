from flask import Flask, request, render_template_string
from datetime import datetime
import mysql.connector

app = Flask(__name__)

# ✅ Connect to the corporate MySQL DB
db = mysql.connector.connect(
    host="your_db_host",         # e.g., "localhost"
    user="your_db_user",         # e.g., "grafana_user"
    password="your_db_password", # ask admin if needed
    database="pilothouse"
)

# ✅ HTML template for form display
FORM_HTML = """
<!DOCTYPE html>
<html>
<head>
  <title>Edit Task Time</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 420px;
      margin: 40px auto;
      background-color: #f4f4f4;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    label, input {
      display: block;
      width: 100%;
      margin-bottom: 12px;
      padding: 8px;
      font-size: 14px;
    }
    small {
      font-size: 12px;
      color: #555;
      margin-bottom: 15px;
    }
    button {
      padding: 10px 15px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 15px;
      cursor: pointer;
    }
    .error {
      color: red;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <h2>Edit Task Time</h2>

  <p><strong>Task ID:</strong> {{ task_id }}</p>
  <p><strong>Assigned To:</strong> {{ assigned_to }}</p>
  <p><strong>Logged-in Email:</strong> {{ user_email }}</p>

  {% if error %}
    <p class="error">{{ error }}</p>
  {% endif %}

  {% if allow_form %}
  <form method="POST">
    <label for="date">Date:</label>
    <input type="date" name="date" value="{{ default_date }}" required>

    <label for="time">Time Spent (HH:MM):</label>
    <input type="time" name="time" value="{{ default_time }}" min="00:00" max="12:00" required>
    <small>Please enter the time you spent working on this task (e.g., 01:30 for 1 hour 30 minutes). Max: 12 hours</small>

    <button type="submit">Save</button>
  </form>
  {% endif %}

  {% if message %}
    <p style="color: green; margin-top: 15px;">{{ message }}</p>
  {% endif %}
</body>
</html>
"""

@app.route('/edit', methods=['GET', 'POST'])
def edit():
    task_id = request.args.get('task_id', '').strip()
    assigned_to = request.args.get('assigned_to', '').strip()
    user_email = request.args.get('user_email', '').strip().lower()

    now = datetime.now()
    default_date = now.strftime('%Y-%m-%d')
    default_time = "00:00"
    error = None
    message = None
    allow_form = False

    # ✅ Step 1: Fetch name from ma_resources using email
    try:
        cursor = db.cursor()
        cursor.execute("SELECT resourceName FROM ma_resources WHERE LOWER(resourceEmail) = %s", (user_email,))
        result = cursor.fetchone()
        cursor.close()

        if result:
            db_name = result[0]

            # ✅ Normalize and compare both names as sets of words
            resource_name_parts = sorted(db_name.strip().lower().split())
            assigned_name_parts = sorted(assigned_to.strip().lower().split())

            if resource_name_parts == assigned_name_parts:
                allow_form = True
            else:
                error = f"Access denied: Your name '{db_name}' does not match the assigned name '{assigned_to}'."
        else:
            error = f"No entry found in ma_resources for email '{user_email}'."
    except Exception as e:
        error = f"Error while validating user identity: {e}"

    # ✅ Step 2: Insert if valid and submitted
    if request.method == 'POST' and allow_form:
        date = request.form.get('date')
        time = request.form.get('time')
        hours, minutes = map(int, time.split(":"))
        hours_spent = round(hours + minutes / 60, 2)

        try:
            cursor = db.cursor()
            cursor.execute("""
                INSERT INTO aps_efforts_logging (username, date, task_id, hours_spent)
                VALUES (%s, %s, %s, %s)
            """, (assigned_to, date, task_id, hours_spent))
            db.commit()
            cursor.close()
            message = "✅ Time entry saved successfully!"
        except Exception as e:
            error = f"❌ Failed to save data: {e}"

    return render_template_string(
        FORM_HTML,
        task_id=task_id,
        assigned_to=assigned_to,
        user_email=user_email,
        default_date=default_date,
        default_time=default_time,
        error=error,
        message=message,
        allow_form=allow_form
    )

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
