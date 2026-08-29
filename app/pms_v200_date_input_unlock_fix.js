(function () {
  "use strict";

  if (window.PMS_V200_DATE_INPUT_UNLOCK_FIX) return;
  window.PMS_V200_DATE_INPUT_UNLOCK_FIX = { version: "pms_v200_date_input_unlock_fix" };

  var activeInput = null;
  var activeMonth = null;
  var nativeSetTimeout = window.setTimeout.bind(window);

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function todayIso() {
    var date = new Date();
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function normalizeDate(value) {
    var raw = String(value == null ? "" : value).trim();
    if (!raw) return "";
    var iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) return iso[1] + "-" + pad(iso[2]) + "-" + pad(iso[3]);
    var it = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (it) return (it[3].length === 2 ? "20" + it[3] : it[3]) + "-" + pad(it[2]) + "-" + pad(it[1]);
    var compact = raw.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (compact) return compact[3] + "-" + compact[2] + "-" + compact[1];
    return raw;
  }

  function parseDate(value) {
    var iso = normalizeDate(value || todayIso());
    var parts = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!parts) return new Date();
    return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  }

  function isLikelyDateInput(input) {
    if (!input || input.tagName !== "INPUT") return false;
    var type = String(input.getAttribute("type") || input.type || "").toLowerCase();
    if (type === "date" || type === "datetime-local") return true;
    if (input.dataset && input.dataset.pms200DateUnlocked === "1") return true;
    var key = [
      input.name, input.id, input.placeholder, input.getAttribute("aria-label"),
      input.closest("label") && input.closest("label").textContent
    ].join(" ").toLowerCase();
    return /data|date|giorno|consegna|ritiro|scadenza|follow|appuntamento|calendar|calendario/.test(key);
  }

  function installCss() {
    if (document.getElementById("pms200-date-unlock-style")) return;
    var style = document.createElement("style");
    style.id = "pms200-date-unlock-style";
    style.textContent = `
      input.pms200-date-unlocked{pointer-events:auto!important;user-select:text!important;background:#fff!important;cursor:text!important}
      .pms200-date-wrap{display:flex!important;align-items:center!important;gap:6px!important;width:100%!important;min-width:0!important}
      .pms200-date-wrap>input{flex:1 1 auto!important;min-width:0!important}
      .pms200-date-button{flex:0 0 auto!important;height:34px!important;min-width:38px!important;padding:0 9px!important;border:1px solid #b7c7bd!important;border-radius:6px!important;background:#fff!important;color:#154734!important;font-size:12px!important;font-weight:900!important;cursor:pointer!important}
      .pms200-date-pop{position:fixed!important;z-index:900000!important;width:292px!important;background:#fff!important;border:1px solid #b7c7bd!important;border-radius:8px!important;box-shadow:0 22px 64px rgba(15,23,42,.28)!important;padding:10px!important;color:#13251f!important}
      .pms200-date-head,.pms200-date-foot{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important}
      .pms200-date-head{margin-bottom:8px!important}
      .pms200-date-head strong{font-size:13px!important;font-weight:950!important;text-transform:capitalize!important}
      .pms200-date-head button,.pms200-date-foot button{width:auto!important;margin:0!important;padding:6px 9px!important;border-radius:6px!important;border:1px solid #d7e2dd!important;background:#f8fafc!important;color:#17362d!important;font-size:12px!important;font-weight:900!important;cursor:pointer!important}
      .pms200-date-grid{display:grid!important;grid-template-columns:repeat(7,1fr)!important;gap:3px!important}
      .pms200-date-grid span,.pms200-date-grid button{height:32px!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:6px!important;font-size:12px!important}
      .pms200-date-grid span{color:#64748b!important;font-weight:950!important}
      .pms200-date-grid button{width:100%!important;margin:0!important;padding:0!important;border:1px solid transparent!important;background:#fff!important;color:#17242b!important;font-weight:850!important;cursor:pointer!important}
      .pms200-date-grid button:hover{background:#e8f5ee!important;border-color:#9fcbb3!important}
      .pms200-date-grid button.is-selected{background:#14713f!important;color:#fff!important}
      .pms200-date-grid button.is-today{border-color:#c1121f!important}
      .pms200-date-foot{margin-top:9px!important}
    `;
    document.head.appendChild(style);
  }

  function setInputValue(input, value, fireEvents) {
    var next = normalizeDate(value);
    try {
      var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      if (descriptor && descriptor.set) descriptor.set.call(input, next);
      else input.value = next;
    } catch (_) {
      input.value = next;
    }
    input.setAttribute("value", next);
    input.dataset.pms200DateValue = next;
    if (fireEvents !== false) {
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function monthLabel(date) {
    try { return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" }); }
    catch (_) { return pad(date.getMonth() + 1) + "/" + date.getFullYear(); }
  }

  function closePicker() {
    var pop = document.getElementById("pms200-date-pop");
    if (pop) pop.remove();
    activeInput = null;
  }

  function showPicker(input, monthDate) {
    if (!input || !document.body.contains(input)) return;
    enhanceInput(input);
    activeInput = input;
    activeMonth = monthDate || parseDate(input.value || input.dataset.pms200DateValue || todayIso());
    var pop = document.getElementById("pms200-date-pop");
    if (!pop) {
      pop = document.createElement("div");
      pop.id = "pms200-date-pop";
      pop.className = "pms200-date-pop";
      document.body.appendChild(pop);
    }
    var selected = normalizeDate(input.value || input.dataset.pms200DateValue || "");
    var today = todayIso();
    var first = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1);
    var offset = (first.getDay() + 6) % 7;
    var days = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0).getDate();
    var cells = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map(function (day) {
      return "<span>" + day + "</span>";
    }).join("");
    for (var i = 0; i < offset; i += 1) cells += "<span></span>";
    for (var day = 1; day <= days; day += 1) {
      var iso = activeMonth.getFullYear() + "-" + pad(activeMonth.getMonth() + 1) + "-" + pad(day);
      var cls = (iso === selected ? " is-selected" : "") + (iso === today ? " is-today" : "");
      cells += '<button type="button" class="' + cls + '" data-pms200-day="' + esc(iso) + '">' + day + "</button>";
    }
    pop.innerHTML = '<div class="pms200-date-head"><button type="button" data-pms200-prev>&lt;</button><strong>' + esc(monthLabel(activeMonth)) + '</strong><button type="button" data-pms200-next>&gt;</button></div><div class="pms200-date-grid">' + cells + '</div><div class="pms200-date-foot"><button type="button" data-pms200-today>Oggi</button><button type="button" data-pms200-clear>Pulisci</button><button type="button" data-pms200-close>Chiudi</button></div>';
    var rect = input.getBoundingClientRect();
    var left = Math.min(window.innerWidth - 308, Math.max(8, rect.left));
    var top = rect.bottom + 6;
    if (top + 330 > window.innerHeight) top = Math.max(8, rect.top - 330);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
    pop.querySelector("[data-pms200-prev]").onclick = function () { showPicker(input, new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1)); };
    pop.querySelector("[data-pms200-next]").onclick = function () { showPicker(input, new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1)); };
    pop.querySelector("[data-pms200-today]").onclick = function () { setInputValue(input, todayIso(), true); closePicker(); };
    pop.querySelector("[data-pms200-clear]").onclick = function () { setInputValue(input, "", true); closePicker(); };
    pop.querySelector("[data-pms200-close]").onclick = closePicker;
    pop.querySelectorAll("[data-pms200-day]").forEach(function (button) {
      button.onclick = function () {
        setInputValue(input, button.getAttribute("data-pms200-day"), true);
        closePicker();
      };
    });
  }

  function enhanceInput(input) {
    if (!isLikelyDateInput(input)) return;
    installCss();
    if ((input.getAttribute("type") || "").toLowerCase() === "date" || (input.getAttribute("type") || "").toLowerCase() === "datetime-local") {
      try { input.type = "text"; } catch (_) { input.setAttribute("type", "text"); }
    }
    input.dataset.pms200DateUnlocked = "1";
    input.classList.add("pms200-date-unlocked");
    input.removeAttribute("readonly");
    input.disabled = false;
    input.inputMode = "numeric";
    input.autocomplete = "off";
    input.placeholder = input.placeholder || "AAAA-MM-GG oppure GG/MM/AAAA";
    input.style.pointerEvents = "auto";
    if (!input.closest(".pms200-date-wrap") && input.parentNode) {
      var wrap = document.createElement("span");
      wrap.className = "pms200-date-wrap";
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
      var button = document.createElement("button");
      button.type = "button";
      button.className = "pms200-date-button";
      button.textContent = "Data";
      button.setAttribute("aria-label", "Apri calendario");
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        showPicker(input);
      }, true);
      wrap.appendChild(button);
    }
    if (input.dataset.pms200DateBound === "1") return;
    input.dataset.pms200DateBound = "1";
    input.addEventListener("blur", function () { setInputValue(input, input.value, false); }, true);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") setInputValue(input, input.value, true);
      if (event.key === "Escape") closePicker();
    }, true);
  }

  function refresh(root) {
    (root || document).querySelectorAll("input").forEach(function (input) {
      if (isLikelyDateInput(input)) enhanceInput(input);
    });
  }

  function wrapRenderer(name) {
    var original = window[name];
    if (typeof original !== "function" || original.__pms200DateUnlockWrapped) return;
    var wrapped = function () {
      var result = original.apply(this, arguments);
      nativeSetTimeout(function () { refresh(document); }, 30);
      nativeSetTimeout(function () { refresh(document); }, 180);
      return result;
    };
    wrapped.__pms200DateUnlockWrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (_) {}
  }

  function boot() {
    installCss();
    refresh(document);
    wrapRenderer("render");
    wrapRenderer("openModal");
    document.addEventListener("focusin", function (event) {
      if (isLikelyDateInput(event.target)) enhanceInput(event.target);
    }, true);
    document.addEventListener("click", function (event) {
      if (isLikelyDateInput(event.target)) {
        enhanceInput(event.target);
        if (event.target.dataset.pms200DateUnlocked === "1") showPicker(event.target);
        return;
      }
      var pop = document.getElementById("pms200-date-pop");
      if (!pop) return;
      if (pop.contains(event.target) || event.target.closest(".pms200-date-wrap")) return;
      closePicker();
    }, true);
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) refresh(node);
        });
      });
    });
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
