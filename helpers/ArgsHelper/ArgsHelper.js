module.exports = class ArgsHelper {
    constructor(args, config) {
        this._args = args
        this._ext = config?.fileExt
        this._config = config
    }

    formatData(data) {
        if (typeof data === 'function') {
            return data(this._args, this._config)
        }
        return data?.match(/\[(.*?)\]/g)?.reduce((a, arg) => {
            const [value, ...flags] = arg.slice(1, arg.length - 1).split(' ')
            return a.substring(0, a.indexOf(arg))
                + flags.reduce((acc, flag) => this._changeDataByFlags(acc, flag), this._args[value] || value)
                + a.substring(a.indexOf(arg) + arg.length, a.length)
        }, data) || data
    }

    _changeDataByFlags(data, flag) {
        if (/-F/.test(flag))
            return this._getStringWithFirstUpperChar(data)
        if (/-file/.test(flag))
            return this._getFile(data, flag.split('-')[2])
        if (/-s_c/.test(flag))
            return this._refactorCamelCaseToSnakeCase(data)
        if (/-u/.test(flag))
            return data.toUpperCase()
        if (/-l/.test(flag))
            return data.toLowerCase()
        return data
    }
    _refactorCamelCaseToSnakeCase(string) {
        return [...string].map(symbol => (symbol.toUpperCase() === symbol ? `_${symbol.toLowerCase()}` : symbol)).join('');
    }

    _getStringWithFirstUpperChar(string) {
        return string[0].toUpperCase() + string.slice(1, string.length);
    }
    _getJSX(string) {
        return this._getFile(string) + 'x'
    }
    _getFile(string, ext) {
        return string + `.${ext || this._ext || 'txt'}`
    }
}
