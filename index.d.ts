

/**There is some default console commands: <br/>
* make structure - creates in dir path structure form input args <br/>
* Futhermore, you can launch the script in diffrent mods. Now available: <br/>
--test - it's print in the console all potential changes in your project, but doesn't touch it <br/>
--build - standard mod for changing your project. It's default mode <br/>
--safe - first of all programm show you future chages and request confirm of it
*/

declare module "WorkTreeCreator" {
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
         * @param file name of file of folder
         * */
        checkFileExistence(path: string, file: string): boolean
        /**
         * This method check existens ofr some some string in the file
         * @param path path to this file
         * @param value string or number, what can be checked in the file
         */
        checkContentExistenceInFile(path: string, value: string | number): boolean

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
        /**
         * This method allows to add new files and folder to your file strsucture
         * @param path - root point, where new file structure must be cerated
         * @param structure - object, in which all keys are represented as files and folders. To set nested folders, you should create a nested object. <br />
         * if you want to create file with some default content, you need to put string with with information to object key field
         *
         * @example  makeStructure(path), {
         * folder: {
         *  folder2: null,
         *  file.txt: 'Hello World',
         *  }
         * }
         */
        makeStructure(path: Formattedstring, structure: object): ActionBuilder
        /**
         * This method allow to delete file
         * @param path - path to file, what you should delete
         */
        deleteFile(path): ActionBuilder
        /**
         * This method allows to create new file
         * @param path - path to folder, where new file must be created
         * @param name = name of new file
         * @param data - file content
         */
        createFile(path: Formattedstring, name: Formattedstring, data: Formattedstring): ActionBuilder

    }
    /** Allows to add gap at the start or end of string */
    type Margins = Array<'up' | 'left' | 'down' | 'right'>

    class DataFormatter {
        /** This method alows to add new import state
         * @param type has 3 avaialabel values: certain(it's deafult value), all, reexport. Examples: </br>
         * @example all - 'import * as ' reexport - 'export {} from path' certain - 'import {} from path'
         * @param names - variables, what you want to import
         * @example appendToImport('certain', ['img'], './images')
         * @param path - path, where yoy want to import from
         */
        appendToImport(type: 'certain' | 'all' | 'reexport', names: Formattedstring[], path: Formattedstring, margins?: Margins) : DataFormatter
        /** This method allow to add some new code to block
         * @param blockName - name of block in code. It can be method, function, if-else statement
         * @param data - code, what you want to add
         * @param margins - margins for code
         * @param position available values: start and end. So you can insert new part of code to the start of block or end
         */
        appendToBlock(blockName: Formattedstring, data: Formattedstring, margins?: Margins, position?: 'start' | 'end'): DataFormatter
        /**
         * this method allow to add new data to export statement. If export hasn't been declared yet, so it creates new one and put data to it
         * @param data - data that you want to insert to export statement
         * @param margins - margins for code
         */
        appendToExport(data: Formattedstring, margins?: Margins): DataFormatter
        /**
         * This method allows to add new code to destructurisation statement in your code
         * @param objectName - name of object, what is used for destructurisation
         * @param data - data< what you want to insert into file
         * @param margins - margins for code
         * @param position - insertion position
         */
        appendToDestructing(objectName: Formattedstring, data: Formattedstring, margins?: Margins, position?: 'start' | 'end'): DataFormatter
        /**
         * This method allows to to insert data after some point in the file data
         * @param separator - text part, after which new data must be inserted
         * @param data - data to insert
         * @param margins - margins for code
         * @param tabs - if we want to add tab befor string manually, so w need to note, count of tabs. (Tab size is defined in config)
         */
        appendAfter(separator: Formattedstring, data: Formattedstring, margins?: Margins, tabs?: number): DataFormatter
        /**
         *  This method allows to to insert data before some point in the file data
         * @param separator - text part, before which new data must be inserted
         * @param data - data to insert
         * @param margins - margins for code
         * @param tabs - if we want to add tab befor string manually, so w need to note, count of tabs. (Tab size is defined in config)
         */
        appendBefore(separator: Formattedstring, data: Formattedstring, margins?: Margins, tabs?: number): DataFormatter
        /**
         * This method allows to insert new data to top of the file
         * @param data - data to insert
         * @param margins - margins for code
         */
        appendToTop(data: Formattedstring, margins?: Margins): DataFormatter
        /**
         * This method allows to insert new data to the end of the file
         * @param data - data to insert
         * @param margins - margins for code
         */
        appendToEnd(data: Formattedstring, margins?: Margins): DataFormatter
        /**
         * This method allows to add new item to object or array
         * @param type - array or object
         * @param objectName - name of object/arrya, where you want to add new item
         * @param data - new data
         * @param margins - margins for code
         * @param position - avaialable values: start, end and some index. So you can can add new item to the start of array/object or end or by certain index
         * @param separatorSymbol - you should define sybmol, that is used as items' separator in array/object. Available values: , ;. ; is used for TS interfaces
         */
        appendToArrayOrObject(type: 'object' | 'array', objectName: Formattedstring, data: Formattedstring, margins?: Margins, position?: number | 'start' | 'end', separatorSymbol?: ',' | ';'): DataFormatter
    }


    class MethodBuilder {
        /**
         * This method allows you to add to your config object, what you can operate with
         * @param name name of type
         * @param args variables, what user enter in console after type declaration
         * @param builder It's a callback, what gets TypeBuilder class as argument and returns it

         * @example addType('feature', ['name'], b => b.addAction(...))
         * */
        addType(name: string, args: string[], builder: (builder: TypeBuilder) => TypeBuilder): MethodBuilder
    }

    export = WorkTreeCreator
}
