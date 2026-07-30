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
