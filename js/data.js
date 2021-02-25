function AppData() {
    
}

function AppDataError(message, fileName, lineNumber) {
    var instance = new Error(message, fileName, lineNumber);
    instance.name = 'AppDataError';
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, AppDataError);
    }
    return instance;
}
AppDataError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
    }
});

AppData.sort = async function(array, prop) {
    return array.sort((a, b) => {
        var x = a[prop].toLowerCase ? a[prop].toLowerCase() : a[prop];
        var y = b[prop].toLowerCase ? b[prop].toLowerCase() : b[prop];
        if (x < y) {return -1;}
        if (x > y) {return 1;}
        return 0;
    });
}

AppData.clearData = function() {
    new AppStorage().clearData();
    return new AppDatabase().reset();
}

AppData.getPeriod = function() {
    return new AppStorage().getPeriod();
}
AppData.setPeriod = function(startDate, endDate) {
    return new AppStorage().setPeriod(startDate, endDate);
}

//Transaction Types
AppData.getTransactionType = async function(id) {
    return new AppDatabase().getTransactionType(id);
}
AppData.getTransactionTypes = async function() {
    return new AppDatabase().getTransactionTypes()
    .then(types => AppData.sort(types, "name"));
}
AppData.saveTransactionTypes = async function(types) {
    types = types.map(x => {
        return {
            id: x.id,
            name: x.name,
            value: x.value,
            good: x.good
        }
    });
    return new AppDatabase().saveTransactionTypes(types);
}
//Budget Types
AppData.getBudgetLimitType = async function(id) {
    return new AppDatabase().getBudgetLimitType(id);
}
AppData.getBudgetLimitTypes = async function() {
    return new AppDatabase().getBudgetLimitTypes()
    .then(types => AppData.sort(types, "name"));
}
//Labels
AppData.getLabel = async function(id) {
    return new AppDatabase().getLabel(id);
}
AppData.getLabels = async function() {
    return new AppDatabase().getLabels()
    .then(labels => AppData.sort(labels, "name"));
}
AppData.saveLabel = async function(label) {
    let lab = {
        name: label.name,
        color: label.color,
        isCategory: label.isCategory,
        isPaymentMethod: label.isPaymentMethod
    };
    if(label.id > 0)
        lab.id = label.id;
    return new AppDatabase().saveLabel(lab);
}
AppData.deleteLabel = async function(id) {
    return AppData.labelIsInUse(id)
    .then(inUse => {
        if(inUse)
            throw new AppDataError("Label is in use");
        else
            return AppData.getLabels();
    })
    .then(labels => {
        if(labels.length === 0)
            throw new AppDataError("You are required to have at least one label.");
        else
            return new AppDatabase().deleteLabel(id);
    });
}
AppData.labelIsInUse = async function(id) {
    return new AppDatabase().labelIsInUse(id);
}
//Transactions
AppData.fillTransaction = function(tran, labels, transactionTypes) {
    tran.paymentMethod = labels.find(x => x.id == tran.paymentMethodId);
    tran.categories = tran.categoryIds.map(x => labels.find(y => y.id == x));
    tran.type = transactionTypes.find(x => x.id == tran.typeId);
    tran.amount = tran.type.value*tran.amount;
    return tran;
}
AppData.getTransaction = async function(id) {
    return Promise.all([new AppDatabase().getTransaction(id), AppData.getLabels(), this.getTransactionTypes()])
    .then(res =>
        AppData.fillTransaction(res[0], res[1], res[2])
    );
}
AppData.getTransactions = async function(startDate, endDate) {
    if(!startDate)
    {
        let period = AppData.getPeriod();
        startDate = period.startDate;
        endDate = period.endDate;
    }
    //let period = month && year ? year + "/" + month : undefined;
    return Promise.all([new AppDatabase().getTransactions(startDate, endDate), AppData.getLabels(), this.getTransactionTypes()])
    .then(res => 
        AppData.sort(
            res[0].map(tran => AppData.fillTransaction(tran, res[1], res[2])),
            "date"
        )
    );
}
AppData.saveTransaction = async function(transaction) {
    let tran = {
        typeId: transaction.typeId,
        amount: Math.abs(transaction.amount),
        date: transaction.date,
        //period: Util.calculatePeriod(transaction.date),
        memo: transaction.memo,
        paymentMethodId: transaction.paymentMethodId,
        categoryIds: transaction.categoryIds
    };
    if(transaction.id > 0)
        tran.id = transaction.id;
    return Promise.all([new AppDatabase().saveTransaction(tran), AppData.getLabels(), this.getTransactionTypes()])
    .then(res =>
        AppData.fillTransaction(res[0], res[1], res[2])
    );
}
AppData.deleteTransaction = async function(id) {
    return new AppDatabase().deleteTransaction(id)
}