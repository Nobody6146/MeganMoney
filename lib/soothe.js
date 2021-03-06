//========== HTML Attribute Bindings ================//
SootheApp.prototype.modelBindAttr = "soothe-model";
SootheApp.prototype.propBindAttr = "soothe-prop";
SootheApp.prototype.attrBindAttr = "soothe-attr";
SootheApp.prototype.inputBindAttr = "soothe-input";
SootheApp.prototype.tmpltBindAttr = "soothe-tmplt";
SootheApp.prototype.compBindAttr = "soothe-comp";
SootheApp.prototype.funcBindAttr = "soothe-func";
SootheApp.prototype.evtBindAttr = "soothe-evt";
SootheApp.prototype.staticBindAttr = "soothe-static";
SootheApp.prototype.routeBindAttr = "soothe-route";
SootheApp.prototype.expressionBindAttr = "soothe-exp";
SootheApp.prototype.toggleBindAttr = "soothe-tgl";
SootheApp.prototype.deleteBindAttr = "soothe-del";
SootheApp.prototype.repeatBindAttr = "soothe-rpt";
SootheApp.prototype.conditionBindAttr = "soothe-cond";
SootheApp.prototype.definitiveBindAttr = "soothe-def"; //Only allow definitive prop binding "won't respond to generic wildcard events" def="model|prop|true|false", defaults to true
SootheApp.prototype.submitBindAttr = "soothe-submit"; //Prevents default bevaior of events
SootheApp.prototype.enterBindAttr = "soothe-enter"; //Fires a callback when the enter key is pressed on field

SootheApp.prototype.wildcardChar = "*";
SootheApp.prototype.insertionChar = "_";

SootheApp.prototype.arrayModifier = "arr";
SootheApp.prototype.dictionaryModifier = "dict";
SootheApp.prototype.appendModifier = "append";
SootheApp.prototype.eventModifier = "evt";

SootheApp.prototype.attributes = [
    SootheApp.prototype.modelBindAttr,
    SootheApp.prototype.propBindAttr,
    SootheApp.prototype.attrBindAttr,
    SootheApp.prototype.inputBindAttr,
    SootheApp.prototype.tmpltBindAttr,
    SootheApp.prototype.compBindAttr,
    SootheApp.prototype.funcBindAttr,
    SootheApp.prototype.staticBindAttr,
    //SootheApp.prototype.routeBindAttr
    SootheApp.prototype.expressionBindAttr,
    SootheApp.prototype.toggleBindAttr,
    SootheApp.prototype.deleteBindAttr,
    SootheApp.prototype.repeatBindAttr,
    SootheApp.prototype.conditionBindAttr,
];

//Controls the model prop that can be used on a proxy use
SootheApp.prototype.rawModelDataProp = "_"

