private prePopulateStageStatusDropdowns(stage: string, statusList: unknown): void {
  const itemsToSelect: FilterItem[] = [];

  // Convert status list to string array
  let statusArray: string[] = [];
  if (Array.isArray(statusList)) {
    statusArray = statusList.map(s => String(s)).filter(s => s.trim());
  } else if (typeof statusList === 'string' && statusList.trim()) {
    statusArray = [statusList];
  }

  if (!stage && statusArray.length === 0) {
    return;
  }

  if (stage === getOpportunitySiebelStageTypeDescription(OpportunityStageType.Closed)) {
    // Closed stage — add specific statuses if provided
    if (statusArray.length > 0) {
      for (const statusValue of statusArray) {
        const filterItem = this.allStatusList.find(item => item.value.includes(statusValue));
        if (filterItem) {
          itemsToSelect.push(filterItem);
        }
      }
    }
    // If no status for Closed stage, treat as "open" - don't filter by status
  } else if (stage) {
    // Non-Closed stage - find matching status
    const filterItem = this.allStatusList.filter(item => {
      if (Array.isArray(stage)) {
        return stage.includes(item.value);
      } else {
        return item.value === stage;
      }
    });
    if (filterItem) {
      filterItem.forEach(x => itemsToSelect.push(x));
    }
  }

  if (itemsToSelect.length > 0) {
    this.statusFilterCtrl.setValue(itemsToSelect);
    this.prevSelectedStatus = [...itemsToSelect];
  }
}




if (!stage && opportunityStatuses) {
  const statusValue = Array.isArray(opportunityStatuses) ? opportunityStatuses[0] : opportunityStatuses;

  if (statusValue === OpportunityStatusType.OnHold) {
    this.pendingColumnFilter = { field: 'status', value: statusValue };
    this.statusFilterCtrl.setValue([]);
    this.prevSelectedStatus = [];
  } else if (stage || opportunityStatuses) {
    this.clearPendingColumnFilter();   // add this
    this.prePopulateStageStatusDropdowns(stage, opportunityStatuses);
  }
} else if (stage || opportunityStatuses) {
  this.clearPendingColumnFilter();   // add this
  this.prePopulateStageStatusDropdowns(stage, opportunityStatuses);
}

private clearPendingColumnFilter(): void {
  this.pendingColumnFilter = undefined;
  if (this.gridApi) {
    this.gridApi.setColumnFilterModel('status', null).then(() => {
      this.gridApi.onFilterChanged();
    });
  }
}
