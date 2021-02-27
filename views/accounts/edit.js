function updateSelectors() {
    //Hack to make the selectors change on page load
    let data = App.getApp().getModel("Accounts");
    if(!data)
        return;
    data.paymentMethodId = data.paymentMethodId;
    data.typeId = data.typeId;
}

// function addCategory(el) {
//     let id = el.value;
//     let data = App.getApp().getModel("Accounts")
//     let label = data.categoryLabels.find(category => category.id == id);
//     if(data.categories.findIndex(x => x.id == label.id) < 0)
//         data.categories.push(label);
//     el.value = "";
// }

function addCategory() {
    let data = App.getApp().getModel("Accounts");
    let name = data.categorySelect;
    if(name == "")
        return;
    let label = data.categoryLabels.find(category => category.name === name);
    if(label == undefined)
    {
        //Lets create a dummy label for now if we don't already have one
        label = Util.newLabel();
        label.name = name;
        label.isCategory = true;
    }
    if(data.categories.findIndex(x => x.name === label.name) < 0)
        data.categories.push(label);
    data.categorySelect = "";
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
        return "Date is required";
    if(model.amount == "")
        return "Amount is required";
    if(model.categories.length == 0)
        return "At least one category is required";
    if(model.paymentMethod.name == "")
        return "Payment method is required";
    if(model.typeId == 0)
        return "Type is required";
    return null;
}

function saveTransaction() {
    let validation = validateTransaction();
    if(validation)
    {
        App.displayErrorModal(validation.concat());
        return;
    };
    
    App.displayWaitingModal();

    let model = App.getApp().getModelData("Accounts");
    saveNewlyCreatedCategories(model.categories)
    .then(newCategories => {
        //Update our list of categories
        let categories = model.categories;
        newCategories.forEach(label => {
            let i = categories.findIndex(x => x.name === label.name);
            categories[i] = label;
        });

        //Assign our payment method
        let paymentMethod = model.paymentMethodLabels.find(x => x.name === model.paymentMethod.name);
        if(paymentMethod)
            model.paymentMethod = paymentMethod;
        else {
            paymentMethod = Util.newLabel();
            paymentMethod.name = model.paymentMethod.name;
            paymentMethod.isPaymentMethod = true;
            paymentMethod.isCategory = false;
            model.paymentMethod = paymentMethod;
        }

        //Save payment method if it's new
        return saveNewPaymentMethod(model.paymentMethod);
    })
    .then(paymentMethod => {
        model.paymentMethod = paymentMethod;
        let tran = {
            id: model.id,
            amount: model.amount,
            date: Util.convertDateStringToDate(model.date),
            paymentMethod: model.paymentMethod,
            memo: model.memo,
            categoryIds: model.categories.map(x => x.id),
            typeId: model.typeId
        };
        return AppData.saveTransaction(tran);
    })
    .then(transaction => {
        App.dismissModals();
        cancelEdit(transaction.id);
    })
    .catch(err => {
        App.displayErrorModal(err.toString());
        console.error(err);
    });
}

async function saveNewlyCreatedCategories(categories) {
    //Get list of new labels
    let newCats = categories.filter(x => x.id == undefined || x.id == 0);
    if(newCats.length == 0)
        return Promise.resolve([]);

    let saveCats = async function(resolve) {
        let labels = [];
        for(let i = 0; i < newCats.length; i++) {
            let label = await AppData.saveLabel(newCats[i]);
            labels.push(label);
        };
        resolve(labels);
    }

    return new Promise((resolve, reject) => {
        saveCats(resolve);
    });
}
function saveNewPaymentMethod(paymentMethod) {
    //Get list of new labels
    if(paymentMethod.id > 0)
        return Promise.resolve(paymentMethod);
    return AppData.saveLabel(paymentMethod);
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