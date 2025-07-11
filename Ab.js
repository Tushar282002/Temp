// Get the form object safely
const form = context.form || {};
const selectedType = form.task_type?.value;  // Use safe optional chaining

// Access query results safely
const incidentNumbers = data.incident_query?.rows?.map(r => r.number) || [];
const changeNumbers = data.change_query?.rows?.map(r => r.number) || [];
const problemNumbers = data.problem_query?.rows?.map(r => r.number) || [];

// Initialize options
let options = [];

if (selectedType === 'Incident') {
  options = incidentNumbers.map(n => ({ label: n, value: n }));
} else if (selectedType === 'Change') {
  options = changeNumbers.map(n => ({ label: n, value: n }));
} else if (selectedType === 'Problem') {
  options = problemNumbers.map(n => ({ label: n, value: n }));
} else {
  options = [{ label: '-- No task numbers --', value: '' }];
}

// Set options only if the task_number field exists
if (form.task_number) {
  form.task_number.options = options;
  form.task_number.disabled = options.length === 0;
}
