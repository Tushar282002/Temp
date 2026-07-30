private updateChartInstance(data: OpportunityStageStatusSummaryResponse[]) {
  const newData: Highcharts.PointOptionsObject[] = data.map((item) => {
    const enumValue = getDescriptionFromSiebelString(item.stageStatus ?? '');
    return {
      id: enumValue ?? item.stageStatus ?? '',   // add this — stable, unique per slice
      y: item.count,
      color: enumValue ? `var(${this._stageStatusToColorMap.get(enumValue)})` : '',
      name: this._stageStatusTextMap.get(enumValue) ?? enumValue,
      custom: {
        sortOrder: enumValue ? this._stageStatusSortOrderMap.get(enumValue) : Number.NaN,
        opportunityIds: item.opportunityIds ?? [],
      },
    };
  });

  if (!this._chartInstance) return;

  newData.sort((a, b) => (a.custom?.['sortOrder'] ?? 0) - (b.custom?.['sortOrder'] ?? 0));
  this._chartInstance.series[0].setData(newData);
  this.totalOptyCount.set(data.reduce((sum, current) => sum + (current.count ?? 0), 0));
  this.pointRef.emit(this._chartInstance.series.flatMap((s) => s.points));
  this._chartInstance?.series[0].show();
}


private handlePieSegmentClick(event: PointClickEventObject): void {
  this.navigateToFilteredOpportunities(event.point);
}

private navigateToFilteredOpportunities(point: Highcharts.Point): void {
  const pointName = point.name;
  // ...everything currently inside handlePieSegmentClick, but reading from `point` instead of `event.point`
  // (rename `point` references accordingly — the body logic itself is unchanged)
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
        render: (event) => {
          const chart = event.target as Highcharts.Chart;
          chart.series.forEach((series) => {
            series.points.forEach((point) => {
              const labelEl = point.dataLabel?.element;
              if (labelEl && !(labelEl as any)._clickBound) {
                (labelEl as any)._clickBound = true; // avoid re-binding on every re-render
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
    // ...rest of chartOptions unchanged (plotOptions, tooltip, series, etc.)
  };
                 }
