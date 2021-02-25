function MeganMoneyView(name) {
    this.name = name;
    SootheView.call(this);
}
MeganMoneyView.prototype = Object.create(SootheView.prototype);
MeganMoneyView.prototype.getTitle = function() {
    return 'MeganMoney | ' + this.name;
}
MeganMoneyView.prototype.getRoot = function() {
    return document.querySelector(".main-content");
}
MeganMoneyView.prototype.processData = function(data) {
    let app = App.getApp();
    var model = app.bindModel(this.name, data);
}
MeganMoneyView.prototype.getRoute = function() {
    return "#";
}
MeganMoneyView.prototype.startRendering = function() {
    App.displayWaitingModal();
    let baseTabStyle = "nav-tab";
    let currentPage = {Dashboard: baseTabStyle, Labels: baseTabStyle, Accounts: baseTabStyle, Budgets: baseTabStyle, Settings: baseTabStyle};
    currentPage[this.name] += " tab-selected";
    App.getApp().bindModel("pageInfo", currentPage);
}
MeganMoneyView.prototype.finishRendering = function(error) {
    if(!error) {
        App.dismissModals();
    }
    else {
        App.displayErrorModal(error.message);
        console.error(error);
    }
}


//============ Login ===========//
function LoginView() {
    MeganMoneyView.call(this, "Login");
}
LoginView.prototype = Object.create(MeganMoneyView.prototype);
LoginView.prototype.getRoute = function() {
    return "#login";
}
LoginView.prototype.getHTML = function() {
    return fetch("views/login.html");
}
LoginView.prototype.getJavasScript = function() {
    return fetch("views/login.js");
}
LoginView.prototype.getData = function() {
    return {
        username: "",
        password: "",
        message: "", 
    };
};
//====
//============ Dashboard ==============//
function DashboardView() {
    MeganMoneyView.call(this,"Dashboard");
}
DashboardView.prototype = Object.create(MeganMoneyView.prototype);
DashboardView.prototype.getRoute = function() {
    return "#dashboard";
}
DashboardView.prototype.getHTML = function() {
   return fetch("views/dashboard/index.html");
}
DashboardView.prototype.getData = function(req) {
    return AppData.getTransactions()
    .then(transactions => {
        let balance = transactions.reduce((x, y) => {return x + y.amount}, 0);
        let expenses = transactions.filter(x => x.amount >= 0);
        
        let date = new Date();
        let days = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate() - date.getDate();
        date = date.toDateString();
        return {
            date: date.substr(0, date.lastIndexOf(" ")),
            days: days,
            username: "User",
            balance: balance >= 0 ? "$" + balance : "-$" + balance.toString().substr(1),
            balanceColor: balance >= 0 ? "green" : "red",
            expenses: "$" + expenses.reduce((x, y) => {return x + y.amount}, 0),
            charges: expenses.length
        }
    })
}
//============ Settings ==============//
function SettingsView () {
    MeganMoneyView.call(this,"Settings");
}
SettingsView.prototype = Object.create(MeganMoneyView.prototype);
SettingsView.prototype.getRoute = function() {
    return "#settings";
}
SettingsView.prototype.getHTML = function() {
    return fetch("views/settings/index.html");
}
SettingsView.prototype.getJavasScript = function() {
    return fetch("views/settings/index.js");
}
SettingsView.prototype.getData = function(req) {
    return AppData.getTransactionTypes()
    .then(transactionTypes => {
        return {
            positive: transactionTypes.find(x => x.value === 1).id,
            good: transactionTypes.find(x => x.good).id,
            transactionTypes
        };
    });
}
//============ Labels ==============//
function LabelsView() {
    MeganMoneyView.call(this,"Labels");
}
LabelsView.prototype = Object.create(MeganMoneyView.prototype);
LabelsView.prototype.getRoute = function() {
    return "#labels";
}
LabelsView.prototype.getHTML = function() {
    return fetch("views/labels/index.html");
}
LabelsView.prototype.getData = function() {
    return AppData.getLabels()
    .then(labels => {
        for(let i = 0; i < labels.length; i++)
            labels[i].index = i + 1;
        return {labels};
    });
}
LabelsView.prototype.getJavasScript = function() {
    return fetch("views/labels/index.js");
}
//====
function LabelsEditView() {
    MeganMoneyView.call(this,"Labels");
}
LabelsEditView.prototype = Object.create(MeganMoneyView.prototype);
LabelsEditView.prototype.getRoute = function(id) {
    return LabelsView.prototype.getRoute() + "/" + (id !== undefined ? id : ":id");
}
LabelsEditView.prototype.getHTML = function() {
    return fetch("views/labels/edit.html");
}
LabelsEditView.prototype.getJavasScript = function() {
    return fetch("views/labels/edit.js");
}
LabelsEditView.prototype.getData = function(req) {
    let id = Number.parseInt(req.params.id);
    return id > 0 ? AppData.getLabel(id)
        : Promise.resolve()
    .then(label => {
        if(label)
            return label;
        else
            return  {
                name: "",
                color: "#000000",
                isPaymentMethod: false,
                isCategory: true,
            }
    });   
}
//============ Transactions ==============//
function TransactionsView() {
    MeganMoneyView.call(this,"Accounts");
}
TransactionsView.prototype = Object.create(MeganMoneyView.prototype);
TransactionsView.prototype.getRoute = function() {
    return "#accounts";
}
TransactionsView.prototype.getHTML = function() {
    return fetch("views/accounts/index.html");
}
TransactionsView.prototype.getData = function() {
    let trans = [];
    return Promise.all([AppData.getTransactions(), AppData.getLabels(), AppData.getTransactionTypes()])
    .then(res => {
        let transactions = res[0];
        let labels = res[1];
        let transactionTypes = res[2];
        
        let goodTransactionType = transactionTypes.find(x => x.good);
        transactions.forEach(tran => {
            tran.amountDisplay = tran.amount >= 0 ? "$" + tran.amount : "-$" + tran.amount.toString().substr(1);
            tran.amountColor = tran.type.good ? "green" : "red";
            let dateParts = new Date(tran.date).toDateString().split(" ");
            tran.dateDisplay = dateParts[1] + " " + dateParts[2];
            tran.info = tran.memo ? tran.memo : tran.categories.map(x => x.name).join(", ");
        })
        let amounts = transactions.map(x => x.amount);
        let balance = amounts.reduce((x, y) => {return x + y}, 0).toFixed(2);
        let income = transactions.filter(x => x.typeId == 2);
        income = income.length == 0 ? 0 : income.reduce((total, x) => {return total + x.amount}, 0).toFixed(2);
        let expenses = transactions.filter(x => x.typeId == 1);
        expenses = expenses.length == 0 ? 0 : expenses.reduce((total, x) => {return total + x.amount}, 0).toFixed(2);
        
        

        return {transactions, labels, transactionTypes, summaryLink: TransactionsSummaryView.prototype.getRoute(),
            balance,
            income,
            expenses,
            balanceDisplay: (balance >= 0 ? "$" : "-$") + Math.abs(balance),
            incomeDisplay: (income >= 0 ? "$" : "-$") + Math.abs(income),
            expensesDisplay: (expenses >= 0 ? "$" : "-$") + Math.abs(expenses),
            balanceColor: balance < 0 && goodTransactionType.value < 0 ? "green" : "red",
            categories: labels.filter(x => x.isCategory),
            filters: labels.filter(x => x.isCategory).reduce((x, y) => x + "," + y, "").id
        };
    });
}
TransactionsView.prototype.getJavasScript = function() {
    return fetch("views/accounts/index.js");
}
//====
function TransactionsEditView() {
    MeganMoneyView.call(this,"Accounts");
}
TransactionsEditView.prototype = Object.create(MeganMoneyView.prototype);
TransactionsEditView.prototype.getRoute = function(id) {
    return TransactionsView.prototype.getRoute() + "/edit/" + (id !== undefined ? id : ":id");
}
TransactionsEditView.prototype.getHTML = function() {
    return fetch("views/accounts/edit.html");
}
TransactionsEditView.prototype.getJavasScript = function() {
    return fetch("views/accounts/edit.js");
}
TransactionsEditView.prototype.getData = function(req) {
    let id = Number.parseInt(req.params.id);
    let tran = {};
    let period = AppData.getPeriod();
    return Promise.all([id > 0 ? AppData.getTransaction(id) : Promise.resolve()
        , AppData.getLabels(), AppData.getTransactionTypes()])
    .then(res => {
        let transaction = res[0];
        let labels = res[1];
        let transactionTypes = res[2];
        if(!transaction)
            transaction = {
                id: 0,
                amount: 0,
                date: new Date() > period.endDate ? period.startDate : new Date(),
                paymentMethodId: "",
                memo: "",
                categories: [],
                typeId: 1
            };

        transaction.date = transaction.date.toISOString().substr(0, 10),
        transaction.categoryLabels = labels.filter(x => x.isCategory);
        transaction.paymentMethodLabels = labels.filter(x => x.isPaymentMethod);
        transaction.transactionTypes = transactionTypes;
        return transaction;
    });
}

