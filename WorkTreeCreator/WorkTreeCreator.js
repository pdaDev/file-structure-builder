const TreeHelper = require('../helpers/TreeHelper/TreeHelper')
const MethodBuilder = require('../builders/MethodBuilder/MethodBuilder')

const path = require('path')
module.exports = class WorkTreeCreator {
    _method = process.argv[2]
    _type = process.argv[3]
    _methods = []
    treeCreator = new TreeHelper()

    constructor(dir, fileStructure, config) {
        const paths = dir ? dir.split('.') : [];
        this._dirPath = path.resolve(__dirname.substring(0, __dirname.indexOf(paths[0])), ...paths);
        this._fileStructure = fileStructure || {};
        this._config = {
            fileStructure,
            ...config,
            dir: this._dirPath
        };
    }

    makeFileStructure() {
        this.treeCreator.createFileTree(this._dirPath, this._fileStructure)
    }

    _getJSXFileExtension() {

    }

    launch() {
        if (this._method === 'make' && this._type === 'structure') {
            this.makeFileStructure()
        } else {
            const method = this._methods.find(m => m.getName() === this._method)
            if (method) {
                const type = method.getTypes().find(t => t.getName() === this._type)
                if (type) {
                    type.launch(this._config, process.argv.slice(4, process.argv.length))
                } else {
                    this._logVarDoesntExist('type', this._type)
                }
            } else {
                this._logVarDoesntExist('method', this._method)
            }
        }
    }

    _logVarDoesntExist(variable, value) {
        console.log(`This ${value} ${variable} doesn't exist`)
    }

    addMethod(name, builder) {
        this._methods.push(builder(new MethodBuilder(name, this._config)))
        return this;
    }
}

