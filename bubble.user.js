// ==UserScript==
// @name         Bubble prepare
// @version      0.2
// @description  Bubble prepare
// @author       Flatformer
// ==/UserScript==

// classes
const btnsWrapperClass = ".story-editor__blocks";
const addTextBtnClass = ".story-editor-add__button .button_success";
const textBlockClass = '.story-editor-block__content .input__box .input__input';

// content
const alternativesHTML = "<p>---- Альтернативные пузыри ----</p><p><a href=\"https://strana.today/news/395921-vojna-v-ukraine-18-ijunja-vse-novosti-svodka-video-i-foto.html\">Абсолютно \"альтернативный\" украинский обновляемый \"пузырь\" с ВПН.</a></p><p><a href=\"https://rus.lsm.lv/statja/novosti/mir/napadenie-rf-na-ukrainu-ubiti-i-raneni-bolee-900-detey.a462065/\">Прибалтийски-альтернативный информационный пузырёк, на русском, но с ВПН</a></p><p><a href=\"https://www.corriere.it/esteri/diretta-live/22_giugno_09/ucraina-russia-news-guerra-4fc62e68-e75a-11ec-bc81-fb93af2ab36c.shtml\">Итальянский информационный пузырь от Corriere della Sera без ВПН</a></p><p><a href=\"https://www.tagesspiegel.de/politik/krieg-in-der-ukraine-britischer-geheimdienst-beobachtet-verheerende-verluste-bei-russischen-offizieren/28063400.html\">Немецкий информационный пузырь от TagesSpiegel без ВПН</a></p>";
const resqueHTML = "<p>---- Телефоны МЧС ДНР для поиска эвакуированных родственников -----</p><p>+38 071-342-69-99; +38 062-342-69-99; +7 863-318-29-99</p><p><b><a href=\"https://vsednr.ru/prodolzhaet-rabotu-gor\">https://vsednr.ru/prodolzhaet-rabotu-gor</a></b></p>";
const thanksHTML = "<p>---- Благодарности -----</p><p>@Schastje, @ak747, @Albi2020</p>";
const disclaimerHTML = "<p><b>Мне нужна обратная связь, я всегда за комменты, правки, уточнения и особенно - наводки.</b></p><p><b>Спешу напомнить, что это НЕ обзор, НЕ аналитика, а просто тайминг новостей.</b></p>";
const mapsHTML = "<p>---- Карты ----</p><p><b>Спешу напомнить, что я не в курсе почему на конкретных картах обозначены те или иные позиции, условные знаки или цвета. С этим вопросом лучше обращаться на сайт - исходник или к нашим комментаторам.</b></p><p>1. Интерактивная альтернативная карта: <a href='https://liveuamap.com/ru'>https://liveuamap.com/ru</a></p><p>2. <a href='https://zahid.espreso.tv/karta-boyovikh-diy-v-ukraini-stanom-na-270222-1700'>Aльтернативная карта через ВПН</a></p><p>огромное спасибо @CherryPah и @Schastje за уточнение и обновление.</p><p>3. Интерактивная карта с обсуждением - <a href='https://lostarmour.ru/offtopic/map/'>https://lostarmour.ru/offtopic/map/</a></p><p>4. Прокремлевская карта от mash, с возможностью просмотра по датам <a href='https://opermap.mash.ru/'>https://opermap.mash.ru/</a></p><p>5. Еще одна альтернативная карта - <a href='https://deepstatemap.live'>https://deepstatemap.live</a></p><p>6. \'интерактивная\' обновляемая карта на <a href='https://www.youtube.com/c/balkanmaping/videos'>Ютубе</a></p><p>огромное спасибо @Golebiewski за наводку.</p>";

// utils
const createEl = (tagName, classNames = []) => {
    const el = document.createElement(tagName);
    classNames.forEach(cls => {
        el.classList.add(cls);
    });
    return el;
}

const addGlobalStyle = (css) => {
    const head = document.querySelector('head');
    const style = createEl('style');
    style.type = 'text/css';
    style.innerHTML = css.replace(/;/g, ' !important;');
    head.appendChild(style);
}

// Create editor buttons
const onCsvUpload = e => {
    const file = e.target.files[0];
    if (file) {
        const logEl = document.querySelector('.bubble-csv-log');
        Papa.parse(file, {
            complete: result => {
                if (result.data) {
                    document.querySelector(addTextBtnClass).click();
                    const blocks = document.querySelectorAll(textBlockClass);
                    if (blocks && blocks.length) {
                        // log
                        logEl.innerHTML += `Новостей добавлено: ${result.data.length}<br/><br/>`;
                        const stopWords = ['потери', 'составили', 'более', 'человек'];

                        let content = "---- Новости ----<br/>";
                        result.data.forEach(row => {
                            content += `<p><a href="${row[2]}">${row[0]}</a> ${row[1]}</p><br/>`;
                            let l = "";
                            stopWords.forEach(w => {
                                if (row[1].includes(w)) {
                                    l += `...содержит слово <b>${w}</b><br/>`;
                                }
                            });
                            if (l) {
                                logEl.innerHTML += `Новость от ${row[0]}...<br/>${l}<br/>`;
                            }
                        })
                        blocks[blocks.length-1].innerHTML = content;
                    }
                }
            },
            error: (error) => {
                logEl.innerHTML += `Ошибка загрузки файла: ${error}<br/>`;
            }
        });
    }
}

const updateEditor = () => {
    const wrapper = document.querySelector(btnsWrapperClass);
    // btns
    const btns = createEl('section', ['bubble-buttons']);
    wrapper.parentNode.insertBefore(btns, wrapper.nextSibling);

    const addContent = content => {
        document.querySelector(addTextBtnClass).click();
        const blocks = document.querySelectorAll(textBlockClass);
        if (blocks && blocks.length) {
            blocks[blocks.length-1].innerHTML = content;
        }
    }

    const addTitle = (text) => {
        const h = createEl('h3');
        h.innerHTML = text;
        btns.appendChild(h);
    }

    const addBtn = (name, handler) => {
        const btn = createEl('div', ['btn']);
        btn.innerHTML = name;
        btn.onclick = e => { e.stopPropagation(); handler() }
        btns.appendChild(btn);
    }


    addTitle('Блоки');
    addBtn('Disclaimer', () => addContent(disclaimerHTML));
    addBtn('Альтернативы', () => addContent(alternativesHTML));
    addBtn('МЧС ДНР', () => addContent(resqueHTML));
    addBtn('Благодарности', () => addContent(thanksHTML));
    addBtn('Карты', () => addContent(mapsHTML));

    // upload csv
    addTitle('CSV');
    const csv = createEl('input');
    csv.type = 'file';
    csv.onchange = onCsvUpload;
    btns.appendChild(csv);
    const log = createEl('div', ['bubble-csv-log']);
    btns.appendChild(log);
}

const setup = () => {
    // for some reason @require doesnt add the script
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js";
    document.querySelector('body').appendChild(script);
    // adding styles
    addGlobalStyle('.bubble-buttons { padding: 16px 24px; }');
    addGlobalStyle('.bubble-buttons .btn { display: inline-block; border: 1px solid #777; padding: 0 10px; cursor: pointer; margin: 0 4px 16px 0; }');
    addGlobalStyle('.bubble-buttons h3 { padding-bottom: 4px; border-bottom: 1px solid #333; margin-bottom: 12px; }');
    addGlobalStyle('.bubble-csv-log { margin-top: 8px; }');
    // adding buttons
    updateEditor();
}

setTimeout(setup, 1000);