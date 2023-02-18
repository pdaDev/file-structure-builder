const TypeBuilder = require('../TypeBuilder/TypeBuilder')

module.exports = class MethodBuilder {

    constructor(name) {
        this._name = name;
        this._types = []
    }

    addType(name, args, builder) {
        this._types.push(builder(new TypeBuilder(name, args)))
        return this
    }

    getTypes() {
        return this._types
    }

    getName() {
        return this._name
    }
}
