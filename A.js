private updateChartInstance(data: OpportunityStageStatusSummaryResponse[]) {
  const newData: Highcharts.PointOptionsObject[] = data.map((item) => {
    const enumValue = getDescriptionFromSiebelString(item.stageStatus ?? '');
    return {
      id: enumValue ?? item.stageStatus ?? '',
      y: item.count,
      color: enumValue ? `var(${this._stageStatusToColorMap.get(enumValue)})` : '',
      name: this._stageStatusTextMap.get(enumValue) ?? enumValue,
      custom: {
        sortOrder: enumValue ? this._stageStatusSortOrderMap.get(enumValue) : Number.NaN,
        opportunityIds: item.opportunityIds ?? [],
      },
    } as Highcharts.PointOptionsObject;
  });

  if (!this._chartInstance) {
    return;
  }

  newData.sort((a: any, b: any) => (a.custom?.sortOrder ?? 0) - (b.custom?.sortOrder ?? 0));

  this._chartInstance.series[0].setData(newData);
  this.totalOptyCount.set(data.reduce((sum, current) => sum + (current.count ?? 0), 0));
  this.pointRef.emit(this._chartInstance.series.flatMap((s) => s.points));
  this._chartInstance?.series[0].show();
}


private initGraphOptions() {
  this.chartOptions = {
    chart: {
      type: 'pie',
      spacing: [0, 0, 0, 0],
      margin: [0, 0, 10, 0],
      marginLeft: 1,
      backgroundColor: 'transparent',
      events: {
        render: (event: any) => {
          const chart = event.target as Highcharts.Chart;
          chart.series.forEach((series) => {
            series.points.forEach((point: any) => {
              const labelEl = point.dataLabel?.element;
              if (labelEl && !labelEl._clickBound) {
                labelEl._clickBound = true;
                labelEl.style.cursor = 'pointer';
                labelEl.addEventListener('click', () => {
                  this.navigateToFilteredOpportunities(point);
                });
              }
            });
          });
        },
      },
    },
    plotOptions: {
      pie: {
        size: '100%',
        point: {
          events: {
            click: (event: PointClickEventObject) => {
              this.handlePieSegmentClick(event);
            },
          },
        },
      },
    },
    title: { text: undefined },
    credits: {
      enabled: false,
    },
    tooltip: {
      format:
        '<div>' +
        '<span style="color:{color}">\u25CF </span>' +
        '<span class="fs-x-small fw-normal"> {key} </span>' +
        '<span class="fs-x-small fw-bold"> {y}</span><div>',
    },
    series: [
      {
        clip: false,
        showInLegend: true,
        innerSize: '55%',
        allowPointSelect: true,
        cursor: 'pointer',
        borderWidth: 0,
        borderRadius: 0,
        dataLabels: {
          connectorWidth: 0,
          distance: '1%',
          borderRadius: 25,
          shape: 'none',
          useHTML: true,
          format: '<div class="opty-pie-chart-label #{point.id}">{point.y}</div>',
          shadow: {
            color: '#B4BABF',
          },
        },
      } as any,
    ],
    legend: this.legendOptions() as Highcharts.Options,
  } as any;
}

private handlePieSegmentClick(event: PointClickEventObject): void {
  this.navigateToFilteredOpportunities(event.point);
}

/**
 * Handles navigation from pie chart segment (slice or label) click to pre-filtered Opportunity grid.
 * Passes stage/status filter and opportunity IDs for pre-selection.
 */
private navigateToFilteredOpportunities(point: Highcharts.Point): void {
  const pointName = point.name;
  // e.g., "Identified", "Pitched", "Closing", "Won", "Lost"

  // Get opportunity IDs from the point data (custom property is set in updateChartInstance)
  const pointWithData = point as unknown as { custom?: Record<string, unknown> };
  const rawOpportunityIds = pointWithData.custom?.['opportunityIds'];

  // Defensive type check: API may return a string, null, undefined, or array
  let opportunityIds: string[] = [];
  if (Array.isArray(rawOpportunityIds)) {
    opportunityIds = rawOpportunityIds as string[];
  } else if (typeof rawOpportunityIds === 'string') {
    opportunityIds = rawOpportunityIds.trim() ? [rawOpportunityIds] : [];
  }

  // Map point name to stage/status enum values
  const stageStatus = this.getStageStatusFromPointName(pointName);

  // Store in module state for OpportunityListComponent to read
  // Preserve existing custom preferences (e.g., teamMember, cSuite) while adding/overriding specific filters
  const existingState = (this._stateService.getState(ModuleType.Opportunity) ?? {}) as ModuleState;

  const mergedPreference = {
    ...(existingState.customPreference || {}),
    [CustomPreferenceKeys.timePeriod]:
      existingState.customPreference?.[CustomPreferenceKeys.timePeriod] ?? this._dashboardFilter?.duration,
    [CustomPreferenceKeys.teamMember]:
      existingState.customPreference?.[CustomPreferenceKeys.teamMember] ??
      (this._dashboardFilter?.teamMemberEid === this._dashboardFilter?.employeeId
        ? 'All'
        : this._dashboardFilter?.teamMemberEid),
    [CustomPreferenceKeys.cSuite]:
      existingState.customPreference?.[CustomPreferenceKeys.cSuite] ?? this._dashboardFilter?.isCSuite,
    [CustomPreferenceKeys.accessList]: 0,
    [CustomPreferenceKeys.clientId]: this.summaryFetchRequest().entityId ?? null,
    [CustomPreferenceKeys.filterIds]: opportunityIds.join(','),
    [CustomPreferenceKeys.stage]: stageStatus?.stage ?? '',
    [CustomPreferenceKeys.opportunityStatuses]: stageStatus?.status ?? [],
  };

  const opportunityState: ModuleState = {
    selectedMenu: Number(this.summaryFetchRequest().myOrTeamLevel1Filter ?? '0'),
    customPreference: this._stateService.updateRecordCustomState(
      ModuleType.Opportunity,
      mergedPreference,
    ),
  };

  this._stateService.updateState(ModuleType.Opportunity, opportunityState);

  // Navigate using Angular Router
  this._router.navigate(['/opportunities/list']);
            }