function SootheApp(options) {
    this.routes = [];
    this.prevLocation = {
        pathname: null,
        hash: null,
        search: null
    };
    this.options = {
        dom: {
            root: "body"
        },
        routing: {
            hashRouting: false,
            exactMatch: true
        }
    };
    if(options && options.dom)
    {
        if(options.dom.root)
            this.options.dom.root = options.dom.root.toString();
    }
    if(options && options.routing)
    {
        if(options.routing.hashRouting === true)
            this.options.routing.hashRouting = true;
        if(options.routing.exactMatch === false)
            this.options.routing.exactMatch = false;
    }

    this.root = document.querySelector(this.options.dom.root);
    this.boundModels = {};

    this.routeListener = function(event) {
        let target = event.target;
        while(target) {
            if(target.attributes[SootheApp.prototype.routeBindAttr])
            {
                event.preventDefault();
                let modelAttr = target.attributes[SootheApp.prototype.modelBindAttr];
                let model = modelAttr ? this.getModelData(modelAttr.value) : null;
                if(model)
                    model = JSON.parse(JSON.stringify(model));
                let route;
                let elType = target.nodeName.toLowerCase();
                if(elType === "a")
                    route = target.href;
                else if(elType === form)
                    route = target.action;
                this.navigateTo(route, model);
                return;
            }
            else
                target = target.parentElement;
        }
    }
    this.submitListener = function(event) {
        let target = event.target;
        while(target) {
            if(target.attributes[SootheApp.prototype.submitBindAttr])
            {
                console.log("let's do this");
                let func = target.attributes[SootheApp.prototype.submitBindAttr].value;
                event.preventDefault();
                window[func](event);
                console.log("we should be done: " + func.toString());
                return;
            }
            else
                target = target.parentElement;
        }
    }
    this.keyUpListener = function(event) {
        let target = event.target;
        while(target) {
            if(target.attributes[SootheApp.prototype.enterBindAttr] && event.keyCode === 13)
            {
                let func = target.attributes[SootheApp.prototype.enterBindAttr].value;
                event.preventDefault();
                window[func](event);
                return;
            }
            else
                target = target.parentElement;
        }
    }
    this.historyListener = function(event) {
        this.route(event.state);
    }
    this.route = function(model) {

        //Supress hash changes causing routing unless user opts in for it
        if(!this.options.routing.hashRouting && 
            (this.prevLocation.pathname === location.pathname &&
                this.prevLocation.search === location.search &&
                this.prevLocation.hash !== location.hash))
            //If we are not using hash based routing and we only had a hash change, then don't trigger routing
            return;

        this.prevLocation.pathname = location.pathname;
        this.prevLocation.search = location.search;
        this.prevLocation.hash = location.hash;

        let path = !this.options.routing.hashRouting ? location.pathname : location.hash;

        let matches = this.routes.map(x => {
            return {
                route: x.path,
                path: path,
                callback: x.callback,
                result: path.match(this.pathToRegex(x.path))
            }
        }).filter(x => x.result != null);
        if(!matches || matches.length == 0)
            return;

        let query = null;
        if(location.search)
        {
            query = {};
            let vars = location.search.substring(1, location.search.length).split("&").forEach(x => {
                let parts = x.split("=");
                query[parts[0]] = parts[1];
            });
        }
        // let req = new SootheAppequest(match.path, match.route, this.getParams(match), model);
        // let res = new SootheAppesponse(this);
        let res = new SootheRouteResponse(this);

        let actions = matches.map(match => {
            return {
                callback: match.callback,
                req: new SootheRouteRequest(match.path, match.route, query, this.getParams(match), model),
                res: res,
                next: function() {}
            }
        });
        for(let i = 0; i < actions.length -1; i++)
        {
            let next = actions[i + 1];
            actions[i].next = function() {
                return next.callback(next.req, next.res, next.next);
            }
            //actions[i].next.bind(this);
        }

        let action = actions[0];
        let response = action.callback(action.req, action.res, action.next)
        if(response instanceof Promise)
            response.then().catch(err => console.error(err));
    }
    this.pathToRegex = function(path) {
        if(!path)
            return new RegExp(".*");

        let regex = path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)");
        return this.options.routing.exactMatch ? RegExp("^" + regex + "$") : RegExp(regex);
    }
    this.getParams = function(match) {
        let params = {};
        let keys = match.route.match(/:(\w+)/g);
        if(keys)
            for(let i = 0; i < keys.length; i++)
                params[keys[i].substr(1)] = match.result[i + 1];
        return params;
    };

    this.makeProxy = function(data, name, app, replace) {
        let models = {};
        let proxy;

        let bindOrGet = function(obj, prop, replace) {
            if(obj[prop] instanceof Date || !(obj[prop] instanceof Object))
                return null;
            let modelName = name + "." + prop;

            let model = models[prop];
            if(!replace && model)
                return model;
            else {
                //Make proxy
                models[prop] = app.makeProxy(obj[prop], modelName, app, replace);
                //Trigger bind event (we know this is a bind, because setting value triggers first event)
                
                //app.triggerEvent(app.getRootElement(), event);
                return models[prop];
            }
        }

        proxy = new Proxy(data, {
            get(obj, prop) {
                if(prop === SootheApp.prototype.rawModelDataProp)
                    return obj;
                //Make sure functions apply to work on original prop by binding
                // if (typeof obj[prop] === 'function') {
                //     return obj[prop].bind(obj);
                // }
                
                //var type = 
                if (typeof obj[prop] === 'object' && obj[prop] != null)
                {
                    let model = bindOrGet(obj, prop, false);
                    //let model = null;
                    return model ? model : obj[prop];
                }
                else
                    return obj[prop];
            },
            set: function(obj, prop, value) {
                let oldValue = obj[prop];
                //Don't allow DOM update to trigger if value is up-to-date or this model is no longer bound
                if(app.getModel(name) !== proxy) {
                    obj[prop] = value;
                    return true;
                }
                // console.log("setting: " + prop + ", :" + JSON.stringify(value));
                //Delete old values for prop so we get unbind events
                let model = bindOrGet(obj, prop, false);
                // if(oldValue instanceof Object)
                //     Object.keys(oldValue).forEach(x => delete model[x]);
                obj[prop] = value[SootheApp.prototype.rawModelDataProp] ? value[SootheApp.prototype.rawModelDataProp] : value;
                bindOrGet(obj, prop, true);
                // if(model) {
                //     console.log("Refresh model: " + name + "." + prop + ", " + JSON.stringify(value));
                //     app.refreshModel(model, name + "." + prop);
                // }
                let event = new SootheDomEvent(proxy, name, prop, oldValue, oldValue === undefined ? "bind" : "set", app.getRootElement(), undefined);
                //Make sure the properties exist so we can bind to dom and find them
                app.triggerEvent(app.getRootElement(), event);
                // console.log("obj: " + JSON.stringify(obj));
                return true;
            },
            deleteProperty: function(obj, prop) {
                // console.log("deleting: " + prop);
                if (prop in obj) {
                    let property = JSON.parse(JSON.stringify(obj[prop]));
                    let model = models[prop];
                    if(property instanceof Object)
                        Object.keys(property).forEach(x => { if(model) delete model[x]});
                    delete obj[prop];
                    delete models[prop];
                    obj[prop] = property;
                    let event = new SootheDomEvent(proxy, name, prop, property, "unbind", app.getRootElement(), undefined);
                    app.triggerEvent(app.getRootElement(), event);
                    if(!(property instanceof Object)) {
                        //This won't trigger automatically for sol values because there is no proxy to call generic event
                        event = new SootheDomEvent(proxy, name + "." + prop, "*", property, "unbind", app.getRootElement(), undefined);
                        app.triggerEvent(app.getRootElement(), event);
                    }
                  }
                //   console.log("obj: " + JSON.stringify(obj));
                  return true;
            }
        });

        
        //Now lets trigger nested proxies for all the properties
        this.refreshModel(proxy, name);
        if(!replace) {
            //Trigger a new event that the new data is being bound
            let event = new SootheDomEvent(proxy, name, "*", null, "bind", app.getRootElement(), undefined);
            app.triggerEvent(app.getRootElement(), event);
        }
        return proxy;
    }

    this.refreshModel = function(proxy, name) {
        if(proxy instanceof Object)
            Object.keys(proxy).forEach(prop => {
                //Do a get to force the proxy to be created
                proxy[prop];
                    let event = new SootheDomEvent(proxy, name, prop, null, "bind", app.getRootElement(), undefined);
                    app.triggerEvent(app.getRootElement(), event);
            });
    }

    /****************
        ****Callbacks****
        ****************/
    this.mutationCallback = function(mutations, observer) {
        let bindUpdates = [];
        mutations.forEach( m => {
            if(m.type === 'childList')
                m.addedNodes.forEach(n => this.bindNodeRecursive(n));
            if(m.type === 'attributes') 
                this.bindNodeRecursive(m.target);
        });
    }
    this.inputListener = function(event) {
        let attr = event.target.attributes[SootheApp.prototype.modelBindAttr];
        let input = event.target.attributes[SootheApp.prototype.inputBindAttr];
        if(attr != null && input != null) {
            let model = this.getModel(attr.value);
            if(model) {
                let args = input.value.split(" ");
                model[args[0]] = event.target[args[1]];
            }
        }
    }

    //============= Dom Manipulation ==============//
    /*
    Handling DOM updates
    */
    this.buildQuerySelectors = function(modelName) {
        if(!modelName)
            modelName = "";
        // if(pseudo)
        //     return ["[" + SootheApp.prototype.modelBindAttr + "='.']"];
        let selectors = ["[" + SootheApp.prototype.modelBindAttr + "='" + modelName + "']", "[" + SootheApp.prototype.modelBindAttr + "='*']"];
        return selectors;
    }
    this.triggerEvent = function(parent, event) {
        //The parent is the element to start affecting at
        //It's time to update the DOM
        let selectors = this.buildQuerySelectors(event.modelName);
        selectors.forEach(s => {
            let children = parent.querySelectorAll(s);
            this.updateDomForChild(parent, event);
            children.forEach(x => this.updateDomForChild(x, event));
        });
    }
    this.bindNodeRecursive = function(node, once) {
        if(node instanceof Element || node instanceof HTMLDocument) {
            let attr = node.attributes[SootheApp.prototype.modelBindAttr];
            if(attr != null)
            {
                let model = this.getModel(attr.value);
                
                if(model instanceof Object) {
                    Object.keys(model).forEach(prop => {
                        let event = new SootheDomEvent(model, attr.value, prop, null, "bind", node, undefined);
                        this.updateDomForChild(node, event);
                    });
                } 
                else if(model) {
                    let seperator = attr.value.lastIndexOf(".");
                    if(seperator >= 0)
                    {
                        let propValue = model;
                        model = app.getModel(attr.value.substr(0, seperator));
                        if(model) {
                            let prop = attr.value.substr(attr.value.lastIndexOf("."), attr.value.length - seperator);
                            let event = new SootheDomEvent(model, attr.value, "*", null, "bind", node, propValue);
                            this.updateDomForChild(node, event);
                        }
                    }
                }
                else if(attr.value === '*') {
                    let event = new SootheDomEvent(null, SootheApp.prototype.wildcardChar, SootheApp.prototype.wildcardChar, null, "bind", node, undefined);
                        this.updateDomForChild(node, event);
                }
            }
            if(!once)
                node.childNodes.forEach(n => this.bindNodeRecursive(n));
        }
    }
    this.updateDomForChild = function(target, event) {
        let triggered = false;
        let attrs = this.loadSpaAttrs(target);
        // if(event.type === "pseudo" && pseudoAttr && )
        // let propValue = event.propName ? event.model[event.propName] : event.model;
        //These event types mean a DOM update is required
        //console.log(event);
        if(attrs.static && attrs.static.value == "true")
        {
            return;
        }
        if(attrs.cond)
        {
            let values = this.splitAttributeValue(attrs.cond.value);
            let propValue = event.value !== undefined ? event.value : event.model;
            if((values[0] === SootheApp.prototype.wildcardChar || event.propName) && !propValue)
                return;
        }
        if(!this.passesDefinitiveCheck(attrs, event))
            return;
        if(!attrs.evt || attrs.evt.value.split(' ').find(x => x === event.type) !== undefined)
        {
            if(attrs.attr)
            {
                let values = this.splitAttributeValue(attrs.attr.value).filter(x => x[0] === event.propName || x[0] === '*');
                values.forEach(attr => {
                    let propValue = attr[2] ? this.resolveInsertionValue(attr[2], event) : event.value !== undefined ? event.value : event.model;
                    if(target.attributes[attr[1]] !== propValue)
                        target.setAttribute(attr[1], propValue);
                    triggered = true;
                });
            }
            if(attrs.tgl)
            {
                let values = this.splitAttributeValue(attrs.tgl.value).filter(x => x[0] === event.propName || x[0] === '*');
                values.forEach(attr => {
                    let propValue = attr[2] ? this.resolveInsertionValue(attr[2], event) : event.value !== undefined ? event.value : event.model;
                    if(target.attributes[attr[1]] !== propValue) {
                        target.toggleAttribute(attr[1], propValue);
                    }
                    triggered = true;
                });
            }
            if(attrs.prop)
            {
                attrs.prop
                let props = this.splitAttributeValue(attrs.prop.value).filter(x => x[0] === event.propName || x[0] === '*');
                props.forEach(prop => {
                    let propValue = prop[2] ? this.resolveInsertionValue(prop[2], event) : event.value !== undefined ? event.value : event.model;
                    if(target[prop[1]] !== propValue) {
                        
                        target[prop[1]] = propValue;
                    }
                    triggered = true;
                });
            }
            if(attrs.comp) {
                let args = this.splitAttributeValue(attrs.comp.value)[0];
                let indexes = [""];
                if(args[0] === event.propName || args[0] === '*') {
                    let propValue = event.value !== undefined ? event.value : event.model;
                    let gen = false;
                    let modifier = args.length >= 3 ? args[2] : null;
                    if(Array.isArray(propValue) && (!modifier || modifier === SootheApp.prototype.arrayModifier)) {
                        let i = 0;
                        indexes = propValue.map(x => i++);
                        gen = true;
                    }
                    else if(modifier === SootheApp.prototype.dictionaryModifier && propValue instanceof Object) {
                        indexes = Object.keys(propValue);
                        propValue = Object.values(propValue);
                        gen = true;
                    }
                    else if(propValue instanceof Object) {
                        propValue = [event.model];
                        gen = true;
                    } else {
                        propValue = [propValue];
                        gen = true;
                    }

                    if(!propValue || propValue.length == 0)
                        gen = false;
                    if(gen) {

                        let repeat = attrs.rpt && modifier === SootheApp.prototype.appendModifier ? parseInt(attrs.rpt.value) : 1;
                        if(isNaN(repeat))
                            repeat = event.model[attrs.rpt.value];
                        for(let i = 0; i < repeat; i++) {
                            indexes = indexes.map(x => event.modelName + "." + event.propName + (x !== "" ? "." + x : ""));
                            this.buildDomTemplate(target, args[1], propValue, event, attrs, indexes, modifier === SootheApp.prototype.appendModifier);
                            triggered = true;
                        }
                    }
                }
            }
            if(attrs.func)  {
                
                let args = this.splitAttributeValue(attrs.func.value);

                let repeat = attrs.rpt ? parseInt(attrs.rpt.value) : 1;
                if(isNaN(repeat))
                            repeat = event.model[attrs.rpt.value];
                for(let i = 0; i < repeat; i++) {
                    args.forEach(func => {
                        if(func[0] === event.propName || func[0] === '*')
                        {
                            try {
                                window[func[1]](event);
                            } catch (error) {
                                console.error(error);
                            }
                        }
                        triggered = true;
                    });
                }
            }
            if(attrs.del)  {
                let values = this.splitAttributeValue(attrs.del.value);
                let propValue = event.value != undefined ? event.value : event.model;
                let props = values[0];
                let del = false;
                if(props[1] === SootheApp.prototype.eventModifier)
                    del = true;
                else if((prop[0] === SootheApp.prototype.wildcardChar || prop === event.propName) && propValue == true) 
                    del = true;
                if(del){
                    target.parentNode.removeChild(target);
                    triggered = true;
                }
            }
        }

        if(triggered && attrs.static) 
            attrs.static.value = "true";
        //Remove pseudo element so it will never overwrite again
        // if(attrs.pseudo)
        //     target.removeAttribute(SootheApp.prototype.pseudoBindAttr)
    }
    this.loadSpaAttrs = function(target) {
        return {
            prop: target.attributes[SootheApp.prototype.propBindAttr],
            attr: target.attributes[SootheApp.prototype.attrBindAttr],
            input: target.attributes[SootheApp.prototype.inputBindAttr],
            tmplt: target.attributes[SootheApp.prototype.tmpltBindAttr],
            comp: target.attributes[SootheApp.prototype.compBindAttr],
            pseudo: target.attributes[SootheApp.prototype.pseudoBindAttr],
            func: target.attributes[SootheApp.prototype.funcBindAttr],
            evt: target.attributes[SootheApp.prototype.evtBindAttr],
            static: target.attributes[SootheApp.prototype.staticBindAttr],
            tgl: target.attributes[SootheApp.prototype.toggleBindAttr],
            del: target.attributes[SootheApp.prototype.deleteBindAttr],
            rpt: target.attributes[SootheApp.prototype.repeatBindAttr],
            cond: target.attributes[SootheApp.prototype.conditionBindAttr],
            def: target.attributes[SootheApp.prototype.definitiveBindAttr],
        }
    }
    this.splitAttributeValue = function(value) {
        return value.split(';').map(x => { 
            //return x.trim().split(/\s+/)
            let baseParams = x.trim();
            //splits on two whitespaces: "[model_prop] [el_prop] [THIRD_PARAM]"
            let regParams = baseParams.match(/[^\s]+\s+[^\s]+\s+/);
            if(!regParams)
                return baseParams.split(/\s+/);
            //We have a 3rd argument for a replacement/insertion value to stick into arg 2 field
            let result = baseParams.split(/\s+/);
            return [result[0], result[1], baseParams.substr(regParams[0].length)];
        });
    }
    this.passesDefinitiveCheck = function(attrs, event) {
        if(!attrs.def)
            return true;
        let def = attrs.def.value.trim();
        return ((def == "" || def === "model") && event.modelName === "*")
            || ((def == "" || def === "prop") && event.propName === "*")
            ? false : true;
    }
    this.resolveInsertionValue = function(expressionName, root) {
        let expression;
        if(expressionName.match(/^{{.+}}$/))
            expression = expressionName.substr(2, expressionName.length - 4);
        else {
            let pattern = document.querySelector("[" + SootheApp.prototype.expressionBindAttr + "=" + expressionName.trim() + "]");
            if(pattern)
                expression = pattern.innerText;
            else
                return root.value;
        }
        
        let result = expression;
        let insertionValues = expression.match(/{{[^{}]*}}/g);
        if(!insertionValues)
            return expression;
        insertionValues.forEach(insertionValue => {
            let props = insertionValue.replace("{{", "").replace("}}", "").trim().split(".");
            let value = root;
            props.forEach(prop => value = value[prop]);
            result = result.replace(insertionValue, value);
        });
        
        return result;
    }
    this.buildDomTemplate = function(target, templateName, values, event, attrs, indexes, appendMode) {
        let template = document.querySelector("[" + SootheApp.prototype.tmpltBindAttr + "=" + templateName + "]");
        if(!template)
            return;
        while (!appendMode && target.firstChild) {
            target.removeChild(target.firstChild);
        }
        for(let i = 0; i < values.length; i++)
        {
            let model = values[i];
            let index = indexes[i];
            template.childNodes.forEach(x => {
                let node = x.cloneNode(true);
                
                target.appendChild(node);
                //Bind all the local model and prop names
                let localModels = target.querySelectorAll("[" + SootheApp.prototype.modelBindAttr + "='" + SootheApp.prototype.insertionChar + "']");
                localModels.forEach(el => {
                    Object.values(el.attributes).map(x => x.name).forEach(attrName => {
                        if(attrName !== SootheApp.prototype.modelBindAttr &&
                            SootheApp.prototype.attributes.find(x => x === attrName)) {
                                el.setAttribute(attrName, el.getAttribute(attrName).replace(SootheApp.prototype.insertionChar
                                    , (model instanceof Object)  ? event.propName : "*"));
                            }
                    });
                    let modelAttr = el.getAttribute(SootheApp.prototype.modelBindAttr);
                    if(modelAttr !== undefined)
                        el.setAttribute(SootheApp.prototype.modelBindAttr, modelAttr.replace(SootheApp.prototype.insertionChar, index));
                });
                // if(node instanceof Element || node instanceof HTMLDocument) {
                    
                //     if(model === null || model === undefined) {

                //     }
                //     else if(typeof model === 'object') {
                //         Object.keys(model).forEach(propName => {
                //             let pseudoEvent = new SootheDomEvent(model, event.propName, propName, null, event.type, node);
                //             this.triggerEvent(node, pseudoEvent, true);
                //         });
                //     } else {
                //         let pseudoEvent = new SootheDomEvent(model, event.propName, "", null, event.type, node);
                //         this.triggerEvent(node, pseudoEvent, true);
                //     }
                //}
            });
        }
    }

    //Start the dom
    this.observer = new MutationObserver(this.mutationCallback.bind(this));
    this.observer.observe(this.root, 
        {childList: true, attributes: true, attributeFilter: SootheApp.prototype.attributes, subtree: true}
    );
    this.root.addEventListener("input", this.inputListener.bind(this));

    //Start the router
    this.root.addEventListener("click", this.routeListener.bind(this));
    this.root.addEventListener("keyup", this.keyUpListener.bind(this));
    this.root.addEventListener("submit", this.submitListener.bind(this));
    this.root.addEventListener("popstate", this.historyListener.bind(this));
}
SootheApp.prototype.getRootElement = function() {
    return this.root;
}
//======== Model Binding ==============//
SootheApp.prototype.getModels = function() {
    return Object.values(this.boundModels);
}
SootheApp.prototype.getModel = function(name) {
    if(name == null)
        return undefined;
    let model = this.boundModels;
    name.split(".").forEach(x => {
        if(x == null)
            return undefined;
        model = model[x];
        if(model == null)
            return undefined;
    });
    return model;
}
SootheApp.prototype.getModelData = function(name) {
    let model = this.getModel(name);
    return model == null ? model : model[SootheApp.prototype.rawModelDataProp];
}
SootheApp.prototype.bindModel = function(name, data) {
    if(!name)
        name = "";
    if(!data)
        data = {};

    //If this model already exist, unbind it first
    if(this.boundModels[name])
        this.unbindModel(name);

    let proxy = this.makeProxy(data, name, this, false);
    this.boundModels[name] = proxy;
    return proxy;
}
SootheApp.prototype.unbindModel = function(name) {
    let model = this.getModelData(name);
    if(!model)
        return null;

    let parts = name.split(".");
    let event = new SootheDomEvent(model, parts[0], "*", JSON.parse(JSON.stringify(model)), "unbind", this.getRootElement(), undefined);
    //Remove and unbind all of it's children
    Object.keys(model).forEach(x => delete model[x]);

    //If this is the root model, then remove it
    if(parts.length == 1) {
        delete this.boundModels[parts[0]];
        this.triggerEvent(this.getRootElement(), event);
    }
}
SootheApp.prototype.unbindAllModels = function() {
    Object.keys(this.boundModels).forEach(x => this.unbindModel(x));
    let event = new SootheDomEvent({}, "*", "*", null, "unbind", this.getRootElement(), undefined);
    this.triggerEvent(this.getRootElement(), event);
}

