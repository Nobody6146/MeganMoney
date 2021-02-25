function displayBudget(id) {
    GetApp().navigateTo(BudgetsSummaryView.prototype.getRoute(id));
}

function editBudget(id) {
    GetApp().navigateTo(BudgetsEditView.prototype.getRoute(id));
}