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



const form = context.form || {};
const selectedType = form?.task_type?.value || "";

// Access hidden variables
const incidentList = context.variables.incident_tasks?.options || [];
const changeList = context.variables.change_tasks?.options || [];
const problemList = context.variables.problem_tasks?.options || [];

// Debug log
console.log("Selected Type:", selectedType);
console.log("Incident list:", incidentList);
console.log("Change list:", changeList);
console.log("Problem list:", problemList);

// Helper to map variable options
const mapFromVar = (options) =>
  options.map(opt => ({ label: opt.text, value: opt.value }));

if (selectedType === "incident") {
  return mapFromVar(incidentList);
} else if (selectedType === "change") {
  return mapFromVar(changeList);
} else if (selectedType === "problem") {
  return mapFromVar(problemList);
} else {
  return [{ label: "-- No task numbers available --", value: "" }];
}
