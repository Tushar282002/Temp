The issue is clear from the console logs:

```
writeValue called with: ESG Pure Player
Value set: ESG Pure Player
```

The API is returning just a **string** (`"ESG Pure Player"`), but your dropdown items are **objects** (ListOfValues with `value`, `description`, etc.). So when mat-select tries to display it, it can't find a matching object in the items array.

## **Solution: Update `writeValue` to handle string values**

Replace your `writeValue` method with this:

```typescript
override writeValue(value: T): void {
  console.log('🔽 writeValue called with:', value);
  console.log('🔽 Type:', typeof value);
  
  if (value) {
    // If value is a string and items are objects, try to find matching item
    if (typeof value === 'string' && this.items && this.items.length > 0) {
      console.log('🔍 Value is string, searching in items...');
      const matchedItem = this.findMatchingItemByString(value as unknown as string);
      if (matchedItem) {
        console.log('✅ Found matching item:', matchedItem);
        this.selectedValue = matchedItem;
        this.selectedItem = matchedItem;
        return;
      } else {
        console.warn('⚠️ No matching item found for string:', value);
        // Store as pending to match when items load
        this.pendingStringValue = value as unknown as string;
      }
    } else {
      // Value is already an object
      this.selectedValue = value;
      this.selectedItem = value;
      console.log('✅ Value set:', this.selectedValue);
    }
  } else {
    this.selectedValue = null;
    this.selectedItem = null;
  }
}
```

## **Add these properties and methods:**

```typescript
export class SingleSelectDropdownComponent<T> extends OptionsParentBase<T> implements OnInit, OnChanges {
  // ... existing properties
  
  private _selectedItem: T | null = null;
  private pendingStringValue: string | null = null;  // ✅ ADD THIS
  
  // ... rest of your existing code

  // ✅ ADD THIS METHOD - Find item by string value
  private findMatchingItemByString(stringValue: string): T | null {
    if (!this.items || this.items.length === 0) return null;
    
    console.log('🔍 Searching for:', stringValue, 'in items:', this.items);
    
    return this.items.find(item => {
      const lov = item as any;
      
      // Match against value field
      if (lov.value === stringValue) {
        return true;
      }
      
      // Match against description
      if (lov.description === stringValue) {
        return true;
      }
      
      // Match against valueAndDescription
      if (lov.valueAndDescription === stringValue) {
        return true;
      }
      
      // Match against orderBy
      if (lov.orderBy === stringValue) {
        return true;
      }
      
      return false;
    }) || null;
  }

  // ✅ UPDATE loadLovData to handle pending string
  loadLovData(): void {
    if (this.items && this.items.length > 0) {
      this.setupPreferencesSubscription();
      // Check for pending string value
      if (this.pendingStringValue) {
        this.applyPendingStringValue();
      }
      return;
    }

    if (this.lovType) {
      this.lovService.getLovData(this.lovType).subscribe(
        createObserver<ListOfValues[]>((data) => {
          if (this.hasAll) {
            data.splice(0, 0, this.defaultLov);
          }
          this.items = data as unknown as T[];
          
          console.log('✅ LOV items loaded:', this.items);
          
          // ✅ Apply pending string value if exists
          if (this.pendingStringValue) {
            this.applyPendingStringValue();
          }
          // Match existing selectedValue
          else if (this.selectedValue && this.items.length > 0) {
            const matchedItem = this.findMatchingItem(this.selectedValue);
            if (matchedItem) {
              console.log('🔄 Matched value to item:', matchedItem);
              this.selectedValue = matchedItem;
              this.selectedItem = matchedItem;
            }
          }
          
          this.setupPreferencesSubscription();
        }, 'Lov Data')
      );
    }
  }

  // ✅ ADD THIS METHOD
  private applyPendingStringValue(): void {
    if (!this.pendingStringValue) return;
    
    console.log('🔄 Applying pending string value:', this.pendingStringValue);
    const matchedItem = this.findMatchingItemByString(this.pendingStringValue);
    
    if (matchedItem) {
      console.log('✅ Matched pending value to item:', matchedItem);
      this.selectedValue = matchedItem;
      this.selectedItem = matchedItem;
      this.pendingStringValue = null;
    } else {
      console.warn('⚠️ Could not match pending value:', this.pendingStringValue);
    }
  }

  // Keep your existing findMatchingItem for object matching
  private findMatchingItem(value: T): T | null {
    if (!this.items || this.items.length === 0) return null;
    
    return this.items.find(item => {
      const itemLov = item as any;
      const valueLov = value as any;
      
      if (itemLov.value && valueLov.value) {
        return itemLov.value === valueLov.value;
      }
      if (itemLov.orderBy && valueLov.orderBy) {
        return itemLov.orderBy === valueLov.orderBy;
      }
      if (itemLov.valueAndDescription && valueLov.valueAndDescription) {
        return itemLov.valueAndDescription === valueLov.valueAndDescription;
      }
      
      return item === value;
    }) || null;
  }
}
```

## **Why this happens:**

Your API returns:
```json
{
  "greenSustainableFlag": "ESG Pure Player"  // ← Just a string
}
```

But your LOV items are:
```json
[
  { "value": "ESG", "description": "ESG Pure Player", "valueAndDescription": "ESG - ESG Pure Player", ... },
  { "value": "YES", "description": "Yes", ... }
]
```

So you need to **match the string** `"ESG Pure Player"` to the **description field** of the LOV object.

## **Alternative: Fix at the backend**

If possible, ask the backend team to return the **full LOV object** instead of just a string:

```json
{
  "greenSustainableFlag": {
    "value": "ESG",
    "description": "ESG Pure Player",
    "valueAndDescription": "ESG - ESG Pure Player"
  }
}
```

This would make it work exactly like `productType` does! But the above frontend solution will work with the current string response. 🎯




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




const jsonData = pm.response.json();

const assignee = jsonData.fields.assignee || {};
const reporter = jsonData.fields.reporter || {};

const viewData = {
    assigneeEmail: assignee.emailAddress || "Not Assigned",
    assigneeName: assignee.displayName || "N/A",
    reporterEmail: reporter.emailAddress || "Not Available",
    reporterName: reporter.displayName || "N/A"
};

pm.visualizer.set(`
  <style>
    table {
      border-collapse: collapse;
      width: 60%;
    }
    td, th {
      border: 1px solid #ccc;
      padding: 8px;
    }
    th {
      background-color: #f9f9f9;
      text-align: left;
    }
  </style>
  <h3>JIRA Issue Summary</h3>
  <table>
    <tr><th>Field</th><th>Value</th></tr>
    <tr><td>Assignee Email</td><td>{{assigneeEmail}}</td></tr>
    <tr><td>Assignee Name</td><td>{{assigneeName}}</td></tr>
    <tr><td>Reporter Email</td><td>{{reporterEmail}}</td></tr>
    <tr><td>Reporter Name</td><td>{{reporterName}}</td></tr>
  </table>
`, viewData);
