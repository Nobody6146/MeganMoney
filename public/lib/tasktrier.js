function TaskTrierOptions(errors) {
	this.errors = Array.isArray(errors) ? [].concat(errors) : [Error];
}

function TaskTrierRetryEvent(error, attempts, maxAttempts, waitTime) {
	this.error = error;
	this.attempts = attempts;
	this.maxAttempts = maxAttempts;
	this.waitTime = waitTime;
}

function TaskTrier(options, retryCallback) {
	this.options = options 
		? new TaskTrierOptions(options.errors)
		:new TaskTrierOptions();
	this.retryCallback = retryCallback;
}

TaskTrier.prototype.try = async function(maxAttempts, waitTime, callback) {
	
	let options = this.options;
	let retryCallback = this.retryCallback;
	
	return new Promise( async function(resolve, reject){
		let attempts = 1;
		let retry = async function() {
			try {
				let response = callback();
				if(response instanceof Promise)
					response = await response;
				resolve(response);
				return false;
			}
			catch (err){
				let handle = false;
				options.errors.forEach(x => {
					if(err instanceof x)
						handle = true;
				});
				//If we don't handle the error or reach retry limit, throw error
				if(!handle || attempts == maxAttempts) {
					reject(err);
					return false;
				}
				
				//Start a retry and wait for our interval
				let event = new TaskTrierRetryEvent(err, attempts, maxAttempts, waitTime);
				await new Promise(resolve => setTimeout(resolve, event.waitTime));
				if(retryCallback)
				{
					var callbackRes = retryCallback(event);
					if(callbackRes instanceof Promise)
						await callbackRes;
				}
				attempts++;
				return true;
			}
		}
		
		while(await retry());
	});
}