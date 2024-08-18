export const $$ = (selector) => document.querySelectorAll(selector);

// add a proxy to $ that captures function calls and has a getter for ids:
export const $ = new Proxy(function(){}, {
  get: (target, prop) => {
    if(/^[a-zA-Z0-9]+$/.test(prop)) {
      return document.querySelector(`#${prop}`);
    }
  },
  apply: (target, thisArg, args) => {
    return document.querySelector(args[0]);
  }
});

export const showEl = (el) => {
  if(el.style.display !== 'none') return;
  el.style.display = el.dataset.originalDisplayValue || '';
};
export const hideEl = (el) => {
  if(el.style.display === 'none') return;
  el.dataset.originalDisplayValue = el.style.display;
  el.style.display = 'none';
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function prompt2(specs, opts={}) {

  if(!opts.backgroundColor) opts.backgroundColor = prompt2.defaults.backgroundColor ?? (getComputedStyle(document.body).getPropertyValue('background-color')==="rgba(0, 0, 0, 0)" ? "#e8e8e8" : getComputedStyle(document.body).getPropertyValue('background-color'));
  if(!opts.borderColor) opts.borderColor = prompt2.defaults.borderColor ?? "#eaeaea";
  if(!opts.borderRadius) opts.borderRadius = prompt2.defaults.borderRadius ?? "3px";

  let ctn = document.createElement("div");
  let sections = "";
  let structuredSectionsI = 0;
  let i = 0;
  for(let [key, spec] of Object.entries(specs)) {
    if(spec.type == "select") {
      sections += `
        <section class="structuredInputSection" data-is-hidden-extra="${spec.hidden === true ? "yes" : "no"}" style="${spec.hidden === true ? "display:none" : ""};">
          <div class="sectionLabel" style="${structuredSectionsI === 0 ? "margin-top:0;" : ""}">${spec.label}${spec.infoTooltip ? ` <span title="${sanitizeHtml(spec.infoTooltip)}" style="cursor:pointer;" onclick="alert(this.title)">ℹ️</span>` : ""}</div>
          <div style="display:flex;">
            <div style="flex-grow:1;">
              <select data-spec-key="${sanitizeHtml(key)}" value="${sanitizeHtml(spec.defaultValue)}" ${spec.disabled === true ? "disabled" : ""} style="width:100%;height:100%; padding:0.25rem;">${spec.options.map(o => `<option value="${sanitizeHtml(o.value)}" ${o.value === spec.defaultValue ? "selected" :""}>${sanitizeHtml(o.content) || sanitizeHtml(o.value)}</option>`).join("")}</select>
            </div>
          </div>
        </section>`;
      structuredSectionsI++;
    } else if(spec.type == "textLine") {
      sections += `
        <section class="structuredInputSection" data-is-hidden-extra="${spec.hidden === true ? "yes" : "no"}" style="${spec.hidden === true ? "display:none" : ""};">
          <div class="sectionLabel" style="${structuredSectionsI === 0 ? "margin-top:0;" : ""}">${spec.label}${spec.infoTooltip ? ` <span title="${sanitizeHtml(spec.infoTooltip)}" style="cursor:pointer;" onclick="alert(this.title)">ℹ️</span>` : ""}</div>
          <div style="display:flex;">
            <div style="flex-grow:1;">
              <input data-initial-focus="${spec.focus === true ? "yes" : "no"}" data-spec-key="${sanitizeHtml(key)}" ${spec.disabled === true ? "disabled" : ""} value="${sanitizeHtml(spec.defaultValue)}" style="width:100%;height:100%; border: 1px solid lightgrey; border-radius: 3px; padding: 0.25rem;" type="text" placeholder="${sanitizeHtml(spec.placeholder)}" ${spec.validationPattern ? `pattern="${sanitizeHtml(spec.validationPattern)}"` : ""}>
            </div>
          </div>
        </section>`;
      structuredSectionsI++;
    } else if(spec.type == "text") {
      sections += `
        <section class="structuredInputSection" data-is-hidden-extra="${spec.hidden === true ? "yes" : "no"}" style="${spec.hidden === true ? "display:none" : ""};">
          <div class="sectionLabel" style="${structuredSectionsI === 0 ? "margin-top:0;" : ""}">${spec.label}${spec.infoTooltip ? ` <span title="${sanitizeHtml(spec.infoTooltip)}" style="cursor:pointer;" onclick="alert(this.title)">ℹ️</span>` : ""}</div>
          <div style="display:flex;">
            <div style="flex-grow:1;">
              <textarea data-initial-focus="${spec.focus === true ? "yes" : "no"}" data-spec-key="${sanitizeHtml(key)}" ${spec.height === "fit-content" ? `data-height="fit-content"` : ``} ${spec.disabled === true ? "disabled" : ""} style="width:100%; ${spec.height === "fit-content" ? "" : `height:${sanitizeHtml(spec.height)}`}; min-height:${spec.minHeight ?? "4rem"}; max-height:${spec.maxHeight ?? "50vh"}; border: 1px solid lightgrey; border-radius: 3px; padding:0.25rem; ${spec.cssText || ""};" type="text" placeholder="${sanitizeHtml(spec.placeholder)}">${sanitizeHtml(spec.defaultValue)}</textarea>
            </div>
          </div>
        </section>`;
      structuredSectionsI++;
    } else if(spec.type == "buttons") {
      sections += `
        <section data-spec-key="${sanitizeHtml(key)}" class="structuredInputSection" data-is-hidden-extra="${spec.hidden === true ? "yes" : "no"}" style="${spec.hidden === true ? "display:none" : ""};">
          <div class="sectionLabel" style="${structuredSectionsI === 0 ? "margin-top:0;" : ""}">${spec.label ?? ""}${spec.infoTooltip ? ` <span title="${sanitizeHtml(spec.infoTooltip)}" style="cursor:pointer;" onclick="alert(this.title)">ℹ️</span>` : ""}</div>
          <div style="display:flex;">
            <div style="flex-grow:1;">
              ${spec.buttons.map(b => `<button ${b.disabled === true ? "disabled" : ""} style="width:100%; border: 1px solid lightgrey; border-radius: 3px; padding:0.25rem; ${b.cssText || ""};">${b.text}</button>`).join(" ")}
            </div>
          </div>
        </section>`;
      structuredSectionsI++;
    } else if(spec.type == "none") {
      sections += `
        <section data-spec-key="${sanitizeHtml(key)}" data-is-hidden-extra="${spec.hidden === true ? "yes" : "no"}" data-requires-element-insert="${typeof spec.html === "string" ? "no" : "yes"}" style="${spec.hidden === true ? "display:none" : ""};">
          ${typeof spec.html === "string" ? spec.html : ""}
        </section>`;
    }
    i++;
  }
  ctn.innerHTML = `
    <div class="promptModalInnerContainer" style="background:rgba(0,0,0,0.2); position:fixed; top:0; left:0; right:0; bottom:0; z-index:9999999; display:flex; justify-content:center; color:inherit; font:inherit; padding:0.5rem;">
      <div style="width:600px; background:${sanitizeHtml(opts.backgroundColor)}; height: min-content; padding:1rem; border:1px solid ${opts.borderColor}; border-radius:${opts.borderRadius}; box-shadow: 0px 1px 10px 3px rgb(130 130 130 / 24%); max-height: calc(100% - 1rem);display: flex; flex-direction: column;">
        <div class="sectionsContainer" style="overflow:auto;">
          ${sections}
          ${Object.values(specs).find(s => s.hidden === true) ? `
          <div style="text-align:center; margin-top:1rem; display:flex; justify-content:center;">
            <button class="showHidden" style="padding: 0.25rem;">${opts.showHiddenInputsText || "Show hidden inputs"}</button>
          </div>
          ` : ""}
        </div>
        <div style="text-align:center; margin-top:1rem; ${opts.cancelButtonText === null ? "" : `display:flex; justify-content:space-between;`}">
          ${opts.cancelButtonText === null ? "" : `<button class="cancel" style="padding: 0.25rem;">${opts.cancelButtonText ?? "cancel"}</button>`}
          <button class="submit" style="padding: 0.25rem;">${opts.submitButtonText || "submit"}</button>
        </div>
      </div>
      <style>
        .promptModalInnerContainer .sectionsContainer > section .sectionLabel {
          margin:0.125rem 0;
          margin-top: 1rem;
          font-size:85%;
        }
        .promptModalInnerContainer .sectionsContainer input:invalid {
          background-color: lightpink;
        }
        .promptModalInnerContainer .sectionsContainer {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .promptModalInnerContainer .sectionsContainer::-webkit-scrollbar { 
          display: none;  /* Safari and Chrome */
        }
        .promptModalInnerContainer .sectionsContainer.scrollFade {
          padding-bottom: 30px;
          -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 30px), #ffffff00 100%);
          mask-image: linear-gradient(to bottom, black calc(100% - 30px), #ffffff00 100%);
        }
        .promptModalInnerContainer * {
          box-sizing: border-box;
        }
      </style>
    </div>
  `;
  document.body.appendChild(ctn);
  
  function updateFitHeights() { // settimeout to ensure rendered
    ctn.querySelectorAll("textarea[data-height=fit-content]").forEach(el => {
      let minHeight = el.offsetHeight; // textareas will always have min-height set, so we can use that via offsetHeight
      el.style.height = Math.max(minHeight, (el.scrollHeight+10)) + "px";
    });
  }

  setTimeout(updateFitHeights, 5);

  if(ctn.querySelector("button.showHidden")) {
    ctn.querySelector("button.showHidden").onclick = () => {
      ctn.querySelectorAll('.sectionsContainer [data-is-hidden-extra=yes]').forEach(el => {
        el.style.display='';
        el.dataset.isHiddenExtra = "no";
      });
      ctn.querySelector("button.showHidden").remove();
      updateFitHeights();
      updateInputVisibilies();
    };
  }

  // insert non-string HTML elements for type==html specs
  let elementObjects = Object.values(specs).filter(s => s.html && typeof s.html !== "string").map(s => s.html);
  ctn.querySelectorAll('.sectionsContainer [data-requires-element-insert=yes]').forEach((el, i) => {
    el.append(elementObjects[i]);
  });

  // add onclick handlers for type==button specs
  let buttonSpecKeys = Object.entries(specs).filter(([key, spec]) => spec.type === "buttons").map(([key, spec]) => key);
  for(let key of buttonSpecKeys) {
    ctn.querySelectorAll(`.sectionsContainer [data-spec-key=${key}]`).forEach(el => {
      let buttonEls = [...el.querySelectorAll("button")];
      for(let i = 0; i < buttonEls.length; i++) {
        buttonEls[i].onclick = specs[key].buttons[i].onClick;
      }
    });
  }

  setTimeout(() => {
    // add scrollFade if sectionsContainer has scroll
    let sectionsContainerEl = ctn.querySelector(".promptModalInnerContainer .sectionsContainer");
    if(sectionsContainerEl.scrollHeight > sectionsContainerEl.offsetHeight) {
      sectionsContainerEl.classList.add("scrollFade");
    }
    // focus
    let focusEl = ctn.querySelector(".promptModalInnerContainer .sectionsContainer [data-initial-focus=yes]");
    if(focusEl) {
      focusEl.focus();
      focusEl.selectionStart = focusEl.value.length;
    }
  }, 5);

  // a spec can have a `show` function which determines whether it's shown based on the values of the other inputs
  function updateInputVisibilies() {
    const values = getAllValues();
    for(const el of [...ctn.querySelectorAll("[data-spec-key]")]) {
      const showFn = specs[el.dataset.specKey].show;
      if(!showFn) continue;
      if(showFn(values)) {
        el.closest('section').style.display = "";
      } else {
        el.closest('section').style.display = "none";
      }

      // the "show advanced" hidden-ness overrides the show() function
      if(el.closest("section").dataset.isHiddenExtra === "yes") {
        el.closest("section").style.display = "none";
      }
    }
  }
  updateInputVisibilies();
  for(const el of [...ctn.querySelectorAll("[data-spec-key]")]) {
    el.addEventListener("input", updateInputVisibilies);
  }

  let promptResolver;

  if(opts.controls) {
    // add a proxy to the controls object so that we can read and write spec values from the outside
    opts.controls.data = new Proxy({}, {
      set: function(obj, prop, value) {
        let el = ctn.querySelector(`[data-spec-key=${prop}]`);
        if(!el) return true;
        el.value = value;
        updateInputVisibilies();
        return true;
      },
      get: function(obj, prop) {
        let el = ctn.querySelector(`[data-spec-key=${prop}]`);
        if(!el) return undefined;
        return el.value;
      }
    });
    opts.controls.submit = function() {
      ctn.querySelector("button.submit").click();
    };
    opts.controls.cancel = function() {
      promptResolver(null);
    };
  }

  function getAllValues() {
    let values = {};
    for(let el of [...ctn.querySelectorAll("[data-spec-key]")]) {
      if(el.tagName === "INPUT") {
        if(el.type == "file") {
          values[el.dataset.specKey] = el.files;
        } else {
          values[el.dataset.specKey] = el.value;
        }
      } else if(el.tagName === "TEXTAREA") {
        values[el.dataset.specKey] = el.value;
      } else if(el.tagName === "SELECT") {
        values[el.dataset.specKey] = el.value;
      }
    }
    return values;
  }

  let values = await new Promise((resolve) => {
    promptResolver = resolve;
    ctn.querySelector("button.submit").onclick = () => {
      let values = getAllValues();
      resolve(values);
    };
    if(ctn.querySelector("button.cancel")) {
      ctn.querySelector("button.cancel").onclick = () => {
        resolve(null);
      };
    }
  });
  ctn.remove();
  return values;
}
prompt2.defaults = {};


export function createFloatingWindow(opts={}) {

  if(!opts.backgroundColor) opts.backgroundColor = createFloatingWindow.defaults.backgroundColor ?? getComputedStyle(document.body).getPropertyValue('background-color');
  if(!opts.borderColor) opts.borderColor = createFloatingWindow.defaults.borderColor ?? "#eaeaea";
  if(!opts.borderRadius) opts.borderRadius = createFloatingWindow.defaults.borderRadius ?? "3px";
  if(!opts.initialWidth) opts.initialWidth = createFloatingWindow.defaults.initialWidth ?? 500;
  if(!opts.initialHeight) opts.initialHeight = createFloatingWindow.defaults.initialHeight ?? 300;

  // calculate centered `left` value based on initial width/height
  let left = Math.max(0, (window.innerWidth - opts.initialWidth) / 2);
  let top = 50;

  let tmp = document.createElement("div");
  tmp.innerHTML = `<div class="window" style="background-color:${opts.backgroundColor}; border:1px solid ${opts.borderColor}; border-radius:${opts.borderRadius}; width:${opts.initialWidth}px;height:${opts.initialHeight}px;z-index:999999999;position:fixed; top:${top}px; left:${left}px; box-shadow:0px 1px 10px 3px rgb(130 130 130 / 24%); display:flex; flex-direction:column;">
    <div class="header" style="user-select:none; cursor:move; border-bottom: 1px solid var(--border-color);display: flex;justify-content: space-between; padding:0.25rem;">
      <div>${opts.header || ""}</div>
      <div class="closeButton" style="min-width: 1.3rem; background: #9e9e9e; display: flex; justify-content: center; align-items: center; cursor: pointer; border-radius:${opts.borderRadius};">✖</div>
    </div>
    <div class="body" style="overflow:auto; width:100%; height:100%;">${opts.body || ""}</div>
    <div class="cornerResizeHandle" style="position:absolute; bottom:0; right:0; cursor:se-resize; user-select:none;width: 0; height: 0; border-style: solid; border-width: 0 0 10px 10px; border-color: transparent transparent #9e9e9e transparent;"></div>
  </div>
  `;
  let windowEl = tmp.firstElementChild;

  let headerEl = windowEl.querySelector(".header");
  let bodyEl = windowEl.querySelector(".body");
  let closeButtonEl = windowEl.querySelector(".closeButton");
  let cornerResizeHandle = windowEl.querySelector(".cornerResizeHandle");

  let mouseDown = false;
  let x = 0;
  let y = 0;
  headerEl.addEventListener("mousedown", (e) => {
    mouseDown = true;
    x = e.clientX;
    y = e.clientY;
  });
  document.documentElement.addEventListener("mouseup", () => {mouseDown=false; x=0; y=0;});
  document.documentElement.addEventListener('mouseleave', () => {mouseDown=false; x=0; y=0;});
  document.documentElement.addEventListener('contextmenu', () => {mouseDown=false; x=0; y=0;});
  document.documentElement.addEventListener('mousemove', (e) => {
    if(mouseDown) {
      let dx = e.clientX-x;
      let dy = e.clientY-y;
      windowEl.style.top = parseInt(windowEl.style.top) + dy + "px";
      windowEl.style.left = parseInt(windowEl.style.left) + dx + "px";
      x = e.clientX;
      y = e.clientY;
    }
  });
  // make windowEl resizable from the right-hand bottom corner (cornerResizeHandle element)
  // similar to above, but we alter width and height instead of top and left
  let mouseDown2 = false;
  let x2 = 0;
  let y2 = 0;
  cornerResizeHandle.addEventListener("mousedown", (e) => {
    mouseDown2 = true;
    x2 = e.clientX;
    y2 = e.clientY;
  });
  document.documentElement.addEventListener("mouseup", () => {mouseDown2=false; x2=0; y2=0;});
  document.documentElement.addEventListener('mouseleave', () => {mouseDown2=false; x2=0; y2=0;});
  document.documentElement.addEventListener('contextmenu', () => {mouseDown2=false; x2=0; y2=0;});
  document.documentElement.addEventListener('mousemove', (e) => {
    if(mouseDown2) {
      let dx = e.clientX-x2;
      let dy = e.clientY-y2;
      windowEl.style.height = parseInt(windowEl.style.height) + dy + "px";
      windowEl.style.width = parseInt(windowEl.style.width) + dx + "px";
      x2 = e.clientX;
      y2 = e.clientY;
    }
  });

  if(opts.appendTo) opts.appendTo.appendChild(windowEl);
  else document.body.appendChild(windowEl);

  const api = {
    ctn: windowEl,
    headerEl,
    bodyEl,
    hide: function() {
      // we don't just display:none because IIUC that can cause iframes in bodyEl to do weird stuff: https://github.com/whatwg/html/issues/1813
      windowEl.style.opacity = "0";
      windowEl.style.pointerEvents = "none";
    },
    show: function() {
      windowEl.style.opacity = "1";
      windowEl.style.pointerEvents = "auto";
    },
    delete: function() {
      windowEl.remove();
    }
  };

  if(opts.closeButtonAction === "hide") {
    closeButtonEl.addEventListener("click", () => api.hide());
  } else {
    closeButtonEl.addEventListener("click", () => api.delete());
  }

  return api;
}


export function sanitizeHtml(text) {
  if(text === undefined) text = "";
  text = text+"";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}




speechSynthesis.getVoices(); // this is needed to populate the list of voices in (some?) browsers

export function textToSpeech({text, voiceName}) {
  return new Promise((resolve, reject) => {
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === voiceName);
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    utterance.voice = voice;
    utterance.rate = 1.3;
    utterance.pitch = 1.0;
    utterance.onend = function() {
      resolve();
    };
    utterance.onerror = function(e) {
      reject(e);
    };
    speechSynthesis.speak(utterance);
  });
}


