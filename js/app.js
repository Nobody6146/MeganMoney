function App() {

}

App.prototype.models = {
    appData: "app"
}

App.getApp = function() {
    return app;
}

App.loadPages = function() {
    let app = App.getApp();
    //Create views
    let dashboardView = new DashboardView();
    let settingsView = new SettingsView();
    let labelsView = new LabelsView();
    let labelsEditView = new LabelsEditView();
    let transactionsView = new TransactionsView();
    let transactionsEditView = new TransactionsEditView();
    let transactionsSummaryView = new TransactionsSummaryView();
    let budgetsView = new BudgetsView();
    let budgetsEditView = new BudgetsEditView();
    let budgetsSummaryView = new BudgetsSummaryView();

    //Bind routes
    app.addRoute(dashboardView.getRoute(), dashboardView.render.bind(dashboardView));
    app.addRoute(settingsView.getRoute(), settingsView.render.bind(settingsView));
    app.addRoute(labelsView.getRoute(), labelsView.render.bind(labelsView));
    app.addRoute(labelsEditView.getRoute(), labelsEditView.render.bind(labelsEditView));
    app.addRoute(transactionsView.getRoute(), transactionsView.render.bind(transactionsView));
    app.addRoute(transactionsEditView.getRoute(), transactionsEditView.render.bind(transactionsEditView));
    app.addRoute(transactionsSummaryView.getRoute(), transactionsSummaryView.render.bind(transactionsSummaryView));
    app.addRoute(budgetsView.getRoute(), budgetsView.render.bind(budgetsView));
    app.addRoute(budgetsEditView.getRoute(), budgetsEditView.render.bind(budgetsEditView));
    app.addRoute(budgetsSummaryView.getRoute(), budgetsSummaryView.render.bind(budgetsSummaryView));
    app.addRoute(".*", (req, res, next) => {
        console.error("page not found");
        res.app.navigateTo(dashboardView.getRoute());
    });
}
App.setup = function() {
    let app = App.getApp();
    //Setup Navigation bar
    let appInfo = {
        navigation: {
            home: DashboardView.prototype.getRoute(),
            dashboard: DashboardView.prototype.getRoute(),
            settings: SettingsView.prototype.getRoute(),
            labels: LabelsView.prototype.getRoute(),
            accounts: TransactionsView.prototype.getRoute(),
            budgets: BudgetsView.prototype.getRoute()
        },
    };
    app.bindModel(App.prototype.models.appData, appInfo);
}
App.configureServiceWorker = function() {
    if ('serviceWorker' in navigator) {
        alert("Wait while your application is being set up")
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
            // Registration was successful
            alert("Your application has finished installing");
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function(err) {
            // registration failed :(
                alert("Your application has failed to install");
            console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
}
App.start = function() {
    App.dismissModals();
    let app = App.getApp();
    //app.navigateTo();

    //Set the date picker, this should auto kickoff the navigate process
    let period = Util.calculateMonthlyPeriod(new Date());
    App.selectPeriod(period.startDate, period.endDate);
}

//==== Usablility
App.selectPeriod = function(startDate, endDate) {
    let app = App.getApp();

    let period = AppData.setPeriod(startDate, endDate);
    //Updates the model need for the date picker, and the date picker 
    period.datePicker = Util.getPeriodPickerFormat(period);
    app.getModel(App.prototype.models.appData).period = period;

    //Once we've updated our date range, reload the app page view
    app.navigateTo();
}
//Modals
App.displayWaitingModal = function() {
    App.displayModal("waitingModal", true);
}
App.displayErrorModal = function(message) {
    let modal = App.displayModal("errorModal", true);
    let messageBox = modal.querySelector("p");
    if(message)
        messageBox.innerText = message;
    else
        messageBox.innerText = "An unknown error has occured";
}
App.displayDialogModal = function(title, message, callback) {
    let modal = App.displayModal("dialogModal", true);
    modal.querySelector("h3").innerText = title;
    modal.querySelector("p").innerText = message;
    let confirm = modal.querySelector("#dialogModal-confirm");
    if(callback)
        confirm.onclick = callback;
    else
        confirm.onclick = App.dismissModals;
}
App.displayConfirmModal = function(message, callback) {
    let modal = App.displayModal("confirmModal", true);
    let messageBox = modal.querySelector("p");
    if(message)
        messageBox.innerText = message;
    else
        messageBox.innerText = "Are you sure you want to continue?";
    let confirm = modal.querySelector("#confirmModal-confirm");
    if(callback)
        confirm.onclick = callback;
    else
        confirm.onclick = App.dismissModals;
}
App.dismissModals = function() {
    document.querySelectorAll(".popup").forEach(modal => {
        modal.classList.add("popup-hidden");
        //modal.hidden = true;
    });//);
}
App.displayModal = function(id, toggle) {
    App.dismissModals();
    let modal = document.querySelector("#" + id);
    if(!modal || !toggle)
        return modal;
    //modal.hidden = false;
    modal.classList.remove("popup-hidden");
    return modal;
}