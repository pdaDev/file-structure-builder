const p = require('path')
const TreeHelper = require('../../helpers/TreeHelper/TreeHelper')
const DataFormatter = require('../../helpers/DataFormatter/DataFormatter')
const ArgsHelper = require('../../helpers/ArgsHelper/ArgsHelper')
const ConstrictionsHelper = require('../../helpers/ConstrictionsHelper/ConstrictionsHelper')

module.exports = class ActionBuilder {

    _treeHelper = new TreeHelper()
    _callbacks = []
    _mode = 'build'

    constructor(constrictions) {
        const t = () => ''
        this._constrictions = constrictions || t
        
    }
    resolveConstrictions(args, config) {
        const constrictionsResolve = this._constrictions(args, config, new ConstrictionsHelper(config, args))
        return typeof constrictionsResolve === 'boolean'
            ? constrictionsResolve
                ? ''
                : 'Your input data doesnt meet constrictions'
            :  constrictionsResolve
    }
    rewriteFile(path, builder) {
        this._callbacks.push(
           (config, args) => this._treeHelper.rewriteFile(p.resolve(config?.dir || '', this._formatData(args, config, path)), this._getData(config, args, builder)));
        return this
    }

    makeStructure(path, structure) {
        this._callbacks.push(
           (config, args) => this._treeHelper.createFileTree(p.resolve(config?.dir || '', this._formatData(args, config, path)), typeof structure === 'function'
                ? structure(args, config)
                : this._formatStructure(structure, args, config))
        )
        return this;
    }


    createFile(path, name, data) {
        return this.makeStructure(`${path}`, { [name]: data })
    }

    deleteFile(path) {
        this._callbacks.push(
            (config, args) => this._treeHelper.deleteFile(p.resolve(config?.dir || '', this._formatData(args, config, path))))
    }

    _formatStructure(structure, args, config) {
        return Object.keys(structure).reduce((acc, key) => {
            const formattedKey = new ArgsHelper(args, config).formatData(key)
            if (typeof structure[key] === 'object' && structure[key] !== null) {
                acc[formattedKey] = this._formatStructure(structure[key], args, config)
            } else if (structure[key] !== null) {
                acc[formattedKey] = new ArgsHelper(args, config).formatData(structure[key])
            }
            return acc
        }, {})
    }



    _formatData(args, config, data) {
        return new ArgsHelper(args, config).formatData(data)
    }

    _getData(config, args, builder) {
        return (data) => {
            if (typeof builder === 'string') {
                return this._formatData(args, config, builder)
            }
            const changedData = builder(new DataFormatter(data, config, args))
            return this._mode === 'test'
             ? changedData.getChanges()
             : changedData.getData()
        }
    }

    writeFile() {

    }

    launch (config, args, mode) {
        this._treeHelper.setMode(mode)
        this._treeHelper.setConfig(config) 
        this._mode = mode
        return Promise.all(this._callbacks.map(async callback => await callback(config, args, mode)))
    }
}
