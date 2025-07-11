const form = context.form;
const selectedType = form.task_type;

// Access data from queries
const incidentNumbers = data.incident_query?.rows?.map(r => r.number);
const changeNumbers = data.change_query?.rows?.map(r => r.number);
const problemNumbers = data.problem_query?.rows?.map(r => r.number);

let options = [];

if (selectedType === 'Incident') {
  options = incidentNumbers?.map(n => ({ label: n, value: n })) || [];
} else if (selectedType === 'Change') {
  options = changeNumbers?.map(n => ({ label: n, value: n })) || [];
} else if (selectedType === 'Problem') {
  options = problemNumbers?.map(n => ({ label: n, value: n })) || [];
} else {
  options = [{ label: '-- No task numbers --', value: '' }];
}

// Set task_number options dynamically
form.task_number.options = options;
form.task_number.disabled = options.length === 0;
