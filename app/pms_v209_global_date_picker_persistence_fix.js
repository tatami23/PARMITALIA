(function(){
  "use strict";

  var VERSION = "pms_v209_global_date_picker_persistence_fix";
  var DRAFT_KEY = "parmitalia_pms_v209_date_drafts";
  var nativeFormData = window.FormData;
  var activeInput = null;
  var activeMonth = null;

  function clean(value){ return String(value == null ? "" : value).trim(); }
  function pad(value){ return String(value).padStart(2, "0"); }
  function todayIso(){
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function normalizeDate(value){
    var raw = clean(value);
    if (!raw) return "";
    var iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) return iso[1] + "-" + pad(iso[2]) + "-" + pad(iso[3]);
    var it = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (it) {
      var year = it[3].length === 2 ? "20" + it[3] : it[3];
      return year + "-" + pad(it[2]) + "-" + pad(it[1]);
    }
    var compact = raw.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (compact) return compact[3] + "-" + compact[2] + "-" + compact[1];
    return raw;
  }
  function parseDate(value){
    var iso = normalizeDate(value || todayIso());
    var parts = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!parts) return new Date();
    return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  }
  function pageKey(){
    return clean(window.current && current.page) || "global";
  }
  function readDrafts(){
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") || {}; }
    catch(error) { return {}; }
  }
  function writeDrafts(drafts){
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts || {})); }
    catch(error) {}
  }
  function inputKey(input){
    var form = input.closest("form");
    var formId = form && (form.id || form.getAttribute("name") || form.dataset.module || form.dataset.pmsModule || "");
    var readonly = form && form.querySelector("input[readonly]");
    var record = readonly && readonly.value ? readonly.value : "";
    var modalTitle = clean(document.getElementById("modal-title") && document.getElementById("modal-title").textContent);
    var name = input.name || input.id || "date";
    var index = Array.prototype.indexOf.call((form || document).querySelectorAll("input"), input);
    return [pageKey(), formId, record, modalTitle, name, index].join("|");
  }
  function remember(input){
    if (!input || !input.name && !input.id) return;
    var value = normalizeDate(input.value || input.dataset.pms209StableDate || "");
    input.dataset.pms209StableDate = value;
    input.setAttribute("value", value);
    var drafts = readDrafts();
    if (value) drafts[inputKey(input)] = value;
    else delete drafts[inputKey(input)];
    writeDrafts(drafts);
  }
  function restore(input){
    if (!input || input.value) return;
    var saved = readDrafts()[inputKey(input)];
    if (saved) setValue(input, saved, false);
  }
  function setValue(input, value, fireEvents){
    var next = normalizeDate(value);
    try {
      var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      if (descriptor && descriptor.set) descriptor.set.call(input, next);
      else input.value = next;
    } catch(error) {
      input.value = next;
    }
    input.dataset.pms209StableDate = next;
    input.setAttribute("value", next);
    remember(input);
    if (fireEvents !== false) {
      input.dispatchEvent(new Event("input", {bubbles:true}));
      input.dispatchEvent(new Event("change", {bubbles:true}));
    }
  }
  function isDateInput(input){
    if (!input || input.tagName !== "INPUT") return false;
    var type = (input.getAttribute("type") || input.type || "").toLowerCase();
    if (type === "date" || type === "datetime-local") return true;
    if (input.dataset && input.dataset.pms209Date === "1") return true;
    return false;
  }
  function css(){
    if (document.getElementById("pms-v209-date-style")) return;
    var style = document.createElement("style");
    style.id = "pms-v209-date-style";
    style.textContent = [
      ".pms209-date-wrap{display:flex!important;align-items:center!important;gap:6px!important;width:100%!important;min-width:0!important}",
      ".pms209-date-wrap input{flex:1 1 auto!important;min-width:0!important}",
      ".pms209-date-btn{flex:0 0 auto!important;width:auto!important;min-width:34px!important;height:34px!important;margin:0!important;padding:6px 9px!important;border-radius:6px!important;border:1px solid #b7c7bd!important;background:#fff!important;color:#154734!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}",
      ".pms209-date-pop{position:fixed!important;z-index:70000!important;width:292px!important;background:#fff!important;border:1px solid #b7c7bd!important;border-radius:8px!important;box-shadow:0 22px 64px rgba(15,23,42,.28)!important;padding:10px!important;color:#13251f!important}",
      ".pms209-date-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;margin-bottom:8px!important}",
      ".pms209-date-head strong{font-size:13px!important;font-weight:950!important;text-transform:capitalize!important}",
      ".pms209-date-head button,.pms209-date-foot button{width:auto!important;margin:0!important;padding:6px 9px!important;border-radius:6px!important;border:1px solid #d7e2dd!important;background:#f8fafc!important;color:#17362d!important;font-size:12px!important;font-weight:900!important;cursor:pointer!important}",
      ".pms209-date-grid{display:grid!important;grid-template-columns:repeat(7,1fr)!important;gap:3px!important}",
      ".pms209-date-grid span,.pms209-date-grid button{height:32px!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:6px!important;font-size:12px!important}",
      ".pms209-date-grid span{color:#64748b!important;font-weight:950!important}",
      ".pms209-date-grid button{width:100%!important;margin:0!important;padding:0!important;border:1px solid transparent!important;background:#fff!important;color:#17242b!important;font-weight:850!important;cursor:pointer!important}",
      ".pms209-date-grid button:hover{background:#e8f5ee!important;border-color:#9fcbb3!important}",
      ".pms209-date-grid button.is-selected{background:#14713f!important;color:#fff!important}",
      ".pms209-date-grid button.is-today{border-color:#c1121f!important}",
      ".pms209-date-foot{display:flex!important;justify-content:space-between!important;gap:7px!important;margin-top:9px!important}",
      ".pms209-date-warning{outline:2px solid #14713f!important;box-shadow:0 0 0 3px rgba(20,113,63,.12)!important}"
    ].join("\n");
    document.head.appendChild(style);
  }
  function monthLabel(date){
    try { return date.toLocaleDateString("it-IT", {month:"long", year:"numeric"}); }
    catch(error) { return (date.getMonth() + 1) + "/" + date.getFullYear(); }
  }
  function closePicker(){
    var old = document.getElementById("pms209-date-pop");
    if (old) old.remove();
    if (activeInput) activeInput.classList.remove("pms209-date-warning");
    activeInput = null;
  }
  function showPicker(input, monthDate){
    if (!input) return;
    css();
    activeInput = input;
    activeInput.classList.add("pms209-date-warning");
    activeMonth = monthDate || parseDate(input.value || input.dataset.pms209StableDate || todayIso());
    var pop = document.getElementById("pms209-date-pop");
    if (!pop) {
      pop = document.createElement("div");
      pop.id = "pms209-date-pop";
      pop.className = "pms209-date-pop";
      document.body.appendChild(pop);
    }
    var selected = normalizeDate(input.value || input.dataset.pms209StableDate || "");
    var today = todayIso();
    var first = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1);
    var startOffset = (first.getDay() + 6) % 7;
    var days = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0).getDate();
    var cells = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"].map(function(day){ return "<span>" + day + "</span>"; }).join("");
    for (var i = 0; i < startOffset; i++) cells += "<span></span>";
    for (var d = 1; d <= days; d++) {
      var iso = activeMonth.getFullYear() + "-" + pad(activeMonth.getMonth() + 1) + "-" + pad(d);
      var cls = (iso === selected ? " is-selected" : "") + (iso === today ? " is-today" : "");
      cells += '<button type="button" class="' + cls + '" data-pms209-day="' + esc(iso) + '">' + d + "</button>";
    }
    pop.innerHTML = '<div class="pms209-date-head"><button type="button" data-pms209-prev>&lt;</button><strong>' + esc(monthLabel(activeMonth)) + '</strong><button type="button" data-pms209-next>&gt;</button></div><div class="pms209-date-grid">' + cells + '</div><div class="pms209-date-foot"><button type="button" data-pms209-today>Oggi</button><button type="button" data-pms209-clear>Pulisci</button><button type="button" data-pms209-close>Chiudi</button></div>';
    var rect = input.getBoundingClientRect();
    var left = Math.min(window.innerWidth - 308, Math.max(8, rect.left));
    var top = rect.bottom + 6;
    if (top + 330 > window.innerHeight) top = Math.max(8, rect.top - 330);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
    pop.querySelector("[data-pms209-prev]").onclick = function(){ showPicker(input, new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1)); };
    pop.querySelector("[data-pms209-next]").onclick = function(){ showPicker(input, new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1)); };
    pop.querySelector("[data-pms209-today]").onclick = function(){ setValue(input, todayIso(), true); closePicker(); };
    pop.querySelector("[data-pms209-clear]").onclick = function(){ setValue(input, "", true); closePicker(); };
    pop.querySelector("[data-pms209-close]").onclick = closePicker;
    pop.querySelectorAll("[data-pms209-day]").forEach(function(button){
      button.onclick = function(){
        setValue(input, button.getAttribute("data-pms209-day"), true);
        closePicker();
      };
    });
  }
  function enhance(input){
    if (!isDateInput(input)) return;
    css();
    restore(input);
    if ((input.getAttribute("type") || "").toLowerCase() === "date") {
      try { input.type = "text"; } catch(error) { input.setAttribute("type", "text"); }
      input.dataset.pms209OriginalType = "date";
    }
    input.dataset.pms209Date = "1";
    input.placeholder = input.placeholder || "AAAA-MM-GG";
    input.autocomplete = "off";
    input.inputMode = "numeric";
    input.removeAttribute("readonly");
    input.disabled = false;
    input.style.pointerEvents = "auto";
    if (input.dataset.pms209Bound !== "1") {
      input.dataset.pms209Bound = "1";
      input.addEventListener("input", function(){ setValue(input, input.value, false); }, true);
      input.addEventListener("change", function(){ setValue(input, input.value, false); }, true);
      input.addEventListener("blur", function(){ setValue(input, input.value, false); }, true);
      input.addEventListener("focus", function(){ showPicker(input); }, true);
      input.addEventListener("click", function(event){
        event.stopPropagation();
        showPicker(input);
      }, true);
    }
    if (!input.closest(".pms209-date-wrap")) {
      var wrap = document.createElement("span");
      wrap.className = "pms209-date-wrap";
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pms209-date-btn";
      btn.textContent = "Calendario";
      btn.setAttribute("aria-label", "Apri calendario");
      btn.onclick = function(event){
        event.preventDefault();
        event.stopPropagation();
        showPicker(input);
      };
      wrap.appendChild(btn);
    }
  }
  function fixDates(root){
    (root || document).querySelectorAll('input[type="date"],input[type="datetime-local"],input[data-pms209-date="1"]').forEach(enhance);
  }
  function flushDateInputs(root){
    (root || document).querySelectorAll('input[data-pms209-date="1"],input[type="date"],input[type="datetime-local"]').forEach(function(input){
      var stable = input.value || input.dataset.pms209StableDate || input.getAttribute("value") || "";
      setValue(input, stable, false);
    });
  }
  function patchFormData(){
    if (!nativeFormData || nativeFormData.__pms209Wrapped) return;
    var WrappedFormData = function(form, submitter){
      if (form && form.nodeType === 1) flushDateInputs(form);
      if (!form) return new nativeFormData();
      return submitter ? new nativeFormData(form, submitter) : new nativeFormData(form);
    };
    WrappedFormData.prototype = nativeFormData.prototype;
    Object.setPrototypeOf && Object.setPrototypeOf(WrappedFormData, nativeFormData);
    WrappedFormData.__pms209Wrapped = true;
    window.FormData = WrappedFormData;
  }
  function patchSubmitters(){
    if (typeof submitModal === "function" && !submitModal.__pms209Wrapped) {
      var baseSubmit = submitModal;
      submitModal = function(event, module, id){
        if (event && event.target) flushDateInputs(event.target);
        return baseSubmit.apply(this, arguments);
      };
      submitModal.__pms209Wrapped = true;
      try { window.submitModal = submitModal; } catch(error) {}
    }
    document.querySelectorAll("form").forEach(function(form){
      if (form.dataset.pms209SubmitBound === "1") return;
      form.dataset.pms209SubmitBound = "1";
      form.addEventListener("submit", function(){ flushDateInputs(form); }, true);
    });
  }
  function wrapRender(){
    if (typeof render === "function" && !render.__pms209DatesWrapped) {
      var baseRender = render;
      render = function(){
        flushDateInputs(document);
        var result = baseRender.apply(this, arguments);
        setTimeout(refresh, 20);
        setTimeout(refresh, 180);
        return result;
      };
      render.__pms209DatesWrapped = true;
      try { window.render = render; } catch(error) {}
    }
    if (typeof openModal === "function" && !openModal.__pms209DatesWrapped) {
      var baseOpenModal = openModal;
      openModal = function(){
        var result = baseOpenModal.apply(this, arguments);
        setTimeout(refresh, 20);
        setTimeout(refresh, 160);
        return result;
      };
      openModal.__pms209DatesWrapped = true;
      try { window.openModal = openModal; } catch(error) {}
    }
  }
  function refresh(){
    patchFormData();
    patchSubmitters();
    fixDates(document);
  }
  function boot(){
    css();
    patchFormData();
    wrapRender();
    refresh();
    document.addEventListener("click", function(event){
      var pop = document.getElementById("pms209-date-pop");
      if (!pop) return;
      if (pop.contains(event.target) || (activeInput && event.target === activeInput) || event.target.closest(".pms209-date-wrap")) return;
      closePicker();
    }, true);
    var observer = new MutationObserver(function(){ setTimeout(refresh, 30); });
    observer.observe(document.documentElement, {childList:true, subtree:true});
    [80, 250, 700, 1500].forEach(function(ms){ setTimeout(refresh, ms); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.PMS_V209_GLOBAL_DATE_PICKER_PERSISTENCE_FIX = {version:VERSION, refresh:refresh, normalizeDate:normalizeDate};
})();
