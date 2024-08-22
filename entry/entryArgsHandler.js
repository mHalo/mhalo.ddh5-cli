import commandLineArgs from "command-line-args"

import help from './args-handlers/help.js'
import version from './args-handlers/version.js'

const handlers = {
    version,
    help
}

const cdmArgs = [{ 
    name: "version", 
    alias: "v", 
    type: Boolean 
}, { 
    name: "help", 
    alias: "h", 
    type: Boolean 
}]

const options = commandLineArgs(cdmArgs);
export default {
    register: () => {
        Object.keys(handlers).forEach(key => {
            let handled = handlers[key].handle(options);
            return !handled;
        })
    }
}