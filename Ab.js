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






-- INCIDENT
SELECT 
  si.number, 
  si."assigned_to.name" AS username, 
  si."assigned_to.user_name" AS uid,
  'incident' AS type,
  CONCAT(
    LPAD((FLOOR(COALESCE(effort.total_minutes, 0) / 60))::TEXT, 2, '0'), ' hr ',
    LPAD((MOD(COALESCE(effort.total_minutes, 0), 60))::TEXT, 2, '0'), ' min'
  ) AS "Logged Time"
FROM 
  pilothouse.sn_incidents si
JOIN 
  pilothouse.ma_resources mr 
  ON si."assigned_to.user_name" = mr."resourceUid"
LEFT JOIN (
  SELECT task_id, SUM(hours_spent) AS total_minutes
  FROM pilothouse.aps_efforts_logging
  GROUP BY task_id
) effort ON effort.task_id = si.number
WHERE 
  (LOWER('$type') = 'incident' OR LOWER('$type') = 'all') 
  AND si.number LIKE 'INC%'
  AND mr."resourceEmail" = 'siddharth.singhania@asia.bnpparibas.com'

UNION

-- PROBLEM
SELECT 
  sp.number, 
  sp."assigned_to.name" AS username, 
  sp."assigned_to.user_name" AS uid,
  'problem' AS type,
  CONCAT(
    LPAD((FLOOR(COALESCE(effort.total_minutes, 0) / 60))::TEXT, 2, '0'), ' hr ',
    LPAD((MOD(COALESCE(effort.total_minutes, 0), 60))::TEXT, 2, '0'), ' min'
  ) AS "Logged Time"
FROM 
  pilothouse.sn_problems sp
JOIN 
  pilothouse.ma_resources mr 
  ON sp."assigned_to.user_name" = mr."resourceUid"
LEFT JOIN (
  SELECT task_id, SUM(hours_spent) AS total_minutes
  FROM pilothouse.aps_efforts_logging
  GROUP BY task_id
) effort ON effort.task_id = sp.number
WHERE 
  (LOWER('$type') = 'problem' OR LOWER('$type') = 'all') 
  AND sp.number LIKE 'PRB%'
  AND mr."resourceEmail" = 'siddharth.singhania@asia.bnpparibas.com'

UNION

-- CHANGE
SELECT 
  sc.number, 
  sc."assigned_to.name" AS username, 
  sc."assigned_to.user_name" AS uid,
  'change' AS type,
  CONCAT(
    LPAD((FLOOR(COALESCE(effort.total_minutes, 0) / 60))::TEXT, 2, '0'), ' hr ',
    LPAD((MOD(COALESCE(effort.total_minutes, 0), 60))::TEXT, 2, '0'), ' min'
  ) AS "Logged Time"
FROM 
  pilothouse.sn_changes sc
JOIN 
  pilothouse.ma_resources mr 
  ON sc."assigned_to.user_name" = mr."resourceUid"
LEFT JOIN (
  SELECT task_id, SUM(hours_spent) AS total_minutes
  FROM pilothouse.aps_efforts_logging
  GROUP BY task_id
) effort ON effort.task_id = sc.number
WHERE 
  (LOWER('$type') = 'change' OR LOWER('$type') = 'all') 
  AND sc.number LIKE 'CHG%'
  AND mr."resourceEmail" = 'siddharth.singhania@asia.bnpparibas.com';










SELECT 
    si.number, 
    si."short_description", 
    si."assigned_to.name" AS username, 
    CONCAT(
        FLOOR(COALESCE((
            SELECT SUM(ael.hours_spent) 
            FROM pilothouse.aps_efforts_logging ael 
            WHERE ael.task_id = si.number
        ), 0) / 60)::TEXT, 'hr ',
        MOD(COALESCE((
            SELECT SUM(ael.hours_spent) 
            FROM pilothouse.aps_efforts_logging ael 
            WHERE ael.task_id = si.number
        ), 0), 60)::TEXT, 'min'
    ) AS "Total Hours"
FROM pilothouse.sn_business_app sba
JOIN pilothouse.sn_configuration_items sci ON sci.u_code = sba.u_code
FULL JOIN pilothouse.apm_applications aa ON sba.goldenapp_auid = aa.goldenapp_auid
JOIN pilothouse.sn_incidents si ON si.cmdb_ci_sys_id = sci.sys_id
FULL JOIN pilothouse.apm_clusters ac ON aa.apm_cluster = ac.id
FULL JOIN pilothouse.apm_subclusters as2 ON aa.apm_subcluster = as2.id
WHERE LOWER(si."Stype") = 'incident' 
  AND si."number" LIKE 'INC%'
  AND ac.id IN ($ApmCluster)
  AND as2.id IN ($ApmSubCluster)

UNION

SELECT 
    sc.number, 
    sc."short_description", 
    sc."assigned_to.name" AS username, 
    CONCAT(
        FLOOR(COALESCE((
            SELECT SUM(ael.hours_spent) 
            FROM pilothouse.aps_efforts_logging ael 
            WHERE ael.task_id = sc.number
        ), 0) / 60)::TEXT, 'hr ',
        MOD(COALESCE((
            SELECT SUM(ael.hours_spent) 
            FROM pilothouse.aps_efforts_logging ael 
            WHERE ael.task_id = sc.number
        ), 0), 60)::TEXT, 'min'
    ) AS "Total Hours"
FROM pilothouse.sn_business_app sba
JOIN pilothouse.sn_configuration_items sci ON sci.u_code = sba.u_code
FULL JOIN pilothouse.apm_applications aa ON sba.goldenapp_auid = aa.goldenapp_auid
JOIN pilothouse.sn_changes sc ON sc.cmdb_ci_sys_id = sci.sys_id
FULL JOIN pilothouse.apm_clusters ac ON aa.apm_cluster = ac.id
FULL JOIN pilothouse.apm_subclusters as2 ON aa.apm_subcluster = as2.id
WHERE LOWER(sc."Stype") = 'change' 
  AND sc."number" LIKE 'CHG%'
  AND ac.id IN ($ApmCluster)
  AND as2.id IN ($ApmSubCluster)
