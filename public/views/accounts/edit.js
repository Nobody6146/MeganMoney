function updateSelectors() {
    //Hack to make the selectors change on page load
    let data = App.getApp().getModel("Accounts");
    if(!data)
        return;
    data.paymentMethodId = data.paymentMethodId;
    data.typeId = data.typeId;
}

function addCategory(el) {
    let id = el.value;
    let data = App.getApp().getModel("Accounts")
    let label = data.categoryLabels.find(category => category.id == id);
    if(data.categories.findIndex(x => x.id == label.id) < 0)
        data.categories.push(label);
    el.value = "";
}

function removeCategory(id) {
    let data = App.getApp().getModel("Accounts");
    let index = data.categories.findIndex(x => x.id == id);
    data.categories.splice(index, 1);
}

function cancelEdit(id) {
    let url = TransactionsView.prototype.getRoute();
    // if(id > 0)
    //     url = url + "?id=" + id;
    App.getApp().navigateTo(url);
}

function validateTransaction() {
    let model = App.getApp().getModel("Accounts");
    let messages = [];
    if(!model.date)
        messages.push("Date is required");
    if(model.amount == null)
        messages.push("Amount is required");
    if(model.primaryCategoryId == 0)
        messages.push("Category is required");
    if(model.paymentMethodId == 0)
        messages.push("Payment method is required");
    if(model.typeId == 0)
        messages.push("Type is required");

    return messages;
}

function saveTransaction() {
    let validation = validateTransaction();
    if(validation.length > 0)
    {
        App.displayErrorModal(validation.concat());
        return;
    };
    
    App.displayWaitingModal();

    let model = App.getApp().getModel("Accounts");
    let tran = {
        id: model.id,
        amount: model.amount,
        date: Util.convertDateStringToDate(model.date),
        paymentMethodId: model.paymentMethodId,
        memo: model.memo,
        categoryIds: model.categories.map(x => x.id),
        typeId: model.typeId
    };

    AppData.saveTransaction(tran)
    .then(transaction => {
        App.dismissModals();
        cancelEdit(transaction.id);
    })
    .catch(err => {
        App.displayErrorModal(err.toString());
        console.error(err);
    });
}

function confirmDeleteTransaction(id) {
    let message = 'Are you sure you want to delete this transaction?';
    App.displayConfirmModal(message, function (){
        deleteTransaction(id);
    });
}

function deleteTransaction(id) {
    id = Number.parseInt(id);
    App.displayWaitingModal();

    let accountId = App.getApp().getModel("Accounts").accountId;
    AppData.deleteTransaction(id)
    .then(res => {
        App.dismissModals();
        cancelEdit();
    })
    .catch(err => {
        App.displayErrorModal(err.toString());
        console.error(err);
    });
}