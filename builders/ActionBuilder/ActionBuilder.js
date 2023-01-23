const p = require('path')
const TreeHelper = require('../../helpers/TreeHelper/TreeHelper')
const DataFormatter = require('../../helpers/DataFormatter/DataFormatter')
const ArgsHelper = require('../../helpers/ArgsHelper/ArgsHelper')
const ConstrictionsHelper = require('../../helpers/ConstrictionsHelper/ConstrictionsHelper')

module.exports = class ActionBuilder {

    _treeHelper = new TreeHelper()
    _callbacks = []

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
            } else {
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
            return builder(new DataFormatter(data, config, args)).getData()
        }
    }

    writeFile() {

    }

    launch(config, args) {
        this._callbacks.forEach(callback => callback(config, args))
    }
}
