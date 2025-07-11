const form = context.form || {};
const selectedType = form.task_type?.value;

// Use context.data instead of data
const incidentRows = context.data.incident?.rows || [];
const changeRows = context.data.change?.rows || [];
const problemRows = context.data.problem?.rows || [];

// Map to 'number' values
const incidentNumbers = incidentRows.map(r => r.number);
const changeNumbers = changeRows.map(r => r.number);
const problemNumbers = problemRows.map(r => r.number);

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

if (form.task_number) {
  form.task_number.options = options;
  form.task_number.disabled = options.length === 0;
}
