import { StictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

                                <td                required: true
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
