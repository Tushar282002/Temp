private initGraphOptions() {
  const self = this;

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
              const labelG = point.dataLabel?.element as HTMLElement | SVGElement | undefined;
              if (!labelG) return;

              // The actual HTML div lives nested inside the SVG "g" tracker element
              const htmlDiv = (labelG as any).querySelector
                ? (labelG as any).querySelector('div.opty-pie-chart-label')
                : null;

              const clickTarget: any = htmlDiv || labelG;

              if (clickTarget && !clickTarget._clickBound) {
                clickTarget._clickBound = true;
                clickTarget.style.cursor = 'pointer';
                clickTarget.style.pointerEvents = 'auto';
                clickTarget.addEventListener('click', (e: Event) => {
                  console.log('label clicked', point.name); // keep temporarily to confirm
                  e.stopPropagation();
                  self.navigateToFilteredOpportunities(point);
                });
              }
            });
          });
        },
      },
    },
    // ...rest (plotOptions, title, credits, tooltip, series, legend) unchanged from before
  } as any;
}
