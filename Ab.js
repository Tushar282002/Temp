const form = context.form || {};
const selectedType = form.task_type?.value;

// Get query results safely
const incidentRows = context.data.incident?.rows || [];
const changeRows = context.data.change?.rows || [];
const problemRows = context.data.problem?.rows || [];

if (selectedType === 'incident') {
  return incidentRows.map(r => ({ label: r.number, value: r.number }));
} else if (selectedType === 'change') {
  return changeRows.map(r => ({ label: r.number, value: r.number }));
} else if (selectedType === 'problem') {
  return problemRows.map(r => ({ label: r.number, value: r.number }));
} else {
  return [{ label: '-- No task numbers available --', value: '' }];
}