export async function sha256Text(text) {
  const msgUint8 = new TextEncoder().encode(text);                          
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);          
  const hashArray = Array.from(new Uint8Array(hashBuffer));                    
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}


export function dedent(str) {
  // find the first non-whitespace character on each line, and then we find the minimum indent of all lines
  // then we remove that many spaces from the beginning of each line
  let match = str.match(/^[ \t]*(?=\S)/gm);
  if (!match) {
    return str;
  }
  let indent = Math.min(...match.map(x => x.length));
  let re = new RegExp(`^[ \\t]{${indent}}`, 'gm');
  let result = indent > 0 ? str.replace(re, '') : str;
  return result.trim(); // trim because with indented multi-line strings, the first line will almost always have a newline at the beginning, assuming regular code formatting
}


export function downloadTextOrBlob(textOrBlob, filename) {
  let blob;
  if(typeof textOrBlob === "string") blob = new Blob([textOrBlob], {type: "application/json"});
  else blob = textOrBlob;

  const dataUri = URL.createObjectURL(blob);
  let linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", filename);
  linkElement.click();
  linkElement.remove();
  setTimeout(() => URL.revokeObjectURL(dataUri), 30*1000);
} 


export function cosineDistance(vector1, vector2) {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  for(let i=0; i<vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    norm1 += vector1[i] * vector1[i];
    norm2 += vector2[i] * vector2[i];
  }
  return 1 - (dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2)));
}

