function AppDatabase() {
    this.repository = new BrowserRepository("MeganMoneyDB", 1);
    this.tryLimit = 3;
    this.waitTime = 250;
}
AppDatabase.prototype.tables = {
    transactions: "transactions",
    labels: "labels",
    budgets: "budgets",
    transactionTypes: "transactionTypes",
    budgetLimitTypes: "budgetLimitTypes"
}

AppDatabase.prototype.try = function(callback) {
    return new TaskTrier({errors: [BrowserRepositoryError]}).try(3, 250, callback);
}

AppDatabase.prototype.connect = function() {
    return this.try( () =>
        this.repository.open((event) => {
            //We need to upgrade the DB
            let db = event.target.result;
            console.log("Upgrading MeganMoneyDB from v" + event.oldVersion + " to v" + event.newVersion);

            //Transaction Types
            let transactionTypesStore = db.createObjectStore(AppDatabase.prototype.tables.transactionTypes, {keyPath: "id", autoIncrement: true});
            transactionTypesStore.add({id: 1, name: "Expense", value: 1, good: false});
            transactionTypesStore.add({id: 2, name: "Credit", value: -1, good: true});
            //Budget Limit Types
            let budgetLimitTypesStore = db.createObjectStore(AppDatabase.prototype.tables.budgetLimitTypes, {keyPath: "id", autoIncrement: true});
            budgetLimitTypesStore.add({id: 1, name: "None"});
            budgetLimitTypesStore.add({id: 2, name: "Min"});
            budgetLimitTypesStore.add({id: 3, name: "Max"});
            budgetLimitTypesStore.add({id: 4, name: "Equal"});
            //Create labels table
            let labelsStore = db.createObjectStore(AppDatabase.prototype.tables.labels, {keyPath: "id", autoIncrement: true});
            labelsStore.createIndex("name", "name", {unique: true});
            labelsStore.add({id: 1, name: "Default", color: "#FF0000", isCategory: true, isPaymentMethod: true });
            //Create transactions table
            let transactionStore = db.createObjectStore(AppDatabase.prototype.tables.transactions, {keyPath: "id", autoIncrement: true});
            transactionStore.createIndex("period", "period");
            //Create budgees table
            let budgetsStore = db.createObjectStore(AppDatabase.prototype.tables.budgets, {keyPath: "id", autoIncrement: true});
        })
    );
}

AppDatabase.prototype.reset = function() {
    return this.repository.deleteDatabase()
    .then(res => {
        return this.connect();
    });
}

//DB Operations
AppDatabase.prototype.select = function(table, value, column) {
    let repository = this.repository;
    return this.connect()
    .then(event =>
        this.try(() =>
            repository.read([table], (transaction) => {
                var objectStore = transaction.objectStore(table);
                var request = column === undefined ? objectStore : objectStore.index(column);
                return request.get(value);
            })
        )
    )
    .then(request => request.result);
}
AppDatabase.prototype.selectAll = function(table, value, column) {
    let repository = this.repository;
    return this.connect()
    .then(event =>
        this.try(() =>
            repository.read([table], (transaction) => {
                var objectStore = transaction.objectStore(table);
                var request = column === undefined ? objectStore : objectStore.index(column);
                return request.getAll(value);
            })
        )
    )
    .then(request => request.result);
}
AppDatabase.prototype.update = function(table, data) {
    let repository = this.repository;
    let rows = Array.isArray(data) ? data : [data];

    return this.connect()
    .then(event =>
        this.try(() => {
            return repository.write([table], (transaction) => {
                var objectStore = transaction.objectStore(table);
                let requests = [];
                rows.forEach(row => {
                    requests.push(objectStore.put(row));
                });
                return requests;
            })
        })
    )
    .then(requests => {
        for(let i = 0; i < rows.length; i++)
            rows[i].id = requests[i].result;
        return data;
    });
}
AppDatabase.prototype.delete = function(table, value, column) {
    let repository = this.repository;
    return this.connect()
    .then(event =>
        this.try(() =>
            repository.write([table], (transaction) => {
                var objectStore = transaction.objectStore(table);
                var request = column === undefined ? objectStore : objectStore.index(column);
                return request.delete(value);
            })
        )
    )
    .then(request => request.result);
}
AppDatabase.prototype.readCursor = function(table, callback) {
    let repository = this.repository;
    let result = 0;
    return this.connect()
    .then(event =>
        this.try(() => 
            repository.readCursor([table], callback)
        )
    )
    .then(request => request.result);
}
AppDatabase.prototype.writeCursor = function(table, callback) {
    let repository = this.repository;
    let result = 0;
    return this.connect()
    .then(event =>
        this.try(() => 
            repository.readCursor([table], callback)
        )
    )
    .then(request => request.result);
}

//Transaction Types
AppDatabase.prototype.getTransactionType = function(value, column) {
    return this.select(AppDatabase.prototype.tables.transactionTypes, value, column);
}
AppDatabase.prototype.getTransactionTypes = function() {
    return this.selectAll(AppDatabase.prototype.tables.transactionTypes);
}
AppDatabase.prototype.saveTransactionTypes = function(types) {
    return this.update(AppDatabase.prototype.tables.transactionTypes, types);
}
//Budget Limit Types
AppDatabase.prototype.getBudgetLimitType = function(value, column) {
    return this.select(AppDatabase.prototype.tables.budgetLimitTypes, value, column);
}
AppDatabase.prototype.getBudgetLimitTypes = function() {
    return this.selectAll(AppDatabase.prototype.tables.budgetLimitTypes);
}
//Labels
AppDatabase.prototype.getLabel = function(value, column) {
    return this.select(AppDatabase.prototype.tables.labels, value, column);
}
AppDatabase.prototype.getLabels = function() {
    return this.selectAll(AppDatabase.prototype.tables.labels);
}
AppDatabase.prototype.saveLabel = function(label) {
    return this.update(AppDatabase.prototype.tables.labels, label);
}
AppDatabase.prototype.deleteLabel = function(value, column) {
    return this.delete(AppDatabase.prototype.tables.labels, value, column);
}
AppDatabase.prototype.labelIsInUse = function(id) {
    let response = false;
    return this.readCursor(AppDatabase.prototype.tables.transactions, (cursor) => {
        if(cursor) {
            let value = cursor.value.categoryIds;
            if(value && value.findIndex(x => x === id) > -1)
                response = true;
            else
                cursor.continue();
        }
        else {

        }
        return response;
    });
}
//Transactions
AppDatabase.prototype.getTransaction = function(value, column) {
    return this.select(AppDatabase.prototype.tables.transactions, value, column);
}
// AppDatabase.prototype.getTransactions = function(period) {
//     return this.selectAll(AppDatabase.prototype.tables.transactions, period, period ? "period" : undefined);
// }
AppDatabase.prototype.getTransactions = function(startDate, endDate) {
    let transactions = [];
    return this.readCursor(AppDatabase.prototype.tables.transactions, (cursor) => {
        if(cursor) {
            let date = cursor.value.date;
            if(date >= startDate && date <= endDate)
                transactions.push(cursor.value);
            cursor.continue();
        }
        else {
        }
        return transactions;
    });
}
AppDatabase.prototype.saveTransaction = function(transaction) {
    return this.update(AppDatabase.prototype.tables.transactions, transaction);
}
AppDatabase.prototype.deleteTransaction = function(value, column) {
    return this.delete(AppDatabase.prototype.tables.transactions, value, column);
}