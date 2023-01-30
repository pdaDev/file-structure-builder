const ArgsHelper = require('../ArgsHelper/ArgsHelper')

module.exports = class DataFormatter {

    constructor(data, config, args) {
        this.stringWidth = config?.stringWidth || -1
        this.fileExt = config?.fileExt || 'js'
        this.tab = config?.tab || 4
        this._data = data || ''
        this._argsHelper = new ArgsHelper(args, config)
    }

    _addMargins(data, margins = []) {
        return `${margins.includes('up') ? '\n' : ''}${margins.includes('left') ? ' ' : ''}${data}${margins.includes('right') ? ' ' : ''}${margins.includes('down') ? '\n' : ''}`
    }
    appendToImport = (type, names, path, margins) => {
        return this._formatInputData(names, (names) => {
            this._data = this._addMargins( `${type === 'reexport' ? 'export' : 'import'} ${type === 'all'
                ? `* as ${names[0]}`
                : `{ ${names.join(', ')} }`} from '${this._argsHelper.formatData(path)}'\n` + this._data, margins)
            return this
        })
    }

    _formatInputData(data, callback) {
        if (Array.isArray(data)) {
           return callback(data.map(el => this._argsHelper.formatData(el).trim()))
        }
        return callback(this._argsHelper.formatData(data).trim())
    }
    _createExportStatement(names) {
        return `export { ${names.join(', ')} }`
    }

    _moveLine(string, needTab = true) {
        if (this.stringWidth < 50) {
            return string
        }
        if (string.length > this.stringWidth) {
            const lastWord = [...string].reduce((acc, char, i) => [','].includes(char) && i < this.stringWidth ? i : acc, -1) + 1
            const firstPart = string.substring(0, lastWord)
            const secondPart = string.substring(lastWord, string.length)
            return `${firstPart}\n${this._tabString(secondPart.trim(), this._defineTab(firstPart), needTab)}`
        }
        return string
    }

    appendToBlock(blockName, data, margins) {
        return this._formatInputData([blockName, data], ([blockName, data]) => {
            const [first, second] = this._separateStringInTwoParts(this._data, this._findBracketIndexes(this._data, blockName)[1] - 1)
            const initTabs = this._defineTab(this._getLineFromIndex(this._data, this._data.indexOf(blockName)));
            this._data = this._addMargins(`${first.trim()}\n${this._tabString(data.trim(), initTabs)}\n${second.trim()}`, margins )
            return this
        })
    }
    appendToExport(data, margins) {
        return this._formatInputData(data, (data) => {
            if (/export/gm.test(this._data)) {
                const [first, second] = this._separateStringInTwoParts(this._data, this._data.indexOf(this._getLineFromIndex(this._data, this._findBracketIndexes(this._data, 'export')[1])) + 1)
                const [beforeBracket, afterBracket] = this._separateStringInTwoParts(second, second.indexOf('}'))
                this._data = this._addMargins(`${first}${this._moveLine(`${beforeBracket.trimEnd()}, ${data} ${afterBracket.trim()}`,
                    this._data.substring(this._data.indexOf('export'), this._data.length).length < this.stringWidth)}`, margins)
            } else {
                this._data = this._addMargins(this._data + `export { ${data} }`, margins)
            }
            return this
        })
    }

    appendToDestructing(objectName, data, margins) {
        return this._formatInputData([objectName, data], ([objectName, data]) => {
            const index = this._data.indexOf(' = ' + objectName)
            const bracketIndex = [...this._data].reduce((acc, char, i) => char === '}' && i < index ? i : acc, -1)
            const [first, second] = this._separateStringInTwoParts(this._data, bracketIndex)
            this._data = this._addMargins(this._moveLine(`${first}, ${data} ${second}`), margins)
            return this
        })
    }

    appendAfter(sep, data, margins) {
        return this._formatInputData([sep, data], (([sep, data]) => {
            const [first, second] = this._separateStringInTwoParts(this._data, this._data.indexOf(sep) + sep.length)
            this._data = `${first}${this._tabString(this._addMargins(data, margins), this._defineTab(first), margins.includes('up' | 'down'))}${second}`
            return this
        }))
    }

    appendBefore(sep, data, margins) {
        return this._formatInputData([sep, data], ([sep, data]) => {
            const [first, second] = this._separateStringInTwoParts(this._data, this._data.indexOf(sep) - 1)
            this._data = `${first}${this._addMargins(data, margins)}${second}`
            return this
        })
    }

    appendToTop(data, margins) {
        return this._formatInputData(data, data => {
            this._data = this._addMargins(`${data}\n${this._data}`, margins)
            return this
        })
    }

    appendToEnd(data, margins) {
        return this._formatInputData(data, data => {
            this._data = this._addMargins(`${this._data}\n${data}`, margins)
            return this
        })
    }

    // appendToArrayOrObject(type, objectName, data, margins) {
    //     return this._formatInputData([data, objectName],([data, objectName]) => {
    //         const bracketEnd = this._findBracketIndexes(this._data, objectName)[1];
    //         let firstSymbolBeforeBracket = 0
    //         for (let i = bracketEnd - 1; i > 0; i--) {
    //             if (this._data[i] !== (' ' || '\n')) {
    //                 firstSymbolBeforeBracket = i
    //             }
    //         }
    //         const [s, e] = this._separateStringInTwoParts(this._data, this._data.indexOf(this._getLineFromIndex(this._data, firstSymbolBeforeBracket) + 1))
    //         const [start, end] = this._separateStringInTwoParts(e, firstSymbolBeforeBracket)
    //         const lastNewLineIndex = end.indexOf('\n')
    //         const [ss, ee] = this._separateStringInTwoParts(end,  lastNewLineIndex !== -1 ? lastNewLineIndex : end.length - 1)
    //         const comma = this._data[firstSymbolBeforeBracket] !== (type === 'object' ? '{' : '[') ? ',' : ''
    //
    //         this._data = `${s}${this._moveLine(`${start}${comma}${this._addMargins(data, margins)}${ss}`)}${ee}`
    //
    //         return this
    //     })
    // }

    _separateStringInTwoParts(string, index) {
        return [string.substring(0, index), string.substring(index, string.length)]
    }

    _defineTab(string) {
        return string.search(/\S/) + 1
    }

    _getLineFromIndex(string, index) {
        const indexStart = [...string].reduce((acc, char, i) => char === '\n' && i < index ? i : acc, -1)
        return string.substring(indexStart, string.length)
    }

    _findBracketIndexes(string, blockName, bracketType = '{}') {
        const startIndex = string.indexOf(`${blockName} = ${bracketType[0]}`) + blockName.length + 3;
        let bracketsWithoutPair = 0;
        return [ startIndex,
            [...string.substring(startIndex, string.length)].reduce((acc, char, i) => {
                if (char === bracketType[0]) {
                    bracketsWithoutPair++
                }
                if (char === bracketType[1]) {
                    bracketsWithoutPair--
                    if (bracketsWithoutPair === 0) {
                        return i + startIndex
                    }
                }
                return acc
            }, -1)
        ]
    }

    _tabString(string, initTab = 0, needAddTab = true) {
        if (this.tab === 0) {
            return string
        }
        return string.split('\n').map(str => Array.apply(null, new Array(initTab + needAddTab ? this.tab : 0)).join(' ') + str).join('\n')
    }

    getData() {
        return this._data
    }
}

const DATA = `
const b = [ 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]



`

const refactor = new DataFormatter(DATA, { stringWidth: 70, fileExt: 'txt', tab: 5 }, {name: 'dima'})
console.log(refactor.appendAfter('const b = [', '5,', []).getData())