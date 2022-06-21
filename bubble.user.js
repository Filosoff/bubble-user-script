// ==UserScript==
// @name         Bubble prepare
// @version      0.7
// @description  Bubble prepare
// @author       Flatformer
// @updateURL    https://github.com/Filosoff/bubble-user-script/raw/master/bubble.user.js
// @downloadURL  https://github.com/Filosoff/bubble-user-script/raw/master/bubble.user.js
// @match        https://pikabu.ru/add
// ==/UserScript==

// classes
const btnsWrapperClass = ".story-editor__blocks";
const addTextBtnClass = ".story-editor-add__button .button_success";
const textBlockClass = '.story-editor-block__content .input__box .input__input';
const bubbleButtonsClass = ".bubble-buttons";
const bubbleLeftSideClass = ".bubble-buttons-left";
const bubbleRightSideClass = ".bubble-buttons-right";
const csvLogClass = ".bubble-csv-log";

// static
const settings = [
  {
    name: 'splitToBlocks',
    label: 'Разбить на блоки',
  },
];

const stopWords = ['потери', 'составили', 'более', 'человек'];

// content
const alternativesHTML = "<p><a href=\"https://strana.today/news/395921-vojna-v-ukraine-18-ijunja-vse-novosti-svodka-video-i-foto.html\">Абсолютно \"альтернативный\" украинский обновляемый \"пузырь\" с ВПН.</a></p><p><a href=\"https://rus.lsm.lv/statja/novosti/mir/napadenie-rf-na-ukrainu-ubiti-i-raneni-bolee-900-detey.a462065/\">Прибалтийски-альтернативный информационный пузырёк, на русском, но с ВПН</a></p><p><a href=\"https://www.corriere.it/esteri/diretta-live/22_giugno_09/ucraina-russia-news-guerra-4fc62e68-e75a-11ec-bc81-fb93af2ab36c.shtml\">Итальянский информационный пузырь от Corriere della Sera без ВПН</a></p><p><a href=\"https://www.tagesspiegel.de/politik/krieg-in-der-ukraine-britischer-geheimdienst-beobachtet-verheerende-verluste-bei-russischen-offizieren/28063400.html\">Немецкий информационный пузырь от TagesSpiegel без ВПН</a></p><p>ОГРОМНОЕ СПАСИБО @Schastje, @ak747 и @Albi2020</p><p>Спасибо @Falkosh за идею по отжиму воды</p><p>Спасибо @Flatformer за техническую помощь</p>";
const resqueHTML = "<p><b>============================</b></p><p><b>С разрешения модераторов:</b></p><p><b>телефоны МЧС ДНР для поиска эвакуированных родственников</b></p><p><b>+38 071-342-69-99; +38 062-342-69-99; +7 863-318-29-99.</b></p><a href='https://vsednr.ru/prodolzhaet-rabotu-gor'>https://vsednr.ru/prodolzhaet-rabotu-gor</a><p><b>============================</b></p>";
const disclaimerHTML = "<p><b>Мне нужна обратная связь, я всегда за комменты, правки, уточнения и особенно - наводки.</b></p><p><b>Спешу напомнить, что это НЕ обзор, НЕ аналитика, а просто тайминг новостей.</b></p><p>Надеюсь, мне не придется опять вытаскивать дисклеймеры в пост.</p>";
const mapsHTML = "<p>КАРТЫ:</p><p><b>Спешу напомнить, что я не в курсе почему на конкретных картах обозначены те или иные позиции, условные знаки или цвета. С этим вопросом лучше обращаться на сайт - исходник или к нашим комментаторам.</b></p><p>1. Интерактивная альтернативная карта: <a href='https://liveuamap.com/ru'>https://liveuamap.com/ru</a></p><p>2. <a href='https://zahid.espreso.tv/karta-boyovikh-diy-v-ukraini-stanom-na-270222-1700'>Aльтернативная карта через ВПН</a></p><p>огромное спасибо @CherryPah и @Schastje за уточнение и обновление.</p><p>3. Интерактивная карта с обсуждением - <a href='https://lostarmour.ru/offtopic/map/'>https://lostarmour.ru/offtopic/map/</a></p><p>4. Прокремлевская карта от mash, с возможностью просмотра по датам <a href='https://opermap.mash.ru/'>https://opermap.mash.ru/</a></p><p>5. Еще одна альтернативная карта - <a href='https://deepstatemap.live'>https://deepstatemap.live</a></p><p>6. \'интерактивная\' обновляемая карта на <a href='https://www.youtube.com/c/balkanmaping/videos'>Ютубе</a></p><p>огромное спасибо @Golebiewski за наводку.</p>";
const newsSeparator = "<p>------------------------------------------------------------------</p>";

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

const addToCsvLog = content => {
  const logEl = document.querySelector(csvLogClass);
  logEl.innerHTML += content;
}

