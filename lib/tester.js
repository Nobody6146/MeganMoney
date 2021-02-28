function AssertError(message, fileName, lineNumber) {
    var instance = new Error("IndexDB - " + message, fileName, lineNumber);
    instance.name = 'AssertError';
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, AssertError);
    }
    return instance;
}
AssertError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
    }
});

function AppTestOption(test, parameters, publicMethods, staticMethods) {
    this.test = test;
    this.parameters = parameters ? parameters : [];
    this.publicMethods = publicMethods === false ? false : true;
    this.staticMethods = staticMethods === true ? true : false;
}

function AppTestCase(object, className, methodName, options) {
    this.object = object;// != undefined ? classType : window;
    this.className = className
    this.methodName = methodName;
    this.options = options;
}
AppTestCase.prototype.toString = function() {
    return this.className + "." + this.methodName;
}

function AppTestResult(testCase) {
    this.testCase = testCase;
    this.startTime = null;
    this.endTime = null;
    this.error = null;
    this.passed = false;
}
AppTestResult.prototype.getRunTime = function() {
    return this.endTime - this.startTime.getTime();
}
AppTestResult.prototype.getRunTimeDisplay = function() {
    let time = this.getRunTime();
    return Math.floor(time / 3600000) + ":" + Math.floor(time / 60000)%60 + ":" + Math.floor(time / 1000)%60 + ":" + (time % 1000)
}
AppTestResult.prototype.toString = function() {
    let text = this.testCase.toString() + ", Passed - " + this.passed;
    if(this.passed)
        return text + ", Run Time - " + this.getRunTimeDisplay();
    return text + ", "+ this.error.toString();
}

function AppTestResultsSummary(testResults) {
    this.testResults = testResults;
    this.totalTest = testResults.length;
    this.testPassed = testResults.filter(x => x.passed).length;
    this.testFailed = testResults.filter(x => !x.passed).length;
}
AppTestResultsSummary.prototype.getformatedResults = function() {
    let text = "Test cases: " + this.totalTest + (this.testPassed ? ", Passed" : ", Failed") + "\n";
    text += "Results cases:";
    this.testResults.forEach(x => text += "\n" + x.toString());
    return text;
} 

function AppTester() {
    return Promise(resolve => {setTimeout(500, resolve())});
}
AppTester.getClassName = function(classType) {
    let text = classType.toString();
    let index = text.indexOf("(");
    let start = "function ".length;
    return text.substr(start, index - start);
}
AppTester.test = async function(testCases) {
    let testResults = [];
    for(let i = 0; i < testCases.length; i++)
    {
        let testCase = testCases[i];
        let testResult = new AppTestResult(testCase);
        testResults.push(testResult);
        try {
            testResult.startTime = new Date();
            await testCase.object[testCase.methodName].apply(this, testCase.parameters);
            testResult.endTime = new Date();
            testResult.passed = true;
        }
        catch (error) {
            testResult.endTime = new Date();
            testResult.passed = false;
            testResult.error = error;
        }
    }
    return new AppTestResultsSummary(testResults);
}

AppTester.testClass = async function(testOptions) {
    let testCases = [];
    for(let i = 0; i < testOptions.length; i++) {
        let options = testOptions[i];
        let classType = options.test;
        let className = AppTester.getClassName(classType);
        if(options.publicMethods)
            Object.keys(classType.prototype).forEach(method => {
                if(!(classType.prototype[method] instanceof Function))
                    return;
                if(method.match(/^[Tt]est/))
                    testCases.push(new AppTestCase(new classType(), className, method, options));
            })
        if(options.staticMethods)
            Object.keys(classType).forEach(method => {
                if(!(classType[method] instanceof Function))
                    return;
                if(method.match(/^[Tt]est/))
                    testCases.push(new AppTestCase(classType, className, method, options));
            })
    }
    return AppTester.test(testCases);
}