(function(){
  "use strict";

  var VERSION = "pms_v244_clean_customer_print_logo";
  var DEFAULT_LOGO = "assets/parmitalia_logo_background.jpeg";
  var STYLE_ID = "pms-v244-clean-customer-print-logo-style";

  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function settings(){
    try {
      if (window.state && state.settings) return state.settings;
    } catch(error) {}
    return {};
  }
  function logoSrc(){
    var s = settings();
    return clean(s.logoUrl) || DEFAULT_LOGO;
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
    return '<img class="' + esc(cls || "print-logo") + '" src="' + esc(logoSrc()) + '" alt="Parmitalia Distribution">';
  }
  function injectCss(){
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      "#print-root .brand-mark,#print-root .pms97-mark,#print-root [class*='world' i],#print-root [id*='world' i],#print-root [class*='globe' i],#print-root [id*='globe' i],#print-root .pms210-earth,#print-root .pms210-ellipse,#print-root .pms170-earth,#print-root .pms170-ellipse{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;opacity:0!important}",
      "#print-root .print-header{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:10mm!important;align-items:start!important;background:#fff!important;overflow:visible!important}",
      "#print-root .pms244-print-brand{display:grid!important;grid-template-columns:44mm minmax(0,1fr)!important;gap:6mm!important;align-items:start!important;background:#fff!important;overflow:visible!important}",
      "#print-root .pms244-logo-box{width:44mm!important;min-width:44mm!important;height:22mm!important;display:grid!important;place-items:start!important;background:#fff!important;border:0!important;box-shadow:none!important;overflow:visible!important}",
      "#print-root .print-logo,#print-root .pms97-logo,#print-root .pms244-clean-logo{display:block!important;width:auto!important;height:auto!important;max-width:44mm!important;max-height:22mm!important;object-fit:contain!important;object-position:left top!important;margin:0!important;padding:0!important;border:0!important;background:#fff!important;box-shadow:none!important;position:static!important;z-index:auto!important;transform:none!important;filter:none!important;mix-blend-mode:normal!important;opacity:1!important}",
      "#print-root .pms244-title h1,#print-root .print-header h1{margin:0 0 2mm!important;line-height:1.08!important;color:#1f4e78!important;letter-spacing:0!important}",
      "#print-root .pms244-title strong{display:block!important;margin-bottom:1mm!important;color:#111827!important}",
      "#print-root .pms244-title span{display:block!important;color:#475569!important;line-height:1.35!important}",
      "#print-root .pms97-letterhead{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:10mm!important;align-items:start!important;background:#fff!important}",
      "#print-root .pms97-brand{display:grid!important;grid-template-columns:44mm minmax(0,1fr)!important;gap:6mm!important;align-items:start!important}",
      "@media print{#print-root .print-logo,#print-root .pms97-logo,#print-root .pms244-clean-logo{print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}}"
    ].join("\n");
  }
  function buildHeader(title, code, subtitle){
    var extra = clean(subtitle) ? esc(subtitle) : metaHtml();
    return '<div class="print-header pms244-header"><div class="pms244-print-brand"><div class="pms244-logo-box">' + logoHtml("print-logo pms244-clean-logo") + '</div><div class="pms244-title"><h1>' + esc(title || "") + '</h1><strong>' + esc(companyName()) + '</strong>' + (extra ? '<span>' + extra + '</span>' : "") + '</div></div><div class="print-meta">' + esc(new Date().toLocaleDateString("it-IT")) + (code ? '<br>' + esc(code) : "") + '</div></div>';
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
  function ensureHeaderLogo(root){
    root.querySelectorAll(".print-header").forEach(function(header){
      removeDecorations(header);
      var img = header.querySelector(".print-logo,.pms244-clean-logo");
      if (!img) {
        var first = header.firstElementChild || header;
        var brand = document.createElement("div");
        brand.className = "pms244-logo-box";
        brand.innerHTML = logoHtml("print-logo pms244-clean-logo");
        first.insertBefore(brand, first.firstChild);
      } else {
        img.classList.add("pms244-clean-logo");
        img.setAttribute("src", img.getAttribute("src") || logoSrc());
        img.setAttribute("alt", "Parmitalia Distribution");
      }
      var left = header.firstElementChild;
      if (left && !left.classList.contains("pms244-print-brand")) left.classList.add("pms244-print-brand");
    });
    root.querySelectorAll(".pms97-letterhead").forEach(function(header){
      removeDecorations(header);
      var brand = header.querySelector(".pms97-brand") || header.firstElementChild || header;
      var img = brand.querySelector(".pms97-logo,.print-logo,.pms244-clean-logo");
      if (!img) {
        var box = document.createElement("div");
        box.className = "pms244-logo-box";
        box.innerHTML = logoHtml("pms97-logo pms244-clean-logo");
        brand.insertBefore(box, brand.firstChild);
      } else {
        img.classList.add("pms244-clean-logo");
        img.setAttribute("src", img.getAttribute("src") || logoSrc());
        img.setAttribute("alt", "Parmitalia Distribution");
      }
    });
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
    if (!base || base.__pms244Wrapped) return;
    var wrapped = function(innerHtml){
      injectCss();
      return base.call(this, sanitizePrintHtml(innerHtml));
    };
    wrapped.__pms244Wrapped = true;
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
    [100, 400, 1200].forEach(function(ms){ setTimeout(refreshExistingPrintRoot, ms); });
    window.PMS_V244_CLEAN_CUSTOMER_PRINT_LOGO = {
      version: VERSION,
      refresh: refreshExistingPrintRoot,
      sanitize: sanitizePrintHtml
    };
    console.info(VERSION + " loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