function TransactionsSummaryView() {
    MeganMoneyView.call(this,"Accounts");
}
TransactionsSummaryView.prototype = Object.create(MeganMoneyView.prototype);
TransactionsSummaryView.prototype.getRoute = function() {
    return TransactionsView.prototype.getRoute() + "/summary";
}
TransactionsSummaryView.prototype.getHTML = function() {
    return fetch("views/accounts/summary.html");
}
TransactionsSummaryView.prototype.getData = function() {
    return Promise.all([AppData.getTransactions(), AppData.getLabels()])
    .then(res => {
        let transactions = res[0];
        let labels = res[1];
        let groupBy = function(fieldName, array) {
            let groupings = {};
            array.forEach(tran => {
                let key = tran[fieldName];
                let grouping = groupings[key] != undefined ? groupings[key] : [];
                grouping.push(tran.amount);
                groupings[key] = grouping;
            });
            return groupings;
        }
        let groupByTags = function(fieldName, array) {
            let groupings = {};
            // groupings["<TAGLESS>"] = [];
            // array.filter(x => x.tags == null || x.tags.length === 0).forEach(x =>
            //     groupings["<TAGLESS>"].push(x.amount)
            // );
            array.forEach(tran => {
                tran.categories.forEach(tag => {
                    let key = tag[fieldName];
                    let grouping = groupings[key] !== undefined ? groupings[key] : [];
                    grouping.push(tran.amount);
                    groupings[key] = grouping;
                })
            });
            return groupings;
        }
        let generateChart = function(chartName, chartType, array) {
            let keys = Object.keys(array);
            let values = Object.values(array).map(value => value.reduce( (x, y) => x + y, 0)).map(x => x.toFixed(2));
            let labels = [];
            for(let i = 0; i < keys.length; i++)
                labels.push(keys[i] + " (" + values[i] + ")");
            let total = values.reduce((x, y) => x + y, 0);//.reduce((x, y) => x + y, 0);
            return {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: keys.map(key => GetLabels().find(label => label.name === key)).map(x => x != null ? x.color : "#000000")
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    title: {
                        display: true,
                        text: chartName
                    },
                    legend: {
                        display: true
                    },
                    // plugins: {
                    //     datalabels: {
                    //         formatter: (value, ctx) => {
                    //             let datasets = ctx.chart.data.datasets;
                    //             if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                    //                 console.log(datasets[0].data);
                    //                 console.log(ctx);
                    //               let sum = "$" + value;
                                
                    //               return sum;
                    //             } else {
                    //               return sum;
                    //             }
                    //           },
                    //         color: '#EEEEEE',
                            
                    //     }
                    // }
                }
            };
        }
        
        transactions.forEach(tran => {
            tran.categories.push(labels.find(x => x.name === tran.primaryCategory));
            tran.categories = tran.categories;
        });
        let transactionCounts = transactions.map(tran => {
            return {
                category: tran.category,
                paymentMethod: tran.paymentMethod,
                categories: tran.categories,
                amount: 1 
            }
        })
        // let charts = {};
        // charts.incomeByCategory = generateChart("Net Income by Category", "pie", groupBy("category", transactions));
        let charts = {
            incomeByCategory: generateChart("Net Income by Category", "pie", groupByTags("name", transactions)),
            transactionsByCategory: generateChart("Transactions by Category", "pie", groupByTags("name", transactionCounts)),
            incomeByPayment: generateChart("Net Income by Payment Method", "pie", groupBy("paymentMethod", transactions)),
            transactionsByPayment: generateChart("Transactions by Payment Method", "pie", groupBy("paymentMethod", transactionCounts)),
        }

        // console.log(charts);
        // console.log(groupBy("category", transactions));
        // console.log(generateChart("Net Income by Category", "pie", groupBy("category", transactions)))
        return {
            charts: charts,
            labels: labels,
            accountsLink: TransactionsView.prototype.getRoute(),
            chartsList: Object.keys(charts)
        };
    });
}
TransactionsSummaryView.prototype.getJavasScript = function() {
    return fetch("views/accounts/summary.js");
}


