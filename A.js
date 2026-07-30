events: {
  render: function (this: Highcharts.Chart) {
    const chart = this;
    chart.series.forEach((series) => {
      series.points.forEach((point: any) => {
        const labelEl = point.dataLabel?.element;
        if (labelEl && !labelEl._clickBound) {
          labelEl._clickBound = true;
          labelEl.style.cursor = 'pointer';
          labelEl.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            navigateToFilteredOpportunitiesRef(point);
          });
        }
      });
    });
  },
},


private initGraphOptions() {
  const self = this; // capture component instance

  this.chartOptions = {
    chart: {
      type: 'pie',
      spacing: [0, 0, 0, 0],
      margin: [0, 0, 10, 0],
      marginLeft: 1,
      backgroundColor: 'transparent',
      events: {
        render: function (this: Highcharts.Chart) {
          this.series.forEach((series) => {
            series.points.forEach((point: any) => {
              const labelEl = point.dataLabel?.element;
              if (labelEl && !labelEl._clickBound) {
                labelEl._clickBound = true;
                labelEl.style.cursor = 'pointer';
                labelEl.addEventListener('click', (e: Event) => {
                  e.stopPropagation();
                  self.navigateToFilteredOpportunities(point);
                });
              }
            });
          });
        },
      },
    },
    // ...rest unchanged (plotOptions, title, credits, tooltip, series, legend)
  } as any;
              }

.opty-pie-chart-label {
  pointer-events: auto;
  z-index: 10;
  position: relative;
}
