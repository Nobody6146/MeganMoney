function populateBudgets(event) {
    let plan = event.model;
    plan.index = 0;
    
    plan.budgetIds = [];
    let budgets = plan.budgets.forEach(x => addBudget(x));
}

function addBudget(budget) {
    if(!budget)
        budget = {
            typeId: "",
            labelId: "",
            limitId: "",
            limitAmount: null
        };
    else {
        budget.labels = findLabelGroup(budget.typeId).map(x => {
            let y = JSON.parse(JSON.stringify(x));
            y.selected = y.id == budget.labelId;
            return y;
        });
    }
    let plan = GetApp().getModel("Plan");
    let id = "budget" + plan.index++;
    budget.budgetTypes = plan.budgetTypes.map(x => {
        let y = JSON.parse(JSON.stringify(x));
        y.selected = y.id == budget.typeId;
        return y;
    });
    budget.limitTypes = plan.limitTypes.map(x => {
        let y = JSON.parse(JSON.stringify(x));
        y.selected = y.id == budget.limitId;
        return y;
    });



    GetApp().bindModel(budget, id);
    plan.budgetIds.push(id);
    plan.budgetIds = plan.budgetIds;
}

function removeBudget(id) {
    let plan = GetApp().getModel("Plan");
    GetApp().unbindModel(GetApp().getModel(id));
    plan.budgetIds.splice(plan.budgetIds.indexOf(id), 1);
    plan.budgetIds = plan.budgetIds;
}

function findLabelGroup(id) {
    return GetApp().getModel("Plan").labels[id - 1].map(x => x);
}

function changeBudgetType(el) {
    let modelName = el.getAttribute(SootheApp.prototype.modelBindAttr);
    let model = GetApp().getModel(modelName);
    model.labels = findLabelGroup(el.value).map(x => {
        let y = JSON.parse(JSON.stringify(x));
        y.selected = y.id == model.labelId;
        return y;
    });
}

function cancelEdit() {
    let planId = GetApp().getModel("Plan").id;
    GetApp().navigateTo(BudgetsSummaryView.prototype.getRoute(planId === 0 ? null : planId));
}

function refreshSelectorValue(event) {
    let model = event.l
    Object.keys(event.model).forEach(x => {
        model[x] = model[x];
    })
}

function refreshSelectorValues(event) {
    GetApp().getModel("Plan").budgetIds.forEach(x => GetApp().refreshDomModel(GetApp().getModel(x)));
}

function validatePlan() {
    let plan = GetApp().getModel("Plan");
    let budgets = GetApp().getModel("Budgets");
    
    let messages = [];
    if(!plan.name)
        messages.push("Name is required");
    Object.values(budgets).forEach(budget => {
        if(!budget.typeId)
        messages.push("Budget Type is required");
        if(!budget.labelId)
        messages.push("Label is required");
        if(!budget.limitId)
            messages.push("Limit type is required");
        if(budget.limitId && !budget.limitAmount)
            messages.push("Limit amount is required");
    });

    return messages;
}

function savePlan() {
    let validation = validatePlan();
    if(validation.length > 0)
    {
        DisplayErrorModal(validation.concat());
        return;
    };
    
    DisplayWaitingModal();

    let plan = dom.getModel("Plan");
    let budgets = plan.budgetIds.map(x => GetApp().getModel(x))
    let req = {
        planId: plan.id,
        planName: plan.name,
        typeIds: budgets.map(x => x.typeId).reduce((x,y) => {return x + "," + y}, "").replace(/^,/, ""),
        labelIds: budgets.map(x => x.labelId).reduce((x,y) => {return x + "," + y}, "").replace(/^,/, ""),
        limitIds: budgets.map(x => x.limitId).reduce((x,y) => {return x + "," + y}, "").replace(/^,/, ""),
        limitAmounts: budgets.map(x => x.limitAmount ? x.limitAmount : 0).reduce((x,y) => {return x+ "," + y}, "").replace(/^,/, "")
    }
    fetch("/api/users/" + GetUserId() + "/budgetPlans", 
        {
            method: "post",
            body: JSON.stringify(req),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
    .then(res => {
        if(!res.ok)
            throw new Error(res.statusText);
        return res.json();
    })
    .then(res => {
        DismissModals();
        if(!res.success)
            throw new Error(res.errorMessage);

        GetApp().getModel("Data").budgets = res.data;
        let planId = plan.id === 0 ? res.data[res.data.length - 1].id : plan.id; 
        GetApp().navigateTo("/budgets/" + planId);
    })
    .catch(err => {
        DisplayErrorModal(err.toString());
        console.error(err);
    });
}


function confirmDeleteBudgetPlan(id) {
    let message = 'Are you sure you want to delete this plan?"';
    DisplayConfirmModal(message, function (){
        deleteBudgetPlan(id);
    });
}

function deleteBudgetPlan(id) {
    DisplayWaitingModal();

    fetch("/api/users/" + GetUserId() + "/budgetPlans", {
        method: "delete",
        body: JSON.stringify({planId: id}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if(!res.ok)
            throw new Error(res.statusText);
        return res.json();
    })
    .then(res => {
        DismissModals();
        if(!res.success)
            throw new Error(res.errorMessage);
        GetApp().getModel("Data").budgets = res.data;
        cancelEdit();
    })
    .catch(err => {
        DisplayErrorModal(err.toString());
        console.error(err);
    });
}