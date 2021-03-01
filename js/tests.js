function TestCases() {

}
TestCases.prototype.AssertFalse = async function() {
    Assert.false();
}
TestCases.prototype.AssertBasicTest = async function() {
    Assert.expression(2 + 2 === 4);
    Assert.hasValue(2);
    Assert.hasNoValue(null);
    Assert.isTypeOf(1, "number");
    Assert.throwsError(() => {throw new Error()});
}
TestCases.prototype.AssertObjectTest = async function() {
    let subject = {id: 1, list: [1,2,3], pie: null};
    let test = {id: 1, list: [1,2,3]};
    
    Assert.hasProperties(subject, test);
    Assert.propertiesEqual(subject, test);
    Assert.hasStructure(subject, test);
    Assert.equals(subject, test);
}