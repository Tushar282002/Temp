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


SELECT number
FROM (
  SELECT number, 'incident' AS task_type FROM pilothouse.sn_incidents
  UNION ALL
  SELECT number, 'change' FROM pilothouse.sn_changes
  UNION ALL
  SELECT number, 'problem' FROM pilothouse.sn_problems
) AS combined
WHERE task_type = '${__form.task_type}'
ORDER BY number