//=========== Events =============//
function SootheDomEvent(model, modelName, propName, oldValue, type, target, value) {
    this.model = !(model instanceof Object) || model[SootheApp.prototype.rawModelDataProp] === undefined
        ? model : model[SootheApp.prototype.rawModelDataProp];
    this.modelName = modelName;
    this.propName = propName;
    this.oldValue = oldValue;
    this.type = type; //Type of event
    this.target = target; //The element that triggered the event

    if(value === undefined) {
        if(modelName !== SootheApp.prototype.wildcardChar && propName !== SootheApp.prototype.wildcardChar)
            this.value = propName ? model[propName] : model;
        else
            this.value = null;
    } else {
        this.value = value;
    }

    let nameParts = modelName.split(".");
    this.varName = nameParts[nameParts.length - 1];
}

//Router
SootheApp.prototype.navigateTo = function(url, model) {
    if(url == null)
        url = window.location.pathname + window.location.search + window.location.hash;
    history.pushState(model, null, url);
    this.route(model);
}
SootheApp.prototype.addRoute = function(path, callback) {
    this.routes.push({path, callback});
}

//=========== Routing ===============//
function SootheRouteRequest(path, route, query, params, model){
    this.path = path;
    this.route = route;
    this.query = query;
    this.params = params;
    this.model = model;
}
function SootheRouteResponse(app){
    this.app = app;
}

