function AppStorage() {
    
}

AppStorage.prototype.properties = {
    period: "period",
    settings: "settings"
}

AppStorage.prototype.clearData = function() {
    window.localStorage.clear();
    return true;
}

//Finacial Period
AppStorage.prototype.getPeriod = function() {
    let period = window.localStorage.getItem(AppStorage.prototype.properties.period);
    if(period) {
        period = JSON.parse(period);
        period.startDate = new Date(period.startDate);
        period.endDate = new Date(period.endDate);
        return period;
    }
    let range = Util.calculateMonthlyPeriod();
    period = this.setPeriod(range.startDate, range.endDate);
    return period;
}
AppStorage.prototype.setPeriod = function(startDate, endDate) {
    let period = {
        startDate,
        endDate
    };
    window.localStorage.setItem(AppStorage.prototype.properties.period, JSON.stringify(period));
    return period;
}