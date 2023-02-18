const { init } = require('ramda')
const { start } = require('repl')
const ArgsHelper = require('../ArgsHelper/ArgsHelper')

class DataFormatter {

    constructor(data, config, args) {
        this.stringWidth = config?.stringWidth || -1
        this.fileExt = config?.fileExt || 'js'
        this.tab = config?.tab || 4
        this._data = data || ''
        this._argsHelper = new ArgsHelper(args, config)
        this._changes = []
    }

    _addMargins(data, margins = []) {
        const getMargin = (type) => {
           const margin = margins.find(margin => margin.indexOf(type) !== -1)?.split('-')
           return margin ? [...new Array(+margin[1] || 1)].fill(['left', 'right'].includes(type) ? ' ' : '\n').join('') : ''
        }
        return `${getMargin('up')}${getMargin('left')}${data}${getMargin('right')}${getMargin('down')}`

    }
    appendToImport = (type, names, path, margins) => {
        return this._formatInputData(names, (names) => {

            let lastImportLine = 0
            for (let str of  this._data.split('\n')) {
              ['import']
            }
            
            const importStatement = this._addMargins( `${type === 'reexport' ? 'export' : 'import'} ${type === 'all'
            ? `* as ${names[0]}`
            : `{ ${names.join(', ')} }`} from '${this._argsHelper.formatData(path)}';\n`, margins)
            this._data = importStatement + this._data

            this._changes.push(this._sbustringData(0,importStatement.length + 100))
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

        
        const symbolsForWrap = [',', ';', '||', '&&', '??', '[']

        if (string.length > this.stringWidth) {
          if ([...string].reverse().some((char, i) => symbolsForWrap.includes(char) && i !== 0)) {
            const lastWord = [...string].reduce((acc, char, i) => [','].includes(char) && i < this.stringWidth ? i : acc, -1) + 1
            const firstPart = string.substring(0, lastWord)
            const secondPart = string.substring(lastWord, string.length)
            return `${firstPart}\n${this._tabString(secondPart.trim(), this._defineTab(firstPart), needTab)}`
          }
        }
        return string
    }

    appendToBlock(blockName, data, margins, position = 'end') {
        return this._formatInputData([blockName, data], ([blockName, data]) => {
          const bracketIndexes = this._findBracketIndexes(this._data, blockName)
      
          if (position === 'end') {
            const index = this._findSymbolBeforeIndex(this._data, bracketIndexes[1])
            const [first, second] = this._separateStringInTwoParts(this._data, index)
            const initTabs = this._defineTab(this._getLineFromIndex(this._data, this._data.indexOf(blockName)))

            this._data = `${first.trim()}\n${this._addMargins(this._tabString(data.trim(), initTabs), margins)}\n${second}`

            this._changes.push(this._sbustringData(index - 100, index + data.length + 100))
          } else {
            const [start, end] = this._separateStringInTwoParts(this._data, bracketIndexes[0])
            this._data = `${start}, `
            this._changes.push(this._sbustringData(bracketIndexes[0] - 100, bracketIndexes[0] + data.length + 100))
          }

          return this
        })
    }
    appendToExport(data, margins) {
        return this._formatInputData(data, (data) => {
            if (/export/gm.test(this._data)) {
                const [first, second] = this._separateStringInTwoParts(this._data, this._data.indexOf(this._getLineFromIndex(this._data, this._findBracketIndexes(this._data, 'export')[1])) + 1)
                const [beforeBracket, afterBracket] = this._separateStringInTwoParts(second, second.indexOf('}'))
                this._data = `${first}${this._moveLine(`${beforeBracket.trimEnd()}, ${this._addMargins(data, margins)} ${afterBracket}`,
                    this._data.substring(this._data.indexOf('export'), this._data.length).length < this.stringWidth)}`
            } else {
                this._data = this._data + `export { ${this._addMargins(data, margins)} }`
            }
            this._changes.push(this._sbustringData(this._data.indexOf('export'), this._data.length))
            return this
        })
    }

    appendToDestructing(objectName, data, margins, position = 'end') {
        return this._formatInputData([objectName, data], ([objectName, data]) => {
          const bracketIndexes = this._findBracketIndexes(this._data,' = ' + objectName, '{}', 'reverse')
          const dataWithMargins = this._addMargins(data, margins)

          if (position === 'end') {
          
            const bracketIndex = bracketIndexes[1] - 1;
            const lastSymbolIndex = this._findSymbolBeforeIndex(this._data, bracketIndex)
            const [first, second] = this._separateStringInTwoParts(this._data, this._data.indexOf(this._getLineFromIndex(this._data, lastSymbolIndex)))
            const [start, end] =  this._separateStringInTwoParts(second, lastSymbolIndex - first.length + 1)
            const lastSymbol = this._data[lastSymbolIndex]
            const beforeComma = ![',', '{'].includes(lastSymbol) ? ',' : ''
            const beforeSpace = margins?.includes('up') ? '' : ' '
            const afterComma = lastSymbol === ',' ? ',' : ''
                            
            this._data = `${first}${start}${beforeComma}${beforeSpace}${dataWithMargins}${afterComma}${end}`
            const newBracketsIndexes = this._findBracketIndexes(this._data,' = ' + objectName, '{}', 'reverse')
            this._editPartOfData(newBracketsIndexes, data => this._alignDataByWidth(data)) 
            this._changes.push(this._sbustringData(lastSymbolIndex - 100 - data.length, lastSymbolIndex + 100))
          } else if (position === 'start') {
            const [start, end] = this._separateStringInTwoParts(this._data, bracketIndexes[0] + 1)
            const tabbedData = dataWithMargins;
            this._data = `${start} ${tabbedData}, ${end.trimLeft()}`
            const newBracketsIndexes = this._findBracketIndexes(this._data,' = ' + objectName, '{}', 'reverse')
            
            this._editPartOfData(newBracketsIndexes, data => this._alignDataByWidth(data)) 
            this._changes.push(this._sbustringData(bracketIndexes[0] - 100, bracketIndexes[0] + 100 + data.length))
          }
          return this
        })
    }

    appendAfter(sep, data, margins, tabs) {
        return this._formatInputData([sep, data], (([sep, data]) => {
            const separatorIndex = this._data.indexOf(sep) + sep.length
            const [first, second] = this._separateStringInTwoParts(this._data, separatorIndex )
            const lineWithSeparator = this._getLineFromIndex(this._data, this._data.indexOf(sep))
            
            const tabbedData = tabs > 0 ? this._setTabByCount(data, tabs) : this._tabString(data, this._defineTab(lineWithSeparator), margins?.includes('up' | 'down'))
            
            const dataWithMargins = this._addMargins(this._alignDataByWidth(tabbedData), margins)

            this._data = `${first}${dataWithMargins}${second}`

            const startOfChanges = separatorIndex - data.length
            this._changes.push(this._sbustringData(startOfChanges - 100, startOfChanges + 100 + data.length))
          
            return this
        }))
    }

    appendBefore(sep, data, margins, tabs) {
        return this._formatInputData([sep, data], ([sep, data]) => {
            const lineWithSeparator = this._getLineFromIndex(this._data, this._data.indexOf(sep))
            const separatorIndex = margins?.includes('down') ? this._data.indexOf(lineWithSeparator) + 1 : this._data.indexOf(sep) - 1
            const [first, second] = this._separateStringInTwoParts(this._data, separatorIndex)
            const tabbedData = tabs > 0 ? this._setTabByCount(data, tabs) : this._tabString(data, this._defineTab(lineWithSeparator), margins?.includes('up' | 'down'))
            const dataWithMargins = this._addMargins(this._alignDataByWidth(tabbedData), margins)
                      
            this._data = `${first}${dataWithMargins}${second}`

            this._changes.push(this._sbustringData(separatorIndex - 100, separatorIndex + data.length + 100))
          
            return this
        })
    }

    _sbustringData(start = 0, end = this._data.length) {
        return this._data.substring(Math.max(start, 0), Math.min(end, this._data.length))
    }

    appendToTop(data, margins) {
        return this._formatInputData(data, data => {
            const alignedData = this._alignDataByWidth(data)
            const dataWithMargins = this._addMargins(alignedData, margins)
            this._data = `${dataWithMargins}\n${this._data}`
            this._changes.push(this._sbustringData(0, data.length + 100))
            return this
        })
    }

    appendToEnd(data, margins) {
        return this._formatInputData(data, data => {
          const alignedData = this._alignDataByWidth(data)
          const dataWithMargins = this._addMargins(alignedData, margins)
          this._data = `${this._data}\n${dataWithMargins}`
          this._changes.push(this._sbustringData(this._data.length - data.length - 100))
          return this
        })
    }

    _findSymbolBeforeIndex(data, index) {
        let firstSymbolBeforeBracketIndex = 0
       
        for (let i = index - 1; i > 0; i--) {
            if (![' ', '\n'].includes(data[i]) && data[i].charCodeAt().toString(16) !== 'd') {
                firstSymbolBeforeBracketIndex = i
                break
            }
        }
        return firstSymbolBeforeBracketIndex
    }

    appendToArrayOrObject(type, objectName, data, margins, position = 'end', separator = ',') {
        return this._formatInputData([data, objectName],([data, objectName]) => {
          const brackets = type === 'object' ? '{}' : '[]'
          const breacketsIndexes = this._findBracketIndexes(this._data, `${objectName.trim()}`, brackets)
        
            if (position === 'end') {
              const firstSymbolBeforeBracketIndex = this._findSymbolBeforeIndex(this._data, breacketsIndexes[1] - 1)
              const [s, e] = this._separateStringInTwoParts(this._data, this._data.indexOf(this._getLineFromIndex(this._data, firstSymbolBeforeBracketIndex)))
              const [start, end] = this._separateStringInTwoParts(e, firstSymbolBeforeBracketIndex - s.length + 1)
              const lastNewLineIndex = end.indexOf('\n')
              const [ss, ee] = this._separateStringInTwoParts(end,  lastNewLineIndex !== -1 ? lastNewLineIndex : end.length - 1)
              const firstSymbolBeforeBracket = this._data[firstSymbolBeforeBracketIndex] // omg can't understand why this works. In some reasons it finds right index, but choose wrong symbol on this index
              const beforeComma = ![separator, brackets[0]].includes(firstSymbolBeforeBracket) ? separator : ''
              const beforeSpace = margins?.includes('up') ? '' : ' '
              const afterComma = firstSymbolBeforeBracket === separator ? separator : ''
              
              const tabbedData = margins?.includes('up') ? this._tabString(data, this._defineTab(start), false) : data 
              const alignedData = this._alignDataByWidth(tabbedData)
              const dataWithMargins = this._addMargins(alignedData, margins)
      
              this._data = `${s}${start}${beforeComma}${beforeSpace}${dataWithMargins}${afterComma}${ss}${ee}`
              
              this._allignArrayOrObjectFromData(type, objectName)
              this._changes.push(this._sbustringData(firstSymbolBeforeBracketIndex - 200, firstSymbolBeforeBracketIndex + 100 + data.length))
              
            } else if (position === 'start') {
              const [start, end] = this._separateStringInTwoParts(this._data, breacketsIndexes[0] + 1)
              const tabbedData = margins?.includes('up') ? this._tabString(data, this._defineTab(this._getLineFromIndex(this._data, breacketsIndexes[0]))) : data
              const alignedData = this._alignDataByWidth(tabbedData)
              
              const dataWithMargins = this._addMargins(alignedData, margins) 
              const space = margins?.includes('up') ||  margins?.includes('down') ? '' : ' '
              this._data = `${start.trimRight()}${dataWithMargins}${separator}${space}${end}`
             
              this._allignArrayOrObjectFromData(type, objectName)
            
              this._changes.push(this._sbustringData(breacketsIndexes[0] - 100, breacketsIndexes[0] + 100 + data.length))
            } else {
              const startIndex = this._data.substring(breacketsIndexes[0], breacketsIndexes[1]).split(',').reduce((acc, el, i) => i < position ? acc + el.length + 1 : acc, 0) + breacketsIndexes[0]
              const [start, end] = this._separateStringInTwoParts(this._data, startIndex)
              
              const tabbedData = margins?.includes('up') ? this._tabString(data, this._defineTab(this._getLineFromIndex(this._data, startIndex)), false) : data 
              const alignedData = this._alignDataByWidth(tabbedData)
              const dataWithMargins = this._addMargins(alignedData, margins) 
              this._data = `${start} ${dataWithMargins}${separator} ${end}`
              this._allignArrayOrObjectFromData(type, objectName)
              this._changes.push(this._sbustringData(startIndex - 100, startIndex + 100 + data.length))
            }
           
            return this
        })
    }

    _allignArrayOrObjectFromData(type, name) {
      const brackets = type === 'array' ? '[]' : '{}';
      const bracketsIndexes = this._findBracketIndexes(this._data, name, brackets)
      const startIndex = this._data.indexOf(this._getLineFromIndex(this._data, bracketsIndexes[0])) + 1
      this._editPartOfData([startIndex, bracketsIndexes[1]], (data) => this._alignDataByWidth(data))
    }

    _editPartOfData(indexes, callback) {
      const hasFewIndexes = Array.isArray(indexes) 
      const indexesForEdit = hasFewIndexes
        ? indexes
        : [indexes, indexes]
      
      this._data = this._sbustringData(0, indexesForEdit[0])
         + callback(hasFewIndexes ? this._sbustringData(indexesForEdit[0], indexesForEdit[1]) : '')
         + this._sbustringData(indexesForEdit[1], this._data.length)
    }

    _separateStringInTwoParts(string, index) {
        return [string.substring(0, index), string.substring(index, string.length)]
    }

    _defineTab(string) {
      const tab = string.search(/\S/)
      return tab > 0 ? tab : 0 
    }
    _setTabByCount(string, tabsCount) {
        const tab = [...new Array(this.tab * tabsCount + 1)].fill('').join(' ')
        return `${tab}${string}`
    }

    _getLineFromIndex(string, index) {
        const indexStart = [...string].reduce((acc, char, i) => char === '\n' && i < index ? i : acc, -1)
        return string.substring(indexStart, string.length)
    }

    _alignDataByWidth(data, i = 0) {
      const symbolsForWrap = [',', ';', '||', '&&', '??', '[']
    
      let hasWraps = false;
      const strings = data.trimRight().split('\n')

      const newData = strings.map((str, i) => {
        
        if (str.length > this.stringWidth) {
          if ([...str].reverse().some((char, index) => symbolsForWrap.includes(char) && index > 2)) {
            hasWraps = true
            const index = str.length - [...str].reverse().reduce((acc, c, i) => str.length - i < this.stringWidth && acc === 0 && symbolsForWrap.includes(c) ? i : acc, 0)
            const tabBefore = this._defineTab(strings[Math.max(0, i - 1)])
            const tab = this._defineTab(str)
            
            const tabAfter = this._defineTab(strings[Math.min(i + 1, strings.length - 1)])
            const needAddTab = strings.length === 1
            
            const initTab = ((tabBefore === tabAfter && tabBefore === tab) && strings.length > 1)
             ? tab
             : tabAfter
          
            return str.substring(0, index) + '\n' + this._tabString(str.substring(index, str.length).trim(), initTab + 1, needAddTab)
          }
        }
        
        return str + (i !== data.length - 1 ? '\n' : '')
      }).join('')

      if (i === 100) {
        return newData
      }
     
      return hasWraps ? this._alignDataByWidth(newData, ++i) : newData.trimRight()
    } 

    _insertToString(string, index, value) {
      return string.substring(0, index) + value + string.substring(index + 1, string.length) 
    }

    _findBracketIndexes(string, blockName, bracketType = '{}', direction) {
      const isNotReverse = direction !== 'reverse'
      const indexForFind = string.indexOf(blockName) + (isNotReverse ? blockName.length : 0)
     
        const startIndex = isNotReverse
         ? string.substring(indexForFind, string.length).indexOf(bracketType[0]) + indexForFind
         : [...string.substring(0, indexForFind)].reverse().join('').indexOf(bracketType[1]) + indexForFind

        let bracketsWithoutPair = 0
        let endIndex = -1
        let strForFindLastBracket = isNotReverse
          ? string.substring(startIndex, string.length)
          : string.substring(0, startIndex)
        const loopStart = isNotReverse
          ? 0
          : strForFindLastBracket.length - 1
        
        const loopEnd = i => !isNotReverse
          ? i > 0
          : i < strForFindLastBracket.length
      
        for (let i = loopStart; loopEnd(i); i = i + (!isNotReverse ? -1 : 1)) {

          if (strForFindLastBracket[i] === bracketType[0]) {
            bracketsWithoutPair++
          }

          if (strForFindLastBracket[i] === bracketType[1]) {
            bracketsWithoutPair--
          }

          const isLastBracket = strForFindLastBracket[i] === bracketType[isNotReverse ? 1 : 0]
    
          if (bracketsWithoutPair === 0 && isLastBracket ) {
              endIndex = isNotReverse
               ? startIndex + i + 1
               : i
              break
          }
        }
        return isNotReverse
          ? [startIndex, endIndex]
          : [endIndex, startIndex]
    }

    _tabString(string, initTab = 0, needAddTab = true) {
        if (this.tab === 0) {
            return string
        }

        return string.split('\n').map(str => Array.apply(null, new Array(initTab + (needAddTab ? this.tab : 0))).join(' ') + str).join('\n')
    }

    getData() {
        return this._data
    }

    getChanges() {
        const sepLine = '============================================================='
        return this._changes.map((change, i) => `CHANGE #${i + 1}\n${sepLine}\n\n${change.trim()} \n\n`).join('0')    
    }
}

module.exports = DataFormatter