export function createLoadingModal(initialContent, parentElement) {
  if(!parentElement) parentElement = document.body;
  let loadingModalCtn = document.createElement("div");
  loadingModalCtn.innerHTML = `<style>
    .loadingModalCtn-856246272937 {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      z-index: 100;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      z-index: 99999999;
    }
    .loadingModalContent-856246272937 {
      background-color: white;
      border-radius: 3px;
      background-color: var(--background);
      border-radius: var(--border-radius);
      padding: 1rem;
      text-align: center;
      box-shadow: 0px 1px 10px 3px rgb(130 130 130 / 24%);
    }
  </style>`
  let contentEl = document.createElement("div");
  contentEl.classList.add("loadingModalContent-856246272937");
  contentEl.innerHTML = initialContent || "";
  loadingModalCtn.appendChild(contentEl);
  loadingModalCtn.classList.add("loadingModalCtn-856246272937");
  parentElement.appendChild(loadingModalCtn);
  return {
    updateContent: function(content) {
      contentEl.innerHTML = content;
    },
    delete: function() {
      loadingModalCtn.remove();
    },
  }
}




// this function crawls deeply through the overrides object and applies values to `obj` in the same "position" within the object - either overriding existing values, or creating new key/value pairs if they don't exist
export function applyObjectOverrides({object, overrides}) {
  for(let key in overrides) {
    if(Array.isArray(overrides[key])) {
      object[key] = structuredClone(overrides[key]); // arrays are treated as "final" values - we don't go "into" them
    } else if(typeof overrides[key] === "object" && overrides[key] !== null) {
      if (!object.hasOwnProperty(key) || typeof object[key] !== "object" || object[key] === null) {
        object[key] = {};
      }
      applyObjectOverrides({object:object[key], overrides:overrides[key]});
    } else {
      object[key] = overrides[key];
    }
  }
}


