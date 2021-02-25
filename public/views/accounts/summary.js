function generateChart(event) {
    let chartName = event.varName;

    let charts = App.getApp().getModel("Accounts").charts;

    let chartContext = document.getElementById(chartName).getContext("2d");
    let chart = new Chart(chartContext, charts[chartName]);
    let size = (chart.legend.height + 300) + "px";
    // chart.chart.height = "300px"
    // chart.chart.width = "300px"
    // chart.canvas.parentNode.style.height = size;
    // chart.canvas.parentNode.style.width = size;

    // let chartContext = document.getElementById(chartName).getContext("2d");
    // new Chart(chartContext, {
    //         type: "pie",
    //         data: {labels: ["Test", "hello"],
    //             datasets: [{
    //                 data: [12, [12, 12]]
    //             }]
    //         },
    //         options: {}
    // });

    // let categoryCostsChart = new Chart(categoryCosts, {
    //     type: "pie",
    //     data: {labels: Object.keys(data.categoryGroupings),
    //         datasets: [{
    //             data: Object.values(data.categoryGroupings)
    //         }]
    //     },
    //     options: {}
    // });
}

function generateCharts() {
    let data = App.getApp().getModelData("Accounts");
    if(!data)
        return;

    let charts = JSON.parse(JSON.stringify(data.charts));
    Object.keys(charts).forEach(chartName => {
        let chartContext = document.getElementById(chartName).getContext("2d");
        let chart = new Chart(chartContext, charts[chartName]);
        let size = (chart.legend.height + 300) + "px";
    });
    
}