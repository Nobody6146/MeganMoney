function generateChart(event) {
    let chartName = event.model;
    let charts = GetApp().getModal("Budgets").charts;

    let chartContext = document.getElementById(chartName).getContext("2d");
    let chart = new Chart(chartContext, charts[chartName]);

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