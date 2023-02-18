const path = require("path");
const fs = require("fs/promises");
const fsSync = require('fs');
module.exports = class TreeHelper {

    _mode = 'build'
    _extensions = ['txt', 'js', 'css', 'scss', 'less', 'sass', 'jsx', 'tsx', 'ts', 'md']

    constructor (config) {
      this.setConfig(config)
    }

    _checkRootIsFile(root) {
        const arrayFromKey= root.split('.')
        return this._extensions.includes(arrayFromKey[arrayFromKey.length - 1])
    }

    createFileTree(root, treeStructure, tab = '', i = 0) {
        if (this._mode === 'build') {
           return Promise.all(Object.keys(treeStructure).map(key => {
            const filePath = path.resolve(root, key)
            const isFile = this._checkRootIsFile(key)

            return isFile
             ? fs.writeFile(filePath, treeStructure[key] || '')
             : fs.mkdir(filePath).then(() => {
                const hasFilesInFolder = typeof treeStructure[key] === 'object' && treeStructure[key] !== null;
                if (hasFilesInFolder) {
                   this.createFileTree(filePath, treeStructure[key]);
                }
            })
        }));
        } else {
            if (i === 0) {
                console.log ('\nWe create new structure in path:' + path.resolve(root) + '\n')
            }
            return Promise.all(Object.keys(treeStructure).map(async key => {
                if (typeof treeStructure[key] === 'object' && treeStructure[key] !== null) {
                    return new Promise((r) => {
                        console.log(tab + key + '/')
                        this.createFileTree('', treeStructure[key], tab + '  ', i + 1)
                        r()
                    })
                }
                return await console.log(tab + key)
            }))       
        }
    }

    rewriteFile(path, callback) {
       return fs.readFile(path, 'utf-8').then(data => callback(data)).then(data => {
            switch (this._mode) {
                case 'build':
                    return fs.writeFile(path, data)
                case 'test':
                    return new Promise(r => {
                        console.log('\n' + path + '\n\n' + data)
                        r()
                    })
            }
        })
    }

    deleteFile(path) {
        if (this._mode === 'build') {
           return fs.unlink(path)
        } else {
            return new Promise((r) => {
                const files = path.split('/')
                console.log('\nWe have deleted this file' + files[files.length - 1] + 'on path' + files.slice(0, files.length - 2).join('/')  + '\n' )
                r()
            })
        }
    }

    checkDir(path) {
        return fsSync.existsSync(path)
    }

    getFileContent(path) {
        return fsSync.readFileSync(path, 'utf-8')
    }

    setMode(mode) {
        this._mode = mode
    }

    setConfig(config) {
        this._extensions = [...this._extensions, ...(config?.extensions || [])]
    }
}
