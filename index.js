const path = require('path');
const fs = require('fs');

/**
 * Guide Book Output Formats Type
 */
const GuideBookType = {
    HTML: 'HTML',
    MARKDOWN: 'MARKDOWN',
}

/**
 * 
 * Guide Book Generator Class
 * 
 */
class GuideBook {

    /**
     * Constructor Guide Book Class
     */
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
            this.getExamplesFromSource(settings.source, settings.charset);
            const categories = this.manageExamplesByCategories();
            const guideBookStructure = this.generateGuideBookStructure(settings.type, categories);
            this.createGuideBookFile(settings.output, settings.charset, settings.type, guideBookStructure);
        }
    }

    /**
     * 
     * @param {Strong} output Output Directory/File
     * @param {String} charset Charset Default UTF-8
     * @param {GuideBookType} type
     * @param {String} structure Guide Book Structure
     */
    createGuideBookFile (output, charset, type, structure) {
        console.log(output, charset, type, structure)
    }

    /**
     * Generate Guide Book Structure File
     * 
     * @param {GuideBookType} type
     * @param {Array} categories
     * 
     * @return {String}
     */
    generateGuideBookStructure (type, categories) {
        let structure;
        if (type === GuideBookType.HTML) {
            structure = this.generateHTMLStructure(categories);
        } else if (type === GuideBookType.MARKDOWN) {
            structure = this.generateMARKDOWNStructure(categories);
        }
        return structure;
    }

    generateHTMLStructure (categories) {
        let structure = '';
        Object.keys(categories).forEach((c) => {
            console.log(c, categories[c], 'H');
        });
    }

    generateMARKDOWNStructure (categories) {
        let structure = '';
        Object.keys(categories).forEach((c) => {
            console.log(c, categories[c], 'H');
        });
    }

    manageExamplesByCategories () {
        const categories = {};
        this.examples.forEach((e) => {
            if (!categories.hasOwnProperty(e.category)) {
                categories[e.category] = [];
            }
            const { session, example } = e;
            const ex = 
            categories[e.category].push({ session, example });
        });
        return categories;
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

        if (settings.type && !GuideBookType.hasOwnProperty(settings.type)) {
            throw new Error('Invalid: settings properties Guide Book Type, see documentation to know more.');
        } else {
            console.log(GuideBookType, 'GuideBookType');
            settings.type = GuideBookType.HTML;
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
        let exampleInfo = example.split('\r\n')
        exampleInfo = this.removeEmptyLines(exampleInfo);
        let categorySession = exampleInfo.shift();
        categorySession = categorySession.split('|');
        if (categorySession.length !== 2) {
            throw new Error(`Invalid: Settings ${exampleInfo[0]} do not match pattern CATEGORY|SESSION. See Documentation.`);
        }

        return {
            category: categorySession[0],
            session: categorySession[1],
            example: exampleInfo.join('\r\n')
        };
    }

    /**
     * Iterate array os example and remove empty lines
     * 
     * @param {Array} arrayLines LInes of a examples in array format
     * 
     * @return {Array}
     */
    removeEmptyLines (arrayLines) {
        const linesToReturn = [];
        arrayLines.forEach((l) => {
            if (l.replace(/ /g,'') !== '') {
                linesToReturn.push(l);
            }
        });
        return linesToReturn;
    }
}

module.exports = { GuideBookType, GuideBook };