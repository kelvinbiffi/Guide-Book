const path = require('path');
const fs = require('fs');

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
            const guideBookStructure = this.generateHTMLStructure(categories);
            this.createGuideBookFile(settings.output, settings.charset, guideBookStructure, settings.style);
        }
    }

    /**
     * 
     * @param {Strong} output Output Directory/File
     * @param {String} charset Charset Default UTF-8
     * @param {String} structure Guide Book Structure
     * @param {String} style Built style path
     */
    createGuideBookFile (output, charset, structure, style) {
        let outputPath = path.resolve(output);
        if (outputPath.indexOf('.html') === -1) {
            outputPath += '\\guidebook.html'
        }

        this.checkFoldersExistence(outputPath);

        let styleContent = '';
        const stylepath = style ? path.resolve(style) : false;
        if (stylepath && fs.existsSync(stylepath)) {
            styleContent = fs.readFileSync(stylepath, charset);
        } else {
            throw new Error('Invalid: Style file looks like do not exists');
        }

        let base = fs.readFileSync(__dirname + '\\base\\index.html', charset);
        base = base.toString();
        base = base.replace('[[CSS]]', `<style>${styleContent}</style>`);
        base = base.replace('[[HEADER]]', structure.header);
        base = base.replace('[[BODY]]', structure.body);
        
        fs.writeFileSync(outputPath, base);
        console.log('### Your Guide Book File HTML just been generated! =D ###');
    }

    checkFoldersExistence (outputPath) {
        const outputArray = outputPath.split('\\');
        outputArray.pop();
        fs.mkdirSync(outputArray.join('\\'), { recursive: true });
    }

    /**
     * Generate Guide Book Structure File
     * 
     * @param {Array} categories
     * 
     * @return {Object}
     */
    generateHTMLStructure (categories) {
        const structure = {
            header: '',
            body: '',
        }
        Object.keys(categories).forEach((category) => {
            this.addHTMLItem(structure, category, categories[category]);
        });
        return structure;
    }

    addHTMLItem (structure, category, sections) {
        const categorySlug = this.generateSlug(category);
        structure.header += `
            <li class="category-item">
                <a class="category-item__link" href="#${categorySlug}">${category}</a>
            </li>
        `;


        structure.body += `
            <section id="${categorySlug}" class="category-section">
                <h2>${category}</h2>
        `;
        sections.forEach((section) => {
            const sectionSlug = this.generateSlug(section.session);
            structure.body += `
                <article class="category-section__example" id="${sectionSlug}">
                    <h3>${section.session}</h3>
                    <pre class="exemplo__code line-numbers">
                        ...
                        <code class="language-markup">
                        ${section.example}
                        </code>
                        ...
                    </pre>
                </article>
            `;
        });
        structure.body += `
            </section>
        `;
    }

    generateSlug (text) {
        let slug = text.normalize("NFD");
        slug = slug.replace(/[\u0300-\u036f]/g, "");
        slug = slug.replace(/ /g,'-');
        return slug.toLowerCase();
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

module.exports = GuideBook;