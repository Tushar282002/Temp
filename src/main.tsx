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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Validation Form</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 20px;
            background-color: #1a1a1a;
            color: #ffffff;
        }
        
        .table-container {
            background-color: #2d2d2d;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background-color: #333333;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #444444;
        }
        
        th {
            background-color: #444444;
            font-weight: bold;
        }
        
        .edit-btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .edit-btn:hover {
            background-color: #0056b3;
        }
        
        /* Enhanced Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            background-color: #2d2d2d;
            margin: 8% auto;
            padding: 30px;
            border-radius: 12px;
            width: 500px;
            max-width: 90%;
            color: #ffffff;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            animation: modalSlideIn 0.3s ease-out;
        }
        
        @keyframes modalSlideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.3s;
        }
        
        .close:hover {
            color: #fff;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #e0e0e0;
        }
        
        input[type="datetime-local"],
        input[type="text"],
        input[type="number"],
        select,
        textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #555;
            border-radius: 6px;
            background-color: #444;
            color: #fff;
            box-sizing: border-box;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        input:focus,
        select:focus,
        textarea:focus {
            outline: none;
            border-color: #007bff;
        }
        
        .error-message {
            color: #ff6b6b;
            font-size: 12px;
            margin-top: 5px;
            display: none;
        }
        
        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 12px;
            border-radius: 6px;
            margin-top: 15px;
            display: none;
        }
        
        .validation-error {
            border-color: #ff6b6b !important;
            background-color: #4a2c2c !important;
        }
        
        .validation-success {
            border-color: #51cf66 !important;
            background-color: #2d4a2d !important;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 25px;
        }
        
        .save-btn {
            background-color: #28a745;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s;
            position: relative;
        }
        
        .save-btn:hover:not(:disabled) {
            background-color: #218838;
            transform: translateY(-2px);
        }
        
        .save-btn:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        
        .cancel-btn {
            background-color: #6c757d;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .cancel-btn:hover {
            background-color: #5a6268;
            transform: translateY(-2px);
        }
        
        .loading {
            pointer-events: none;
        }
        
        .loading::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            margin: auto;
            border: 2px solid transparent;
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
        
        @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        .validation-summary {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            display: none;
        }
        
        .validation-summary ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .field-hint {
            font-size: 11px;
            color: #999;
            margin-top: 3px;
        }
        
        .required {
            color: #ff6b6b;
        }
    </style>
</head>
<body>
    <div class="table-container">
        <h2>Task Management Dashboard</h2>
        <table id="taskTable">
            <thead>
                <tr>
                    <th>Task ID</th>
                    <th>Username</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>INC001</td>
                    <td>John Doe</td>
                    <td>2024-01-15</td>
                    <td>10:30</td>
                    <td>High</td>
                    <td>In Progress</td>
                    <td><button class="edit-btn" onclick="openEditModal('INC001', 'John Doe', '2024-01-15', '10:30', 'High', 'In Progress')">Edit</button></td>
                </tr>
                <tr>
                    <td>PRB002</td>
                    <td>Jane Smith</td>
                    <td>2024-01-16</td>
                    <td>14:45</td>
                    <td>Medium</td>
                    <td>Open</td>
                    <td><button class="edit-btn" onclick="openEditModal('PRB002', 'Jane Smith', '2024-01-16', '14:45', 'Medium', 'Open')">Edit</button></td>
                </tr>
                <tr>
                    <td>CHG003</td>
                    <td>Bob Johnson</td>
                    <td>2024-01-17</td>
                    <td>09:15</td>
                    <td>Low</td>
                    <td>Closed</td>
                    <td><button class="edit-btn" onclick="openEditModal('CHG003', 'Bob Johnson', '2024-01-17', '09:15', 'Low', 'Closed')">Edit</button></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Enhanced Modal -->
    <div id="editModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Edit Task Details</h2>
            
            <div id="validationSummary" class="validation-summary">
                <strong>Please fix the following errors:</strong>
                <ul id="validationList"></ul>
            </div>
            
            <form id="editForm">
                <div class="form-group">
                    <label for="taskId">Task ID:</label>
                    <input type="text" id="taskId" name="taskId" readonly>
                </div>
                
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" readonly>
                </div>
                
                <div class="form-group">
                    <label for="newTime">New Time <span class="required">*</span>:</label>
                    <input type="datetime-local" id="newTime" name="newTime" required>
                    <div class="field-hint">Select a future date and time</div>
                    <div class="error-message" id="newTimeError"></div>
                </div>
                
                <div class="form-group">
                    <label for="priority">Priority <span class="required">*</span>:</label>
                    <select id="priority" name="priority" required>
                        <option value="">Select Priority</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <div class="error-message" id="priorityError"></div>
                </div>
                
                <div class="form-group">
                    <label for="status">Status <span class="required">*</span>:</label>
                    <select id="status" name="status" required>
                        <option value="">Select Status</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <div class="error-message" id="statusError"></div>
                </div>
                
                <div class="form-group">
                    <label for="estimatedHours">Estimated Hours:</label>
                    <input type="number" id="estimatedHours" name="estimatedHours" min="0" step="0.5">
                    <div class="field-hint">Enter hours (0.5 increments)</div>
                    <div class="error-message" id="estimatedHoursError"></div>
                </div>
                
                <div class="form-group">
                    <label for="comments">Comments:</label>
                    <textarea id="comments" name="comments" rows="3" maxlength="500"></textarea>
                    <div class="field-hint">Max 500 characters</div>
                    <div class="error-message" id="commentsError"></div>
                </div>
                
                <div class="button-group">
                    <button type="button" class="cancel-btn" onclick="closeModal()">Cancel</button>
                    <button type="button" class="save-btn" id="saveBtn" onclick="saveWithValidation()">Save Changes</button>
                </div>
                
                <div id="successMessage" class="success-message">
                    Task updated successfully!
                </div>
            </form>
        </div>
    </div>

    <script>
        // Validation Rules Configuration
        const validationRules = {
            newTime: {
                required: true,
                future: true,
                businessHours: true
            },
            priority: {
                required: true
            },
            status: {
                required: true,
                businessLogic: true
            },
            estimatedHours: {
                min: 0,
                max: 1000,
                step: 0.5
            },
            comments: {
                maxLength: 500
            }
        };

        // Validation Functions
        function validateForm() {
            const errors = [];
            let isValid = true;

            // Clear previous validation states
            clearValidationStates();

            // Validate New Time
            const newTimeValue = document.getElementById('newTime').value;
            if (validationRules.newTime.required && !newTimeValue) {
                addError('newTime', 'Time is required');
                errors.push('Time is required');
                isValid = false;
            } else if (newTimeValue) {
                const selectedTime = new Date(newTimeValue);
                const now = new Date();
                
                if (validationRules.newTime.future && selectedTime <= now) {
                    addError('newTime', 'Selected time must be in the future');
                    errors.push('Selected time must be in the future');
                    isValid = false;
                }
                
                if (validationRules.newTime.businessHours) {
                    const hour = selectedTime.getHours();
                    const day = selectedTime.getDay();
                    if (day === 0 || day === 6) {
                        addError('newTime', 'Please select a weekday');
                        errors.push('Please select a weekday');
                        isValid = false;
                    } else if (hour < 8 || hour > 18) {
                        addError('newTime', 'Please select business hours (8 AM - 6 PM)');
                        errors.push('Please select business hours (8 AM - 6 PM)');
                        isValid = false;
                    }
                }
            }

            // Validate Priority
            const priorityValue = document.getElementById('priority').value;
            if (validationRules.priority.required && !priorityValue) {
                addError('priority', 'Priority is required');
                errors.push('Priority is required');
                isValid = false;
            }

            // Validate Status
            const statusValue = document.getElementById('status').value;
            const taskId = document.getElementById('taskId').value;
            
            if (validationRules.status.required && !statusValue) {
                addError('status', 'Status is required');
                errors.push('Status is required');
                isValid = false;
            }
            
            // Business Logic Validation
            if (validationRules.status.businessLogic && statusValue && priorityValue) {
                if (statusValue === 'Closed' && priorityValue === 'Critical') {
                    addError('status', 'Critical priority tasks cannot be closed without approval');
                    errors.push('Critical priority tasks cannot be closed without approval');
                    isValid = false;
                }
                
                if (taskId.startsWith('CHG') && statusValue === 'Open') {
                    addError('status', 'Change requests cannot be reopened to Open status');
                    errors.push('Change requests cannot be reopened to Open status');
                    isValid = false;
                }
            }

            // Validate Estimated Hours
            const estimatedHoursValue = document.getElementById('estimatedHours').value;
            if (estimatedHoursValue) {
                const hours = parseFloat(estimatedHoursValue);
                if (hours < validationRules.estimatedHours.min) {
                    addError('estimatedHours', `Minimum ${validationRules.estimatedHours.min} hours`);
                    errors.push(`Minimum ${validationRules.estimatedHours.min} hours`);
                    isValid = false;
                }
                if (hours > validationRules.estimatedHours.max) {
                    addError('estimatedHours', `Maximum ${validationRules.estimatedHours.max} hours`);
                    errors.push(`Maximum ${validationRules.estimatedHours.max} hours`);
                    isValid = false;
                }
                if (hours % validationRules.estimatedHours.step !== 0) {
                    addError('estimatedHours', 'Use 0.5 hour increments');
                    errors.push('Use 0.5 hour increments');
                    isValid = false;
                }
            }

            // Validate Comments
            const commentsValue = document.getElementById('comments').value;
            if (commentsValue && commentsValue.length > validationRules.comments.maxLength) {
                addError('comments', `Maximum ${validationRules.comments.maxLength} characters`);
                errors.push(`Comments too long (max ${validationRules.comments.maxLength} characters)`);
                isValid = false;
            }

            // Show validation summary
            showValidationSummary(errors);

            return isValid;
        }

        function addError(fieldId, message) {
            const field = document.getElementById(fieldId);
            const errorDiv = document.getElementById(fieldId + 'Error');
            
            field.classList.add('validation-error');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        function clearValidationStates() {
            const fields = ['newTime', 'priority', 'status', 'estimatedHours', 'comments'];
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                const errorDiv = document.getElementById(fieldId + 'Error');
                
                field.classList.remove('validation-error', 'validation-success');
                errorDiv.style.display = 'none';
            });
            
            document.getElementById('validationSummary').style.display = 'none';
        }

        function showValidationSummary(errors) {
            const summaryDiv = document.getElementById('validationSummary');
            const listDiv = document.getElementById('validationList');
            
            if (errors.length > 0) {
                listDiv.innerHTML = errors.map(error => `<li>${error}</li>`).join('');
                summaryDiv.style.display = 'block';
            } else {
                summaryDiv.style.display = 'none';
            }
        }

        // Modal Functions
        function openEditModal(taskId, username, date, time, priority, status) {
            document.getElementById('taskId').value = taskId;
            document.getElementById('username').value = username;
            document.getElementById('newTime').value = date + 'T' + time;
            document.getElementById('priority').value = priority;
            document.getElementById('status').value = status;
            
            clearValidationStates();
            document.getElementById('editModal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('editModal').style.display = 'none';
            document.getElementById('successMessage').style.display = 'none';
            clearValidationStates();
        }

        async function saveWithValidation() {
            if (!validateForm()) {
                return;
            }

            const saveBtn = document.getElementById('saveBtn');
            saveBtn.disabled = true;
            saveBtn.classList.add('loading');
            saveBtn.textContent = 'Saving...';

            try {
                const formData = {
                    taskId: document.getElementById('taskId').value,
                    newTime: document.getElementById('newTime').value,
                    priority: document.getElementById('priority').value,
                    status: document.getElementById('status').value,
                    estimatedHours: document.getElementById('estimatedHours').value,
                    comments: document.getElementById('comments').value
                };

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Your actual API call would go here
                console.log('Saving validated data:', formData);

                // Show success message
                document.getElementById('successMessage').style.display = 'block';
                
                // Update table
                updateTableRow(formData);
                
                setTimeout(() => {
                    closeModal();
                }, 2000);

            } catch (error) {
                console.error('Error saving data:', error);
                alert('Error saving data. Please try again.');
            } finally {
                saveBtn.disabled = false;
                saveBtn.classList.remove('loading');
                saveBtn.textContent = 'Save Changes';
            }
        }

        function updateTableRow(formData) {
            const table = document.getElementById('taskTable');
            const rows = table.getElementsByTagName('tr');
            
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName('td');
                if (cells[0].textContent === formData.taskId) {
                    const dateTime = new Date(formData.newTime);
                    cells[2].textContent = dateTime.toLocaleDateString();
                    cells[3].textContent = dateTime.toLocaleTimeString();
                    cells[4].textContent = formData.priority;
                    cells[5].textContent = formData.status;
                    break;
                }
            }
        }

        // Real-time validation
        document.addEventListener('DOMContentLoaded', function() {
            const fields = ['newTime', 'priority', 'status', 'estimatedHours', 'comments'];
            
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                field.addEventListener('blur', function() {
                    // Validate individual field on blur
                    validateForm();
                });
            });
        });

        // Close modal on outside click
        window.onclick = function(event) {
            const modal = document.getElementById('editModal');
            if (event.target === modal) {
                closeModal();
            }
        }
    </script>
</body>
</html>
