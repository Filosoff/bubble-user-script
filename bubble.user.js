// ==UserScript==
// @name         Bubble prepare
// @version      0.9
// @description  Bubble prepare
// @author       Flatformer
// @updateURL    https://github.com/Filosoff/bubble-user-script/raw/master/bubble.user.js
// @downloadURL  https://github.com/Filosoff/bubble-user-script/raw/master/bubble.user.js
// @match        https://pikabu.ru/add
// ==/UserScript==

// class const
const bubbleCls = "bubble-intruder";
const logCls = "bubble-csv-log";
// cssClass
const btnsWrapperClass = ".sidebar__inner";
const csvLogClass = `.${logCls}`;
// xPAth
const editorXPath = "//*[@id=\"pkb-story-edit-page\"]/div/div[1]/div[1]/div[3]/div/div/div";

const getElementByXpath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

const createEl = (tagName, classNames = [], attr = {}, appendTo) => {
  const el = document.createElement(tagName);
  classNames.forEach(cls => {
    el.classList.add(cls)
  });
  Object.keys(attr).forEach(a => {
    el[a] = attr[a]
  });
  if (appendTo) {
    if (typeof appendTo === 'string') {
      const parent = document.querySelector(appendTo);
      parent.appendChild(el);
    } else {
      try {
        appendTo.appendChild(el);
      } catch (e) {
        console.error(`cant append to ${appendTo}`);
      }
    }
  }
  return el;
}

const addGlobalStyle = (css) => createEl('style', [], {
  type: 'text/css',
  innerHTML: css.replace(/;/g, ' !important;')
}, 'head');

const addToCsvLog = content => document.querySelector(csvLogClass).innerHTML += content;

const pushTextToEditor = content => {
  const editor = getElementByXpath(editorXPath);
  const blocks = editor.querySelector('p');
  if (blocks) {
    blocks.innerHTML = content;
  }
}

const uploadHandler = result => {
  addToCsvLog(`<p>Успех!</p>`);
  addToCsvLog(`<p>Новостей добавлено: ${result.data.length}</p>`);

  let content = "";
  result.data.forEach(row => {
    const url = row.length >= 2 ? row[2] : null;
    const time = row.length >= 0 ? row[0] : null;
    const text = row.length >= 1 ? row[1] : null;

    if (url && time) {
      content += `<p><a href="${url}">${time}</a> ${text || "нет новости"}</p><br/><br/>`;
    } else {
      content += `<p>${text || "нет новости"}</p><br/><br/>`;
    }
  });

  pushTextToEditor(content);
}

const onCsvUpload = e => {
  const file = e.target.files[0];
  if (file) {

    Papa.parse(file, {
      delimiter: ";",
      skipEmptyLines: true,
      complete: uploadHandler,
      error: (error) => {
        addToCsvLog(`Ошибка загрузки файла: ${error}`);
      }
    });
  }
}

const updateEditor = () => {
  const wrapper = document.querySelector(btnsWrapperClass);

  const csvLog = createEl('section', [bubbleCls, 'bubble-csv-log']);
  wrapper.parentNode.insertBefore(csvLog, wrapper.nextSibling);
  createEl('h3', [], {innerHTML: 'Пузырьковый журнал'}, csvLog);
  createEl('p', [], {innerHTML: 'Жду загрузки файла...'}, csvLog);

  const btns = createEl('section', [bubbleCls, 'bubble-buttons']);
  wrapper.parentNode.insertBefore(btns, wrapper.nextSibling);
  createEl('h3', [], {innerHTML: 'Загрузить пузырь'}, btns);
  createEl('input', [], {type: 'file', onchange: onCsvUpload}, btns);

}

const setup = () => {
  const script = document.createElement('script');
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js";
  document.querySelector('body').appendChild(script);
  addGlobalStyle('.bubble-intruder h3 { padding-bottom: 4px; border-bottom: 1px solid #333; margin-bottom: 12px; font-weight: 400; margin-top: 12px; }');
  addGlobalStyle('.bubble-intruder label input { margin-right: 4px; }');

  updateEditor();
}

setTimeout(setup, 1000);