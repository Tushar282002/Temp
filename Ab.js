const form = context.form || {};
const selectedType = form?.task_type?.value || "";

// Add fallback for query data
const incidentRows = context.data?.A?.rows || [];
const changeRows = context.data?.B?.rows || [];
const problemRows = context.data?.C?.rows || [];

if (selectedType === 'incident') {
  return incidentRows.map(r => ({ label: r.number, value: r.number }));
} else if (selectedType === 'change') {
  return changeRows.map(r => ({ label: r.number, value: r.number }));
} else if (selectedType === 'problem') {
  return problemRows.map(r => ({ label: r.number, value: r.number }));
} else {
  return [{ label: '-- No task numbers available --', value: '' }];
}
