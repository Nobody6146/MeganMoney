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