SELECT 
    si.number, 
    si."short_description", 
    si."assigned_to.name" AS uid, 
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
JOIN pilothouse.sn_incidents si ON si."cmdb_ci.sys_id" = sci.sys_id
FULL JOIN pilothouse.apm_application_daps aad ON sba.goldenapp_auid = aad.goldenapp_auid
FULL JOIN pilothouse.apm_applicatons aa ON aa.id = aad.apm_application
FULL JOIN pilothouse.apm_clusters ac ON aa.apm_cluster = ac.id
FULL JOIN pilothouse.apm_subclusters as2 ON aa.apm_subcluster = as2.id
WHERE LOWER('$type') = 'incident' 
  AND si."number" LIKE 'INC%'
  AND ac.id IN ($ApmCluster)
  AND as2.id IN ($ApmSubCluster)
  AND si."assigned_to.user_name" IN (
      SELECT "resourceUid"
      FROM pilothouse.ma_resources
      WHERE "resourceName" IN ($user)
  )
