function Util() {

}

Util.calculatePeriod = function(date) {
    return date ? date.toISOString().substr(0,7): undefined;
}

Util.calculateMonthlyPeriod = function(date) {
    if(!date)
        date = new Date();

    startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    endDate = new Date(date.getFullYear(), date.getMonth()+1, 0);  
    return {
        startDate,
        endDate
    };
}

Util.getPeriodPickerFormat = function(period) {
    return period.startDate.toISOString().substr(0,7);
}

Util.convertDateStringToDate = function(timeString) {
    return new Date(new Date(timeString).getTime() + new Date().getTimezoneOffset()*60000)
}

//Default operations
Util.newLabel = function() {
    return  {
        name: "",
        color: "#FF0000",
        isPaymentMethod: false,
        isCategory: true,
    }
}
Util.newTransaction = function() {
    let period = AppData.getPeriod();
    return {
        id: 0,
        amount: 0,
        date: new Date() > period.endDate ? period.startDate : new Date(),
        paymentMethodId: "",
        memo: "",
        categories: [],
        typeId: 1
    };
}

Util.isGoodBalance = function(balance, goodTransactionType) {
    if(goodTransactionType.value < 0)
        return balance < 0;
    return balance >= 0;
}