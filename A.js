applyGridFilter(fieldName: string, values: string[]) {
  this.gridApi.setColumnFilterModel(fieldName, {
    filterType: 'multi',
    filterModels: [
      null, // leave the text filter (index 0) untouched/inactive
      { filterType: 'set', values }, // set filter is index 1
    ],
  }).then(() => {
    this.gridApi.onFilterChanged();
  });
}




// Pre-populate stage/status from navigation state
const stage = pref[CustomPreferenceKeys.stage];
const opportunityStatuses = pref[CustomPreferenceKeys.opportunityStatuses];

if (!stage && opportunityStatuses) {
  const statusValue = Array.isArray(opportunityStatuses)
    ? opportunityStatuses[0]
    : opportunityStatuses;

  if (statusValue === OpportunityStatusType.OnHold) {
    this.pendingColumnFilter = { field: 'status', value: statusValue };
  } else if (stage || opportunityStatuses) {
    this.prePopulateStageStatusDropdowns(stage, opportunityStatuses);
  }
} else if (stage || opportunityStatuses) {
  this.prePopulateStageStatusDropdowns(stage, opportunityStatuses);
}


onGridReady(params: any) {
  this.gridApi = params.api;
  this.applyGridPreferences();
  this.addButtons();

  if (this.pendingColumnFilter) {
    this.applyGridFilter(this.pendingColumnFilter.field, [this.pendingColumnFilter.value]);
    this.pendingColumnFilter = undefined;
  }
}

applyGridFilter(fieldName: string, values: string[]) {
  const model =
    values.length === 1
      ? { filterType: 'text', type: 'equals', filter: values[0] }
      : {
          filterType: 'text',
          operator: 'OR',
          conditions: values.map(v => ({ filterType: 'text', type: 'equals', filter: v })),
        };

  this.gridApi.setColumnFilterModel(fieldName, model).then(() => {
    this.gridApi.onFilterChanged();
  });
}

applyGridFilter(fieldName: string, values: string[]) {
  this.gridApi.setColumnFilterModel(fieldName, {
    filterType: 'set',
    values: values,
  }).then(() => {
    this.gridApi.onFilterChanged();
  });
    }
