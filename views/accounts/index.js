function calculateTotals(event) {
    // let model = App.getApp().getModel("Accounts");
    // let data = App.getApp().getModelData("Accounts");

    // let labels = data.labels;
    // let transactions = data.transactions.filter(x => );
    // let transactionTypes = data.transactionTypes;

    // let goodTransactionType = transactionTypes.find(x => x.good);
    // transactions.forEach(tran => {
    //     tran.amountDisplay = tran.amount >= 0 ? "$" + tran.amount : "-$" + tran.amount.toString().substr(1);
    //     tran.amountColor = tran.type.good ? "green" : "red";
    //     let dateParts = new Date(tran.date).toDateString().split(" ");
    //     tran.dateDisplay = dateParts[1] + " " + dateParts[2];
    //     tran.info = tran.memo ? tran.memo : tran.categories.map(x => x.name).join(", ");
    // })
    // let amounts = transactions.map(x => x.amount);
    // let balance = amounts.reduce((x, y) => {return x + y}, 0).toFixed(2);
    // let income = transactions.filter(x => x.typeId == 2);
    // income = income.length == 0 ? 0 : income.reduce((x, y) => {return x.amount + y.amount}, {amount: 0}).toFixed(2);
    // let expenses = transactions.filter(x => x.typeId == 1);
    // expenses = expenses.length == 0 ? 0 : expenses.reduce((x, y) => {return x.amount + y.amount}, {amount: 0}).toFixed(2);
        
        

    // model.balanceDisplay = (balance >= 0 ? "$" : "-$") + Math.abs(balance),
    // mmodel.incomeDisplay = (income >= 0 ? "$" : "-$") + Math.abs(income),
    // model.expensesDisplay = (expenses >= 0 ? "$" : "-$") + Math.abs(expenses),
    // model.balanceColor = balance < 0 && goodTransactionType.value < 0 ? "green" : "red";
}

function editTransaction(id) {
    App.getApp().navigateTo(TransactionsEditView.prototype.getRoute(id));
}