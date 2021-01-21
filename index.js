const path = require('path');
const fs = require('fs');
//joining path of directory 

//passsing directoryPath and callback function
// fs.readdir(directoryPath, function (err, files) {
//     //handling error
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     } 
//     //listing all files using forEach
//     files.forEach(function (file) {
//         // Do whatever you want to do with the file
//         console.log(file); 
//     });
// });
/**
 * 
 * Guide Book Generator Class
 * 
 */
class GuideBook {

    constructor () {
        this.examples = [];
    }

    /**
     * Generate Guide Book
     * 
     * @param {Object} settings Object Settings {style, source, output}
     */
    generate (settings) {
        if (this.validateSettingsStructure(settings)) {
            const css = this.getStyleCSS(settings.style, settings.charset);
            const examples = this.getExamplesFromSource(settings.source, settings.charset);
            console.log(this.examples);
        }
    }

    /**
     * Validate Generate Guide Book Settings Structure
     * 
     * @param {Object} settings Object Settings {style, source, output}
     * 
     * @return {Boolean}
     */
    validateSettingsStructure (settings) {
        if (typeof settings !== 'object') {
            throw new Error('Invalid: settings is not an object');
        }

        if (typeof settings.style !== 'string'
        || typeof settings.source !== 'string'
        || typeof settings.output !== 'string') {
            throw new Error('Invalid: settings properties types, see documentation to know more.');
        }

        if (!settings.charset) {
            settings.charset = 'utf8';
        }

        return true;
    }

    /**
     * Get the String CSS of Built Style File
     * 
     * @param {String} style Style CSS Path
     * @param {String} charset Charset Default UTF8
     * 
     * @return {String}
     */
    getStyleCSS (style, charset) {
        const filePath = path.resolve(style);
        if (!fs.existsSync(filePath)) {
            throw new Error('Invalid: Built Style File Do Not Exists');
        }

        let css = fs.readFileSync(filePath, charset);
        css = css.toString();
        return css;
    }

    isDirectory (path) {
        return fs.lstatSync(path).isDirectory();
    }

    /**
     * Check if is a directory or files and start get the examples
     * 
     * @param {String} source Source Style Path
     * @param {String} charset Charset Default UTF8
     * 
     * @return {Array}
     */
    getExamplesFromSource (source, charset) {
        const sourcePath = path.resolve(source);
        if (!fs.existsSync(sourcePath)) {
            throw new Error('Invalid: Source Folder or File Do Not Exists');
        }
        
        if (this.isDirectory(sourcePath)) {
            console.log('is a directory');
            this.iterateSourceFolders(sourcePath, charset);
        } else {
            this.getExampleFromSourceFile(sourcePath, charset);
        }
    }


    iterateSourceFolders (sourcePath, charset) {
        const filenames = fs.readdirSync(sourcePath); 
        filenames.forEach(file => {
            const filePath = sourcePath + '\\' + file;
            if (this.isDirectory(filePath)) {
                this.iterateSourceFolders (filePath, charset);
            } else {
                this.getExampleFromSourceFile(filePath, charset);
            }
        });
    }

    /**
     * Get the examples inside Files Source
     * 
     * @param {String} sourcePath Source Style File Path
     * @param {String} charset Charset Default UTF8
     * 
     * @return {Array}
     */
    getExampleFromSourceFile (sourcePath, charset) {
        let sourceFile = fs.readFileSync(sourcePath, charset);
        sourceFile = sourceFile.toString();
        this.extractExamplesFromFile(sourceFile);
    }

    extractExamplesFromFile (File) {
        if (File.indexOf('/*GUIDE') === -1) {
            return;
        }
        let examples = File.split('/*GUIDE');
        examples = examples
            .map((i) => (i.indexOf('*/') > -1 ? i.split('*/')[0] : null))
            .filter((i) => i)
            .map((e) => this.refineExample(e));
        this.examples = this.examples.concat(examples);
    }

    /**
     * Refine the rough example and convert into a object Example
     * 
     * @param {Array} example rough example
     */
    refineExample(example) {
        const exampleInfo = example.split('\r\n')
        if (exampleInfo[0].trim() === '') {
            exampleInfo.shift();
        }
        if (exampleInfo[exampleInfo.length - 1].trim() === '') {
            exampleInfo.pop();
        }
        const categorySession = exampleInfo[0].split('|');
        if (categorySession.length !== 2) {
            throw new Error(`Invalid: Settings ${exampleInfo[0]} do not match pattern CATEGORY|SESSION. See Documentation.`);
        }

        exampleInfo.shift();
        return {
            module: categorySession[0],
            session: categorySession[1],
            example: exampleInfo.join('\r\n')
        };
    }
}

module.exports = { GuideBook };