//============ Budgets ==============//
function BudgetsView() {
    MeganMoneyView.call(this,"Budgets");
}
BudgetsView.prototype = Object.create(MeganMoneyView.prototype);
BudgetsView.prototype.getRoute = function() {
    return "#budgets";
}
BudgetsView.prototype.getHTML = function() {
    return "<h2>Cooming Soon!</h2>"
    return fetch("views/budgets/index.html");
}
// BudgetsView.prototype.getData = function() {
//     let plans = GetBudgetPlans();
//     let data = {plans: []};
//     for(var i = 0; i < plans.length; i++) {
//         let plan = plans[i];
//         data.plans.push({
//             index: i + 1,
//             id: plan.id,
//             name: plan.name,
//         });
//     }
//     return data;
// }
// BudgetsView.prototype.getJavasScript = function() {
//     return fetch("views/budgets/index.js");
// }
//====
function BudgetsEditView() {
    MeganMoneyView.call(this,"Budgets");
}
BudgetsEditView.prototype = Object.create(MeganMoneyView.prototype);
BudgetsEditView.prototype.getRoute = function(id) {
    return BudgetsView.prototype.getRoute() + "/" + (id ? id : ":id") + "/edit";
}
BudgetsEditView.prototype.getHTML = function() {
    return fetch("views/budgets/edit.html");
}
BudgetsEditView.prototype.getJavasScript = function() {
    return fetch("views/budgets/edit.js");
}
BudgetsEditView.prototype.getData = function(req) {
    let id = req.params.id;

    let plan = GetBudgetPlans().filter(x => x.id == id).map(x => x);
    let labels = GetLabels();
    if(plan.length === 0)
        plan = {
            id: 0,
            name: null,
            budgets: [],
            index: 0
        };
    else
        plan = plan[0];


    plan.budgetTypes = GetBudgetTypes();
    plan.limitTypes = GetLimitTypes();
    plan.labels = [
        labels.filter(x => x.isCategory),
        labels.filter(x => x.isTag),
        labels.filter(x => x.isPaymentMethod)
    ];
    plan.tagLabels = labels.filter(x => x.isTag);
    plan.paymentMethodLabels = labels.filter(x => x.isPaymentMethod);
    GetApp().bindModel(plan, "Plan");
    return {
        
    }
}
//====
function BudgetsSummaryView() {
    MeganMoneyView.call(this,"Budgets");
}
BudgetsSummaryView.prototype = Object.create(MeganMoneyView.prototype);
BudgetsSummaryView.prototype.getRoute = function(id) {
    return BudgetsView.prototype.getRoute() + "/" + (id ? id : ":id");
}
BudgetsSummaryView.prototype.getHTML = function() {
    return fetch("views/budgets/summary.html");
}
BudgetsSummaryView.prototype.getData = function(req, res) {
    let labels = GetLabels();
    let transactions = GetTransactions();

    let budgetTypes = [
        function (budget, id) {
            return budget.categoryId === id;
        },
        function (budget, id) {
            return budget.tags.find(x => x.id === id);
        },
        function (budget, id) {
            return budget.paymentMethodId === id;
        }
    ];

    let plan = GetBudgetPlans().find(x => x.id == req.params.id);
    let budgets = plan.budgets.map(x => {
        let y = JSON.parse(JSON.stringify(x));
        let trans = transactions.filter(z => budgetTypes[y.typeId - 1](z, y.labelId));
        y.transactions = trans.length;
        y.total = trans.map(x => x.amount).reduce((a, b) => a + b, 0.0);
        return y;
    });

    let generateChart = function(chartName, chartType, array, colors) {
        let keys = array.map(x => x.name);
        let values = array.map(x => x.value);
        let labels = [];
        for(let i = 0; i < keys.length; i++)
            labels.push(keys[i] + " (" + values[i] + ")");
        var chart = {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    data: values.map(x => x.toFixed(2)),
                    backgroundColor: colors ? colors : keys.map(key => GetLabels().find(label => label.name === key).color),
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: chartName
                },
                legend: {
                    display: chartType === "pie" ? true : false
                }
            }
        };
        if(chartType === "pie")
            chart.scales = [{
                ticks: {
                    suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                    // OR //
                    beginAtZero: true   // minimum value will be 0.
                }
            }];
        return chart;
    }

    let generateChartFromDataSets = function(chartName, chartType, datasets, labels) {
        var chart = {
            type: chartType,
            data: {
                labels: labels,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: chartName
                },
                legend: {
                    display: false
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                responsive: true,
                scales: {
                    ticks: {
                        suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                        // OR //
                        beginAtZero: true   // minimum value will be 0.
                    },
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [{
                        stacked: true,
                    }],
                }
            }
        };
 
        return chart;
    }

    let charts = {
        
    }

    // budgets.forEach(budget => {
    //     let key = budget.name;
    //     let color = data.labels.find(label => label.name === key).color;
    //     charts[key + "Totals"] = generateChart(key + " Budget", "bar", [
    //         {name: "Budget", value: budget.total.toFixed(2)},
    //         {name: "Limit", value: budget.limitAmount.toFixed(2)}
    //     ], [color, invertColor(color)], false);
    // });

    let chartLabels = [];
    let budgetsDataset = {backgroundColor: [], data: [], label: "Budget"};
    let limitsDataset = {backgroundColor: [], data: [], label: "Limit"};
    budgets.forEach(budget => {

        let label = GetLabels().find(label => label.name === budget.name);
        budgetsDataset.backgroundColor.push(label.color);
        budgetsDataset.data.push(budget.total.toFixed(2));
        limitsDataset.backgroundColor.push("#000000");//invertColor(label.color));
        limitsDataset.data.push(budget.limitAmount.toFixed(2));
        chartLabels.push(budget.name + "\n(Limit: " + budget.limit + ")");

        // let key = budget.name;
        // let color = data.labels.find(label => label.name === key).color;
        // charts["Budget Totals"] = generateChart(key + " Budget", "bar", [
        //     {name: "Budget", value: budget.total.toFixed(2)},
        //     {name: "Limit", value: budget.limitAmount.toFixed(2)}
        // ], [color, invertColor(color)], false);
        // console.log(charts[key + "Totals"]);
    });
    charts["limitsTotals"] = generateChartFromDataSets("Budget Limits", "horizontalBar", [budgetsDataset, limitsDataset], chartLabels);
    charts["budgetTotals"] = generateChart("Budget Totals", "pie", budgets.map(x => {
        return {name: x.name, value: x.total}
    }), null, true),
    charts['budgetCounts'] = generateChart("Budget Transactions", "pie", budgets.map(x => {
        return {name: x.name, value: x.transactions}
    }), null, true)
    
    return {
        charts,
        labels: labels,
        planId: req.params.id
    };
}
BudgetsSummaryView.prototype.getJavasScript = function() {
    return fetch("views/budgets/summary.js");
}