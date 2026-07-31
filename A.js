if (this.gridApi) {
  const currentModel = this.gridApi.getColumnFilterModel('status') as {
    filterType?: string;
    filterModels?: Array<{ filterType?: string; values?: string[] } | null>;
  } | null;

  const setModel = currentModel?.filterModels?.[1];
  const staleValues: string[] = setModel?.values ?? [];

  const availableStatuses = new Set(this.rowData().map(r => r.status).filter(Boolean));
  const isStale = staleValues.length > 0 && !staleValues.some(v => availableStatuses.has(v));

  const clearIfStale = isStale
    ? this.gridApi.setColumnFilterModel('status', { filterType: 'multi', filterModels: [null, null] })
    : Promise.resolve();

  clearIfStale.then(() => {
    if (this.pendingColumnFilter) {
      this.applyGridFilter(this.pendingColumnFilter.field, [this.pendingColumnFilter.value]);
    } else {
      this.gridApi.onFilterChanged();
    }
  });
}



forkJoin([...]).subscribe(([currentYear, previousYear]) => {
  this.rowData.set(currentYear);
  this.pastRowData.set(previousYear);
  this.applyFilters();
  this.applyCardFilter();
  this.RemoveIsBusy();

  if (this.gridApi) {
    const currentModel = this.gridApi.getColumnFilterModel('status');
    const setModel = currentModel?.filterModels?.[1];
    const staleValues: string[] = setModel?.values ?? [];

    const availableStatuses = new Set(this.rowData().map(r => r.status).filter(Boolean));
    const isStale = staleValues.length > 0 && !staleValues.some(v => availableStatuses.has(v));

    const clearIfStale = isStale
      ? this.gridApi.setColumnFilterModel('status', { filterType: 'multi', filterModels: [null, null] })
      : Promise.resolve();

    clearIfStale.then(() => {
      if (this.pendingColumnFilter) {
        this.applyGridFilter(this.pendingColumnFilter.field, [this.pendingColumnFilter.value]);
      } else {
        this.gridApi.onFilterChanged();
      }
    });
  }
});




} else if (stage || opportunityStatuses) {
  this.clearPendingColumnFilter();
  this.skipRestoreGridFilters = true;   // add this
  this.prePopulateStageStatusDropdowns(stage, opportunityStatuses);
}


private applyGridPreferences(): void {
  if (!this.gridApi) {
    return;
  }
  const prefs: GridColumnPreference[] = this.gridPreferences ?? [];

  // Fast lookup: field -> preference
  const prefByField = new Map<string, GridColumnPreference>();
  prefs.forEach((p) => prefByField.set(p.f, p));

  // Col Pref ordered by their Index
  const sortedPrefs = [...prefs].sort((a, b) => a.pI - b.pI);

  // Build the ordered column list
  const finalColDefs: ColDef[] = [];

  // Columns that are in preferences (ordered by pI)
  for (const matchedPref of sortedPrefs) {
    const def = this.defaultColumnDefinitions.find((d) => d.field === matchedPref.f);
    if (def) {
      finalColDefs.push({
        ...def,
        hide: !matchedPref.v,
        pinned: matchedPref.pin || matchedPref.locked,
        width: matchedPref.w,
        flex: matchedPref.w ? undefined : def.flex,
        lockVisible: matchedPref.locked,
        lockPosition: matchedPref.locked ? 'left' : undefined,
        lockPinned: matchedPref.locked,
        suppressMovable: matchedPref.locked,
        suppressNavigable: matchedPref.locked,
        rowGroup: matchedPref.rowGroup,
        rowGroupIndex: matchedPref.rowGroup ? matchedPref.rowGroupIndex : undefined,
      });
    } else {
      console.info(`[${this.moduleKey}] setupColDefs Preference for unknown field '${matchedPref.f}'`);
    }
  }

  // All default columns that were not part of preferences
  const remainingDefs = this.defaultColumnDefinitions.filter(
    (d) => d.field !== undefined && !prefByField.has(d.field),
  );
  finalColDefs.push(...remainingDefs);

  // Apply the column definitions to the grid
  this.colDefs = finalColDefs;
  this.gridApi.setGridOption('columnDefs', this.colDefs);

  prefs.forEach((pref) => {
    // Apply visibility and pinned states
    this.gridApi.setColumnsVisible([pref.f], pref.v);
    this.gridApi.setColumnsPinned([pref.f], pref.pin);
  });

  // Apply Grouping
  const grouped = prefs.filter((c) => c.rowGroup);
  if (grouped.length) {
    const groupedFields = grouped.map((g) => g.f);
    this.gridApi.setRowGroupColumns(groupedFields);
  }

  // Restore filter state — but skip if navigation state is about to set its own filter
  if (!this.pendingColumnFilter && !this.skipRestoreGridFilters) {
    this.gridApi.setFilterModel(this.gridFilters);
  }
}




private applyGridPreferences(): void {
  if (!this.gridApi) return;
  // ... existing column-def logic unchanged ...

  // Restore filter state — but skip if navigation state is about to set its own filter
  if (!this.pendingColumnFilter && !this.skipRestoreGridFilters) {
    this.gridApi.setFilterModel(this.gridFilters);
  }
}


onGridReady(params: any) {
  this.gridApi = params.api;
  this.applyGridPreferences();
  this.addButtons();

  if (this.pendingColumnFilter) {
    this.applyGridFilter(this.pendingColumnFilter.field, [this.pendingColumnFilter.value]);
  } else {
    // No pending column filter from navigation — make sure the grid doesn't carry over a stale one
    this.gridApi.setColumnFilterModel('status', { filterType: 'multi', filterModels: [null, null] }).then(() => {
      this.gridApi.onFilterChanged();
    });
  }
}


private clearPendingColumnFilter(): void {
  this.pendingColumnFilter = undefined;
  this.gridFilters = null;   // add this — stop it from being reapplied later
  if (this.gridApi) {
    this.gridApi.setColumnFilterModel('status', { filterType: 'multi', filterModels: [null, null] }).then(() => {
      this.gridApi.onFilterChanged();
    });
  }
}

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
