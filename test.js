const Wtc = require('./index')


const wtc = new Wtc('file-structure-builder', { }).addMethod('create', mb => mb
    .addType('folder', ['name'], tb => tb.addAction(b => b.makeStructure('',{ folder: null }))))


wtc.launch()