export function objectKeysAndTypesAreValid(obj, validStructure, opts={}) { // if you don't set opts.requireAllKeys=true, it allows missing keys in the obj
  if (typeof obj !== 'object' || obj === null || typeof validStructure !== 'object' || validStructure === null) {
    return false;
  }

  const objKeys = Object.keys(obj);
  const structureKeys = Object.keys(validStructure);

  if (opts.requireAllKeys && objKeys.length !== structureKeys.length) {
    return false;
  }

  for (let key of objKeys) {
    if (!structureKeys.includes(key)) {
      return false;
    }

    const objValue = obj[key];
    const structureValue = validStructure[key];

    if (typeof objValue !== typeof structureValue) {
      return false;
    }

    if (typeof objValue === 'object' && !objectKeysAndTypesAreValid(objValue, structureValue, {requireAllKeys:opts.requireAllKeys})) {
      return false;
    }
  }

  return true;
}



export function addBackgroundToElement(element) {
  // note: assumes that `element` has `position:relative;` so the position:absolute of the media elements works as expected
  const media = [
    { type: 'video', el: document.createElement('video') },
    { type: 'video', el: document.createElement('video') },
    { type: 'img', el: document.createElement('img') },
    { type: 'img', el: document.createElement('img') },
  ];
  let currentMedia = 0;

  media.forEach(item => {
    const { el } = item;
    el.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1s;';
    if(item.type === 'video') {
      el.muted = true;
      el.loop = true;
    }
    element.appendChild(el);
  });

  function isVideoUrl(url) {
    return /\.(mp4|webm|ogg)$/i.test(url);
  }

  function getMediaType(url) {
    return isVideoUrl(url) ? 'video' : 'img';
  }

  let currentUrl = null;

  return {
    get currentUrl() { return currentUrl; },
    change: (url) => {
      currentUrl = url;
      if(url === null) {
        media.forEach(({ el }) => {
          el.style.opacity = 0;
        });
        return;
      }

      const nextMediaIndex = (currentMedia + 1) % 4;
      const mediaType = getMediaType(url);
      const nextMedia = media.find((item, index) => index !== currentMedia && item.type === mediaType);

      if(mediaType === 'video') {
        nextMedia.el.src = url;
        nextMedia.el.play();
        nextMedia.el.addEventListener('canplay', () => {
          media[currentMedia].el.style.opacity = 0;
          nextMedia.el.style.opacity = 1;
          currentMedia = media.indexOf(nextMedia);
        }, { once: true });
      } else {
        nextMedia.el.src = url;
        nextMedia.el.addEventListener('load', () => {
          media[currentMedia].el.style.opacity = 0;
          nextMedia.el.style.opacity = 1;
          currentMedia = media.indexOf(nextMedia);
        }, { once: true });
      }
    },
    filter: (filterValue) => {
      media.forEach(({ el }) => {
        el.style.filter = filterValue ?? "";
      });
    },
    destroy: () => {
      media.forEach(({ el }) => {
        el.remove();
      });
    },
  };
}


