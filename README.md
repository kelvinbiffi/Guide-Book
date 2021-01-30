# Guide Book

The **Guide Book** Generator for Style Guides.

----------------------------

## How it works:

The **Guide Book** goal is to look for the predefined pattern, [showing here](#how-to-use), and use it to generate an HTML page showing the Categories, Elements, and Modules of your Style Guide.

----------------------------

## How to use

First of all on your **Source Files** (SCSS/SASS/STYLUS/LESS) use the below pattern:
```
/*GUIDE

<CATEGORY>|<SECTION>

<HTML>

*/
```

### Where
| PLACEBOLDER         | Description                            |
|---------------------|----------------------------------------|
| `<CATEGORY>`        | Category of the Example                |
| `<SECTION>`         | Sections of the example                |
| `<HTML>`            | Some HTML Elements                     |

----------------------------

## How to Setup

To setup the **Guide Book** create a JS file at main folder of your project, using as reference the below code:

```
const GuideBook = require('@kelvinbiffi/guide-book');

const settings = {
  style: <BUILT_CSS_FILE>,
  source: <SOURCE_FOLDER>,
  output: <OUTPUT>,
}

const guideBook = new GuideBook();
guideBook.generate(settings);
```

### Where
| PLACEBOLDER         | Type            | Description                                                |   Example                 |
|---------------------|-----------------|------------------------------------------------------------|---------------------------|
| `<BUILT_CSS_FILE>`  | String          | The built style css file                                   | 'build/style.min.css'     |
| `<SOURCE_FOLDER>`   | String          | The Source Files (SCSS,STYLUS,LESS,...)                    | 'source/css'              |
| `<OUTPUT>`          | String          | The **folder** or **file** to generate the **Guide Book**  | 'guidebook/guide.html'    |

----------------------------

## Examples

To see examples access this Repository [Guide-Book-Example](https://github.com/kelvinbiffi/Guide-Book-Example)

----------------------------

## Requirements Version

- Node `v12.18.1`
- NPM  `6.14.5`

----------------------------

## Dependences

- [PrismJS](https://prismjs.com/)