const addTextBlock = content => {
  document.querySelector(addTextBtnClass).click();
  const blocks = document.querySelectorAll(textBlockClass);
  if (blocks && blocks.length) {
    blocks[blocks.length - 1].innerHTML = content;
  }
}

const textButtonHandler = content => e => {
  e.stopPropagation();
  addTextBlock(content);
}

const createSettings = (name, label) => {
  const labelEl = createEl('label', [], {}, bubbleRightSideClass);
  const chk = createEl('input', [], {type: 'checkbox'}, labelEl);
  chk.dataset.name = name;
  labelEl.innerHTML += label;
}

const getSettingsValue = name => {
  const el = document.querySelector(`input[data-name=${name}]`);
  return !el ? false : el.checked;
}

const uploadHandler = result => {
  addToCsvLog(`<p>Успех!</p>`);
  addToCsvLog(`<p>Новостей добавлено: ${result.data.length}</p>`);

  const split = getSettingsValue('splitToBlocks');
  let content = newsSeparator;
  result.data.forEach(row => {
    const url = row.length >= 2 ? row[2] : null;
    const time = row.length >= 0 ? row[0] : null;
    const text = row.length >= 1 ? row[1] : null;

    if (url && time) {
      content += `<p><a href="${url}">${time}</a> ${text || "нет новости"}</p><br/>`;
    } else {
      content += `<p>${text || "нет новости"}</p><br/>`;
    }

    if (split) {
      addTextBlock(content);
      content = "";
    }
  });

  content += newsSeparator;
  addTextBlock(content);
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
  // main block
  const wrapper = document.querySelector(btnsWrapperClass);
  const btns = createEl('section', ['bubble-intruder', 'bubble-buttons']);
  const csvLog = createEl('section', ['bubble-intruder', 'bubble-csv-log']);
  wrapper.parentNode.insertBefore(csvLog, wrapper.nextSibling);
  wrapper.parentNode.insertBefore(btns, wrapper.nextSibling);
  // sides
  createEl('div', ['bubble-buttons-left'], {}, bubbleButtonsClass);
  createEl('div', ['bubble-buttons-right'], {}, bubbleButtonsClass);
  createEl('h3', [], {innerHTML: 'Шапка'}, bubbleLeftSideClass);
  createEl('h3', [], {innerHTML: 'CSV'}, bubbleRightSideClass);
  // buttons
  createEl('div', ['button', 'button_success'], {
    innerHTML: 'Disclaimer',
    onclick: textButtonHandler(disclaimerHTML)
  }, bubbleLeftSideClass)
  createEl('div', ['button', 'button_success'], {
    innerHTML: 'Альтернативы',
    onclick: textButtonHandler(alternativesHTML)
  }, bubbleLeftSideClass)
  createEl('div', ['button', 'button_success'], {
    innerHTML: 'МЧС ДНР',
    onclick: textButtonHandler(resqueHTML)
  }, bubbleLeftSideClass)
  createEl('h3', [], {innerHTML: 'Футер'}, bubbleLeftSideClass);
  createEl('div', ['button', 'button_success'], {
    innerHTML: 'Карты',
    onclick: textButtonHandler(mapsHTML)
  }, bubbleLeftSideClass)

  // CSV
  settings.forEach((set) => {
    createSettings(set.name, set.label);
  });

  createEl('input', [], {type: 'file', onchange: onCsvUpload}, bubbleRightSideClass);

  createEl('h3', [], {innerHTML: 'CSV отчет'}, csvLog);
  createEl('p', [], {innerHTML: 'Жду загрузки файла...'}, csvLog);

}

const setup = () => {
  // for some reason @require doesnt add the script
  const script = document.createElement('script');
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js";
  document.querySelector('body').appendChild(script);
  // adding styles
  addGlobalStyle('.bubble-buttons { display: flex; justify-content: space-between; }');
  addGlobalStyle('.bubble-intruder > div { width: 49% }');
  addGlobalStyle('.bubble-intruder .button { display: inline-block; margin-right: 6px; margin-bottom: 6px; width: 45%; }');
  addGlobalStyle('.bubble-intruder h3 { padding-bottom: 4px; border-bottom: 1px solid #333; margin-bottom: 12px; font-weight: 400; margin-top: 12px; }');
  addGlobalStyle('.bubble-intruder h3 { padding-bottom: 4px; border-bottom: 1px solid #333; margin-bottom: 12px; font-weight: 400; margin-top: 12px; }');
  addGlobalStyle('.bubble-intruder label { display: flex; align-items: center; margin-bottom: 6px; }');
  addGlobalStyle('.bubble-intruder label input { margin-right: 4px; }');
  // adding buttons
  updateEditor();
}

setTimeout(setup, 1000);