export function importStylesheet(src) {
  return new Promise(function (resolve, reject) {
    let link = document.createElement('link');
    link.href = src;
    link.rel = 'stylesheet';
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`Style load error for ${src}`));
    document.head.append(link);
  });
}


export function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}


// this function avoids maximum-string-length errors by not using JSON.stringify
export function jsonToBlob(json) {
  const textEncoder = new TextEncoder();
  const seen = new WeakSet();

  function processValue(value) {
    if(seen.has(value)) {
      throw new TypeError("Converting circular structure to JSON");
    }

    if(value && typeof value.toJSON === "function") {
      value = value.toJSON();
    }

    if(typeof value === 'object' && value !== null) {
      seen.add(value);

      const blobParts = [];
      const entries = Array.isArray(value) ? value : Object.entries(value);
      for(let i = 0; i < entries.length; i++) {
        if(Array.isArray(value)) {
          blobParts.push(processValue(entries[i]));
        } else {
          const [key, val] = entries[i];
          blobParts.push(textEncoder.encode(JSON.stringify(key) + ':'), processValue(val));
        }
        if(i !== entries.length - 1) blobParts.push(textEncoder.encode(','));
      }

      const startBracket = Array.isArray(value) ? '[' : '{';
      const endBracket = Array.isArray(value) ? ']' : '}';
      return new Blob([textEncoder.encode(startBracket), ...blobParts, textEncoder.encode(endBracket)]);
    } else if(typeof value === 'function' || typeof value === 'undefined') {
      return textEncoder.encode("null");
    } else {
      // For primitives we just convert it to string and encode
      return textEncoder.encode(JSON.stringify(value));
    }
  }

  return processValue(json);
}























// https://github.com/josephrocca/gpt-2-3-tokenizer
export function createGpt3Tokenizer() {
  return encode;
}