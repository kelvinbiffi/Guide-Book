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

    /**
     * Generate Guide Book
     * 
     * @param {Object} settings Object Settings {style, source, output}
     */
    generate (settings) {
        if (this.validateSettingsStructure(settings)) {
            const css = this.getStyleCSS(settings.style, settings.charset);
            const examples = this.getExamplesFromSource(settings.source, settings.charset);
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
            throw new Error('Invalid: Built Style File Not Exists');
        }

        let css = fs.readFileSync(filePath, charset);
        css = css.toString();
        return css;
    }

    /**
     * Get the examples inside Files Source
     * 
     * @param {String} source Source CSS Path
     * @param {String} charset Charset Default UTF8
     * 
     * @return {Array}
     */
    getExamplesFromSource (source, charset) {

    }
}

module.exports = { GuideBook };