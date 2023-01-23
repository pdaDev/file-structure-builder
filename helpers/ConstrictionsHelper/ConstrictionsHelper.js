const TreeHelper = require('../TreeHelper/TreeHelper')
const p = require('path')

module.exports = class ConstrictionsHelper {
    constructor(config, args) {
        this._config = config
        this._args = args
    }
    checkExistence(path, value) {
        const truePath = p.resolve(this._config?.dir || '', path, value)
        return new TreeHelper().checkDir(truePath)
    }
}