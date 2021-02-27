function updateSelectors(event) {
    let app = App.getApp();
    let model = app.getModel("Settings");
    model.positive = model._.positive;
    model.good = model._.good;
}

function saveSettings() {
    App.displayWaitingModal();
    let model = App.getApp().getModel("Settings");
    
    model.transactionTypes.forEach(type => {
        type.value = type.id == model.positive ? 1 : -1;
        type.good = type.id == model.good ? true : false;
    });
    AppData.saveTransactionTypes(model.transactionTypes)
    .then(res => {
        App.displayDialogModal("Settings", "Changes saved!");
    })
    .catch(err => {
        App.displayErrorModal(err.toString());
        console.error(err);
    });
}

function confirmDataReset() {
    let message = 'Delete all of your data? This action cannont be undone.';
    App.displayConfirmModal(message, function (){
        resetData();
    });
}

function resetData() {
    App.displayWaitingModal();
    AppData.clearData()
    .then(res => {
        App.displayDialogModal("Settings", "Your data has been reset!", () => {
            App.getApp().navigateTo();
        });
    })
    .catch(err => {
        App.displayErrorModal(err.toString());
        console.error(err);
    });
}