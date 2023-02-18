const TreeHelper = require('../TreeHelper/TreeHelper')
const p = require('path')

module.exports = class ConstrictionsHelper {
    constructor(config, args) {
        this._config = config
        this._args = args
    }

    checkFileExistence(path, file) {
        const truePath = p.resolve(this._config?.dir || '', path, file)
        return new TreeHelper().checkDir(truePath)
    }
    
    checkContentExistenceInFile(path, value) {
        const truePath = p.resolve(this._config?.dir || '', path)
        return new TreeHelper().getFileContent(truePath).indexOf(value) !== -1
    }
}