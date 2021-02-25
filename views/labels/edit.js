function cancelEdit(id) {
    let url = LabelsView.prototype.getRoute();
    // if(id > 0)
    //     url = "?id=" + id + url;
    App.getApp().navigateTo(url);
}


function confirmDeleteLabel(id) {
    let message = 'Are you sure you want to delete this label?';
    App.displayConfirmModal(message, function (){
        deleteLabel(id);
    });
}

function deleteLabel(id) {
    id = Number.parseInt(id);
    App.displayWaitingModal();
    AppData.deleteLabel(id)
    .then(res => {
        App.dismissModals();
        cancelEdit();
    })
    .catch(err => {
        App.displayErrorModal(err.toString());
        console.error(err);
    });
}

function validateLabel() {
    let model = App.getApp().getModel("Labels");
    let messages = [];
    if(!model.name)
        messages.push("Name is required");
    if(!model.color)
        messages.push("Color is required");
    // if(model.isCategory == null)
    //     return false;
    // if(model.isTag == null)
    //     return false;
    // if(model.isPaymentMethod == null)
    //     return false;

    return messages;
}

function saveLabel() {
    let validation = validateLabel();
    if(validation.length > 0)
    {
        App.displayErrorModal(validation.concat());
        return;
    };
    
    App.displayWaitingModal();

    let label = App.getApp().getModel("Labels");
    AppData.saveLabel(label)
    .then(result => {
        App.dismissModals();
        cancelEdit(result ? result.id : null);
    })
    .catch(err => {
        App.displayErrorModal(err.toString());
        console.error(err);
    });
}