function SootheView() {
}   
SootheView.prototype.render = function(req, res, next) {

    return new Promise( (resolve, reject) => {
        
        let checkForFetchError = function() {
            if (res && res.ok === false)
                throw new Error(res.status);
        };

        let promises = [];
        try {
            this.startRendering();
            document.title = this.getTitle();
            promises.push(this.getHTML(req));
            promises.push(this.getData(req));
            promises.push(this.getJavasScript(req));
        }
        catch (error) {
            try {
                this.finishRendering(error);
            }
            catch (err) {
                console.error(err);
            }
            reject(error);
            return;
        }

        Promise.all(promises)
        .then(responses => {
            responses.forEach(res => checkForFetchError(res));
            let html = responses[0];
            let data = responses[1];
            let js = responses[2];
            let promises = [html ? html.text ? html.text() : html : null
                , data ? data.json ? data.json() : data : null
                ,js ? js.text ? js.text() : js : null];
            return Promise.all(promises)
        })
        .then(responses => {
            let html = responses[0];
            let data = responses[1];
            let js = responses[2];

            let root = this.getRoot();
            let el = root;
            //Clean Html
            if (data) {
                this.processData(data);
            }
            if(html)
                while (el.firstChild)
                    el.removeChild(el.firstChild);
            
            if(js) {
                let script = document.createElement("script");
                script.innerHTML = js;
                root.appendChild(script);
            }
            if(html) {
                //Add html
                root.innerHTML += html;
            }

            //if we have a hash value to scroll to, scroll to it
            if(window.location.hash)
            {
                let el = document.getElementById(window.location.hash.substr(1));
                if(el)
                    el.scrollIntoView(true);
                else
                    root.parentNode.scrollIntoView();
            }
            else
            //Scroll back "to top"
                root.parentNode.scrollIntoView();
                const viewport = document.querySelector('meta[name="viewport"]');

                if ( viewport ) {
                    viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1';
                }
            this.finishRendering();
            resolve();
        })
        .catch(error => {
            this.finishRendering(error);
            reject(error);
        });
    });
}
SootheView.prototype.getTitle = function() {
    return document.title;
}
SootheView.prototype.getRoot = function() {
    let root = document.querySelector("main");
    return root ? root : document.body;
}
SootheView.prototype.getHTML = function(req) {
    return new Promise( (resolve, reject) => {
        resolve(null);
    });
}
SootheView.prototype.getJavasScript = function(req) {
    return new Promise( (resolve, reject) => {
        resolve(null);
    });
}
SootheView.prototype.getData = function(req) {
    return new Promise( (resolve, reject) => {
        resolve(null);
    });
}
SootheView.prototype.processData = function(data) {

}
SootheView.prototype.startRendering = function() {

}
SootheView.prototype.finishRendering = function() {

}