(function(){
  "use strict";

  var VERSION = "pms_v247_print_logo_visibility_fix";
  var DEFAULT_LOGO = "assets/parmitalia_logo_background.jpeg";
  var STYLE_ID = "pms-v247-print-logo-visibility-style";

  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function absoluteUrl(value){
    var raw = clean(value);
    if (!raw) raw = DEFAULT_LOGO;
    if (/^(data:|blob:|file:|https?:)/i.test(raw)) return raw;
    try { return new URL(raw, document.baseURI).href; } catch(error) { return raw; }
  }
  function settings(){
    try {
      if (window.state && state.settings) return state.settings;
    } catch(error) {}
    return {};
  }
  function logoSrc(){
    var s = settings();
    return absoluteUrl(s.logoUrl || DEFAULT_LOGO);
  }
  function companyName(){
    var s = settings();
    return clean(s.legalName || s.companyName) || "PARMITALIA DISTRIBUTION SRL";
  }
  function metaHtml(){
    var s = settings();
    return [s.vat, s.address, s.email, s.phone].map(clean).filter(Boolean).map(esc).join("<br>");
  }
  function logoHtml(cls){
    return '<div class="pms247-logo-box"><img class="' + esc(cls || "print-logo") + '" src="' + esc(logoSrc()) + '" alt="Parmitalia Distribution"><div class="pms247-logo-fallback">PARMITALIA</div></div>';
  }
  function injectCss(){
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      "#print-root .print-header{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:9mm!important;align-items:start!important;position:relative!important;background:#fff!important;overflow:visible!important;isolation:isolate!important;border-bottom:1.2pt solid #1f4e78!important;padding:0 0 5mm!important;margin:0 0 5mm!important;break-inside:avoid!important;page-break-inside:avoid!important}",
      "#print-root .print-header>*{position:relative!important;z-index:2!important}",
      "#print-root .pms247-print-brand,#print-root .pms244-print-brand,#print-root .pms97-brand,#print-root .pms80-brand-block{display:grid!important;grid-template-columns:46mm minmax(0,1fr)!important;gap:6mm!important;align-items:start!important;min-width:0!important;position:relative!important;background:#fff!important;overflow:visible!important;z-index:5!important}",
      "#print-root .pms247-logo-box,#print-root .pms244-logo-box{width:46mm!important;min-width:46mm!important;height:24mm!important;min-height:24mm!important;display:grid!important;place-items:start!important;position:relative!important;z-index:30!important;isolation:isolate!important;background:#fff!important;border:0!important;box-shadow:none!important;overflow:visible!important;margin:0!important;padding:0!important}",
      "#print-root .print-logo,#print-root .pms80-logo,#print-root .pms87-legacy-logo img,#print-root .pms97-logo,#print-root .pms244-clean-logo,#print-root .pms247-clean-logo{display:block!important;width:auto!important;height:auto!important;max-width:46mm!important;max-height:24mm!important;object-fit:contain!important;object-position:left top!important;position:relative!important;z-index:40!important;margin:0!important;padding:0!important;border:0!important;background:#fff!important;box-shadow:none!important;transform:none!important;filter:none!important;mix-blend-mode:normal!important;opacity:1!important}",
      "#print-root .pms247-logo-fallback{display:none!important;width:46mm!important;height:18mm!important;border:1.2pt solid #1f4e78!important;color:#1f4e78!important;background:#fff!important;place-items:center!important;font-weight:900!important;font-size:12pt!important;letter-spacing:0!important;position:relative!important;z-index:35!important}",
      "#print-root .pms247-title,#print-root .pms244-title{min-width:0!important;background:#fff!important;position:relative!important;z-index:10!important}",
      "#print-root .print-header h1{margin:0 0 2mm!important;line-height:1.08!important;color:#1f4e78!important;letter-spacing:0!important;overflow-wrap:anywhere!important}",
      "#print-root .print-header strong{display:block!important;margin-bottom:1mm!important;color:#111827!important}",
      "#print-root .print-header span{display:block!important;color:#475569!important;line-height:1.35!important}",
      "#print-root .print-meta{min-width:34mm!important;max-width:42mm!important;text-align:right!important;background:#fff!important;position:relative!important;z-index:8!important}",
      "#print-root .print-header [role='alert'],#print-root .print-header [data-state='error'],#print-root .print-header .error,#print-root .print-header .errore,#print-root .print-header .alert,#print-root .print-header .toast,#print-root .print-header .notification,#print-root .print-header .pms89-ai-status,#print-root .print-header .pms95-warn,#print-root .print-header .pms96-note{display:none!important;visibility:hidden!important;position:static!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;opacity:0!important}",
      "#print-root .brand-mark,#print-root .pms97-mark,#print-root [class*='world' i],#print-root [id*='world' i],#print-root [class*='globe' i],#print-root [id*='globe' i],#print-root .pms210-earth,#print-root .pms210-ellipse,#print-root .pms170-earth,#print-root .pms170-ellipse{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;opacity:0!important}",
      "@media print{#print-root .print-header{print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}#print-root .print-logo,#print-root .pms247-clean-logo{print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}}"
    ].join("\n");
  }
  function buildHeader(title, code, subtitle){
    var extra = clean(subtitle) ? esc(subtitle) : metaHtml();
    return '<div class="print-header pms247-header"><div class="pms247-print-brand">' + logoHtml("print-logo pms247-clean-logo") + '<div class="pms247-title"><h1>' + esc(title || "") + '</h1><strong>' + esc(companyName()) + '</strong>' + (extra ? '<span>' + extra + '</span>' : "") + '</div></div><div class="print-meta">' + esc(new Date().toLocaleDateString("it-IT")) + (code ? '<br>' + esc(code) : "") + '</div></div>';
  }
  function looksLikeObstruction(node){
    var signature = clean((node.id || "") + " " + (node.className || "") + " " + (node.getAttribute && (node.getAttribute("role") || "") || "") + " " + (node.getAttribute && (node.getAttribute("data-state") || "") || "")).toLowerCase();
    return /(error|errore|alert|toast|notification|status|warn|pms95-warn|pms96-note)/.test(signature);
  }
  function removeDecorations(root){
    root.querySelectorAll(".brand-mark,.pms97-mark,.pms210-earth,.pms210-ellipse,.pms170-earth,.pms170-ellipse").forEach(function(node){
      node.remove();
    });
    root.querySelectorAll("*").forEach(function(node){
      var text = String((node.id || "") + " " + (node.className || "")).toLowerCase();
      if (text.indexOf("world") >= 0 || text.indexOf("globe") >= 0) node.remove();
    });
  }
  function removeHeaderObstructions(header){
    header.querySelectorAll("*").forEach(function(node){
      if (!node.closest(".pms247-logo-box,.pms244-logo-box,.print-meta") && looksLikeObstruction(node)) node.remove();
    });
  }
  function attachLogoFallback(root){
    root.querySelectorAll(".pms247-logo-box img,.pms244-logo-box img,.print-logo,.pms244-clean-logo").forEach(function(img){
      img.classList.add("pms247-clean-logo");
      img.setAttribute("src", logoSrc());
      img.setAttribute("alt", "Parmitalia Distribution");
      img.onerror = function(){
        var box = img.closest(".pms247-logo-box,.pms244-logo-box");
        if (box) {
          img.style.display = "none";
          var fallback = box.querySelector(".pms247-logo-fallback");
          if (fallback) fallback.style.display = "grid";
        }
      };
    });
  }
  function ensureHeaderLogo(root){
    root.querySelectorAll(".print-header").forEach(function(header){
      removeDecorations(header);
      removeHeaderObstructions(header);
      var meta = header.querySelector(":scope > .print-meta");
      var brand = header.querySelector(":scope > .pms247-print-brand,:scope > .pms244-print-brand,:scope > .pms97-brand,:scope > .pms80-brand-block");
      if (!brand) {
        brand = header.firstElementChild && header.firstElementChild !== meta ? header.firstElementChild : document.createElement("div");
        if (!brand.parentElement) header.insertBefore(brand, meta || header.firstChild);
      }
      brand.classList.add("pms247-print-brand");
      brand.querySelectorAll(".brand-mark,.pms97-mark,.pms210-earth,.pms210-ellipse,.pms170-earth,.pms170-ellipse,.pms247-logo-box,.pms244-logo-box").forEach(function(node){ node.remove(); });
      brand.querySelectorAll("img.print-logo,img.pms80-logo,img.pms87-logo,img.pms97-logo,img.pms244-clean-logo,img.pms247-clean-logo").forEach(function(node){ node.remove(); });
      brand.insertAdjacentHTML("afterbegin", logoHtml("print-logo pms247-clean-logo"));
    });
    attachLogoFallback(root);
  }
  function sanitizePrintHtml(html){
    var wrap = document.createElement("div");
    wrap.innerHTML = String(html || "");
    removeDecorations(wrap);
    ensureHeaderLogo(wrap);
    return wrap.innerHTML;
  }
  function installHeaderOverride(){
    var header = function(title, code, subtitle){ return buildHeader(title, code, subtitle); };
    try { companyPrintHeader = header; } catch(error) {}
    window.companyPrintHeader = header;
  }
  function installOpenPrintGuard(){
    var base = typeof openPrint === "function" ? openPrint : null;
    if (!base || base.__pms247Wrapped) return;
    var wrapped = function(innerHtml){
      injectCss();
      return base.call(this, sanitizePrintHtml(innerHtml));
    };
    wrapped.__pms247Wrapped = true;
    try { openPrint = wrapped; } catch(error) {}
    window.openPrint = wrapped;
  }
  function refreshExistingPrintRoot(){
    injectCss();
    var root = document.getElementById("print-root");
    if (root) {
      removeDecorations(root);
      ensureHeaderLogo(root);
    }
  }
  function install(){
    injectCss();
    installHeaderOverride();
    installOpenPrintGuard();
    refreshExistingPrintRoot();
    [50, 250, 800, 1500].forEach(function(ms){ setTimeout(refreshExistingPrintRoot, ms); });
    window.PMS_V247_PRINT_LOGO_VISIBILITY_FIX = {
      version: VERSION,
      refresh: refreshExistingPrintRoot,
      sanitize: sanitizePrintHtml,
      logoSrc: logoSrc
    };
    console.info(VERSION + " loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
