const ActionBuilder = require('../ActionBuilder/ActionBuilder')
const readline = require("readline");

module.exports = class TypeBuilder {
    constructor(name, args) {
        this._name = name
        this._args = args
        this._actions = []
    }

    getName() {
        return this._name;
    }

    addAction(builder, constrictions) {
        this._actions.push(builder(new ActionBuilder(constrictions)))
        return this
    }
    _requestConfirm(callback) {
        const rl = readline.createInterface(process.stdin, process.stdout)
        console.log('Are you sure to do it? (y/n)')
        return new Promise(res => {
            rl.on('line', str => {
                if (['y', 'n'].includes(str)) {
                    rl.close()
                    res(str === 'y')
                }
            })
        }).then(data => data && callback())
    }

    launch(config, args) {
        if (args.length < this._args.length) {
            console.log(`Not enough arguments`)
        } else {
            const typeArgs = this._args.reduce((acc, arg, i) => {
                acc[arg] = args[i]
                return acc
            } , {})
            const availableActions = this._actions.filter(action => action.resolveConstrictions(typeArgs, config).length === 0
            )
            if (availableActions.length === 0) {
                console.log(this._actions[0].resolveConstrictions(typeArgs, config))
            } else {
                this._requestConfirm(() => availableActions[0].launch(config, typeArgs))
            }

        }
    }
}