// Safe form and selected type
const form = context.form || {};
const selectedType = form.task_type?.value;

// Access query results using context.data (requires Ref IDs to be correct)
const incident = context.data.incident?.rows || [];
const change = context.data.change?.rows || [];
const problem = context.data.problem?.rows || [];

// Build the options based on selected type
if (selectedType === 'Incident') {
  return incident.map(r => ({ label: r.number, value: r.number }));
} else if (selectedType === 'Change') {
  return change.map(r => ({ label: r.number, value: r.number }));
} else if (selectedType === 'Problem') {
  return problem.map(r => ({ label: r.number, value: r.number }));
} else {
  return [{ label: '-- Select valid task type first --', value: '' }];
}
