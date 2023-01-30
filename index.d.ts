

declare module 'WorkTreeCreator' {

    /**There is some default console commands:
     * make structure - creates in dir path structure form input args */
    class WorkTreeCreator {
        /** this method add some method to operate with something
         * @param name name of methof
         * @param builder builder of method
         *
         * @example addMethod('create', mb => mb.someMethod())*/
        addMethod(name: string, builder: (builder: MethodBuilder) => MethodBuilder): WorkTreeCreator
        /**This method launch config*/
        launch()
        /**
         * @param dir start point of directory. It's important to specify this path according project folder
         * /Example: you have project in my-project-folder, so you need set dir path like that 'my-project-folder/src'
         * You can write nested path via slash
         * @param filesStructure start file structure of your project
         * @param config some additional options*/
        constructor(dir: string, filesStructure: object, config: InputConfig)
    }

    interface InputConfig {
        fileExt: string
        stringWidth: string
        tab: string
    }
    interface Config extends InputConfig {
        dir: string
        fileStructure: object
    }

    class TypeBuilder {
        /**
         * This method add actions to your type. You can add few actions to one type. If you don't set constrictions
         * for them, so program start the first of them, in the other case it starts first action in list, what has
         * successfully resolved constrictions
         * @param builder action builder
         * @param constrictions It's callback, what get three arguments: args: object, what has fields equals type args,
         * config, helper - aad some helpful methods
         * constriction can return boolean value or string. If string returns empty string, it means, that constriction was succesfully resolved
         * On the other hand, string is error message, what will be printed in console in case of wrong arguments
         * */
        addAction(builder: (builder: ActionBuilder) => ActionBuilder, constrictions?: (args: any, config: Config, helpers: ConstrictionHelper) => string | boolean):TypeBuilder
    }

    class ConstrictionHelper {
        /** This method checks existences of file of folder in some path
         * @param path path to folder or file /'folder/folder2'.
         * Path has start in dir pont
         * @param value name of file of folder
         * */
        checkExistence(path: string, value: string): boolean
    }

    /** @description In this string you can put constructions like that [name], where name
     * is argument, what was defined in adding type stage
     * After formatting this part will be changed to value of this variable
     * Furthermore, you can add some flags to this construction in order to change the value<br/>
     * Available flags:<br/>
     * -F - transform first letter of string to Upper case <br/>
     * -file-nameOfFile - add file extension to string. You can not specify name of file extension, program takes it from config<br/>
     * -u - transform all string to upper case<br/>
     * -l - transform all string to lower case<br/>
     * -s_c - transform camel case into snake case<br/>
     * @example ./folder/[name -file-jsx -F]
     * */
    type Formattedstring = string
    class ActionBuilder {
        /**This method allows to rewrite some file in certain path
         * You can modify file step by step via builder
         * @param path path to file
         * @param builder builder of rewriting process
         *
         * @example actionBuilder.rewriteFile('folder', b => b.someMethod())*/
        rewriteFile(path: Formattedstring, builder: (builder: DataFormatter) => DataFormatter): ActionBuilder
        makeStructure(path: Formattedstring, structure: object): ActionBuilder
        deleteFile(path): ActionBuilder
        createFile(path: Formattedstring, name: Formattedstring, data: Formattedstring): ActionBuilder



    }
    /** Allows to add gap at the start or end of string */
    type Margins = Array<'top' | 'left' | 'bottom' | 'right'>

    class DataFormatter {

        /** */
        appendToImport(type: 'certain' | 'all' | 'reexport', names: Formattedstring[], path: Formattedstring, margins?: Margins) : DataFormatter
        /** */
        appendToBlock(blockName: Formattedstring, data: Formattedstring, margins?: Margins): DataFormatter
        /** */
        appendToExport(data: Formattedstring, margins?: Margins): DataFormatter
        /** */
        appendToDestructing(objectName: Formattedstring, data: Formattedstring, margins?: string): DataFormatter
        /** */
        appendAfter(sep: Formattedstring, data: Formattedstring, margins?: string): DataFormatter
        /** */
        appendBefore(sep: Formattedstring, data: Formattedstring, margins?: string): DataFormatter
        /** */
        appendToTop(data: Formattedstring, margins?: Margins): DataFormatter
    }




    class MethodBuilder {
        /**
         * This method allows you to add to your config object, what you can operate with
         * @param name name of type
         * @param args variables, what user enter in console after type declaration
         * @param builder It's a callback, what gets TypeBuilder class as argument and returns it
         *
         * @example addType('feature', ['name'], b => b.addAction(...))
         * */
        addType(name: string, args: string[], builder: (builder: TypeBuilder) => TypeBuilder): MethodBuilder

    }

    export = WorkTreeCreator
}

