const path = require("path");
const fs = require("fs/promises");
const fsSync = require('fs');

module.exports = class TreeHelper {
    createFileTree(root, treeStructure) {
        Object.keys(treeStructure).forEach(key => {
            const filePath = path.resolve(root, key);
            const isFile = /\./.test(key);
            if (isFile) {
                fs.writeFile(filePath, treeStructure[key] || '');
            } else {
                fs.mkdir(filePath).then(() => {
                    const hasFilesInFolder = typeof treeStructure[key] === 'object' && treeStructure[key] !== null;
                    if (hasFilesInFolder) {
                        this.createFileTree(filePath, treeStructure[key]);
                    }
                }).catch(e => {
                    const hasFilesInFolder = typeof treeStructure[key] === 'object' && treeStructure[key] !== null;
                    if (hasFilesInFolder) {
                        this.createFileTree(filePath, treeStructure[key]);
                    }
                });
            }
        });
    }

    rewriteFile(path, callback) {
        fs.readFile(path, 'utf-8').then(data => {
            fs.writeFile(path, callback(data));
        })
    }

    deleteFile(path) {
        fs.unlink(path)
    }

    checkDir(path) {
        return fsSync.existsSync(path)
    }
}