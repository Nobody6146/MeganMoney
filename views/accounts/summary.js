function generateChart(event) {
    //console.log(event);
    let chartName = event.varName;
    let rawChart = App.getApp().getModelData("Accounts").charts[chartName];
    if(!rawChart)
        return;

    let chartDiv = document.querySelector("#" + chartName);
    let chartOptions = new ChartOptions(rawChart.title, 200);
    let chartData = Object.keys(rawChart.data).map(label => {
        let data = rawChart.data[label];
        return new ChartData(label, data.value.toFixed(2), data.color);
    });
    let chart = new Chart(chartDiv, chartOptions);
    chart.drawPieChart(chartData);
}

function log(event) {
    throw Error();
}