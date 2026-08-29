(function(){
  "use strict";

  var VERSION = "pms_v199_external_print_preview_fix";
  var lastPrintAt = 0;

  function cleanHtml(value){
    return String(value == null ? "" : value);
  }
  function removeInternalPrintRoot(){
    document.querySelectorAll("#print-root").forEach(function(node){ node.remove(); });
    document.body.classList.remove("pms199-internal-print-visible");
  }
  function normalizeDocument(innerHtml){
    var box = document.createElement("div");
    box.innerHTML = cleanHtml(innerHtml);
    if (!box.querySelector(".print-document")) {
      var wrapper = document.createElement("div");
      wrapper.className = "print-document";
      while (box.firstChild) wrapper.appendChild(box.firstChild);
      box.appendChild(wrapper);
    }
    box.querySelectorAll(".print-document").forEach(function(doc){
      doc.classList.add("pms199-a4-document");
      doc.removeAttribute("style");
    });
    box.querySelectorAll(".card,.table-wrap,.preview-box").forEach(function(node){
      node.classList.add("pms199-print-flat");
    });
    box.querySelectorAll("table").forEach(function(table){
      table.classList.add("print-table");
      table.removeAttribute("style");
    });
    box.querySelectorAll("th,td,p,div,span,strong,small,h1,h2,h3,h4").forEach(function(node){
      node.style.letterSpacing = "0";
      node.style.textShadow = "none";
      node.style.filter = "none";
      node.style.transform = "none";
    });
    return box.innerHTML;
  }
  function printCss(){
    return [
      "@page{size:A4 portrait;margin:9mm}",
      "html,body{margin:0!important;padding:0!important;background:#fff!important;color:#111827!important;width:210mm!important;min-height:297mm!important;overflow:visible!important}",
      "body{font-family:Arial,Helvetica,sans-serif!important;font-size:9pt!important;line-height:1.24!important;-webkit-font-smoothing:antialiased!important;text-rendering:geometricPrecision!important}",
      "*,*::before,*::after{box-sizing:border-box!important;letter-spacing:0!important;text-shadow:none!important;filter:none!important;transform:none!important;box-shadow:none!important}",
      ".pms199-a4-document,.print-document{width:190mm!important;max-width:190mm!important;min-height:0!important;height:auto!important;margin:0 auto!important;padding:0!important;background:#fff!important;color:#111827!important;overflow:visible!important;font-family:Arial,Helvetica,sans-serif!important;font-size:9pt!important;line-height:1.24!important}",
      ".print-header{display:grid!important;grid-template-columns:minmax(0,1fr) 46mm!important;gap:6mm!important;align-items:start!important;border-bottom:1.1pt solid #1f4e78!important;margin:0 0 4mm!important;padding:0 0 3.5mm!important;break-inside:avoid!important;page-break-inside:avoid!important}",
      ".print-header h1{margin:0 0 1mm!important;color:#1f4e78!important;font-size:16pt!important;line-height:1.08!important;font-weight:800!important;white-space:normal!important;overflow-wrap:anywhere!important}",
      ".print-header strong,.print-header span,.print-meta{font-size:8.2pt!important;line-height:1.18!important;color:#475569!important;white-space:normal!important;overflow-wrap:anywhere!important}",
      ".print-meta{text-align:right!important}",
      "h2{font-size:13pt!important;line-height:1.15!important;margin:4mm 0 2mm!important}h3{font-size:11.5pt!important;line-height:1.16!important;margin:3.5mm 0 2mm!important}h4{font-size:10pt!important;line-height:1.16!important;margin:3mm 0 1.5mm!important}",
      "p,div,span,strong,small,li{font-size:inherit!important;line-height:1.24!important;overflow-wrap:anywhere!important;word-break:normal!important}",
      "table,.print-table{width:100%!important;max-width:100%!important;border-collapse:collapse!important;border-spacing:0!important;table-layout:fixed!important;margin:3mm 0!important;background:#fff!important;page-break-inside:auto!important;break-inside:auto!important}",
      "thead{display:table-header-group!important}tfoot{display:table-footer-group!important}tr{break-inside:avoid!important;page-break-inside:avoid!important}",
      "th,td,.print-table th,.print-table td{border:.65pt solid #cbd5e1!important;padding:1.55mm 1.8mm!important;vertical-align:top!important;text-align:left!important;font-size:8pt!important;line-height:1.15!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important;hyphens:none!important;background:#fff!important;color:#111827!important}",
      "th,.print-table th{background:#eff6ff!important;color:#1f2937!important;font-weight:800!important}",
      "tbody tr>th:first-child{width:32mm!important}tbody tr>th:nth-child(3){width:30mm!important}",
      ".print-logo{display:block!important;max-width:38mm!important;max-height:22mm!important;width:auto!important;height:auto!important;object-fit:contain!important;margin:0 0 2mm!important}",
      "img,svg,canvas{max-width:100%!important;height:auto!important;break-inside:avoid!important;page-break-inside:avoid!important;image-rendering:auto!important}",
      ".barcode-svg,[class*='barcode'],[id*='barcode']{max-width:68mm!important;max-height:22mm!important}",
      ".qr-lite,[class*='qr'],[id*='qr']{max-width:28mm!important;max-height:28mm!important}",
      ".pms199-print-flat,.card,.table-wrap,.preview-box{border:0!important;border-radius:0!important;background:#fff!important;padding:0!important;margin:0!important;overflow:visible!important}",
      ".print-footer{position:static!important;margin-top:5mm!important;padding-top:2.5mm!important;border-top:.8pt solid #cbd5e1!important;font-size:7.5pt!important;line-height:1.16!important;color:#64748b!important;break-inside:avoid!important;page-break-inside:avoid!important}",
      ".no-print,.print-actions,button,input,select,textarea{display:none!important}",
      "@media screen{body{padding:12mm!important;background:#eef2f7!important}.pms199-a4-document,.print-document{padding:0!important;background:#fff!important}}",
      "@media print{html,body{background:#fff!important}.pms199-a4-document,.print-document{margin:0 auto!important}}"
    ].join("\n");
  }
  function buildPrintDocument(innerHtml){
    return "<!doctype html><html><head><meta charset=\"utf-8\"><title>Parmitalia stampa PDF</title><style>" + printCss() + "</style></head><body>" + normalizeDocument(innerHtml) + "</body></html>";
  }
  function titleFromHtml(innerHtml){
    var box = document.createElement("div");
    box.innerHTML = cleanHtml(innerHtml);
    var title = box.querySelector(".print-header h1,h1,h2,h3");
    return (title && title.textContent || "Parmitalia PDF").replace(/\s+/g, " ").trim();
  }
  function fallbackIframePrint(html){
    var old = document.getElementById("pms199-print-frame");
    if (old) old.remove();
    var frame = document.createElement("iframe");
    frame.id = "pms199-print-frame";
    frame.setAttribute("title", "Parmitalia stampa");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.border = "0";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
    document.body.appendChild(frame);
    var doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(function(){
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } finally {
        setTimeout(function(){ if (frame.parentNode) frame.remove(); }, 2500);
      }
    }, 180);
  }
  function externalPrint(innerHtml){
    var stamp = Date.now();
    if (stamp - lastPrintAt < 450) return;
    lastPrintAt = stamp;
    removeInternalPrintRoot();
    var html = buildPrintDocument(innerHtml);
    if (window.parmitaliaPrint && typeof window.parmitaliaPrint.toPdf === "function") {
      window.parmitaliaPrint.toPdf({html:html, title:titleFromHtml(innerHtml)}).catch(function(error){
        console.warn(VERSION + " native PDF failed, using fallback", error);
        fallbackIframePrint(html);
      });
      return;
    }
    var printWindow = null;
    try {
      printWindow = window.open("", "parmitalia_print_" + stamp, "popup=yes,width=980,height=820,noopener=no,noreferrer=no");
    } catch(error) {
      printWindow = null;
    }
    if (!printWindow || !printWindow.document) {
      fallbackIframePrint(html);
      return;
    }
    try {
      var printed = false;
      var triggerPrint = function(){
        if (printed) return;
        printed = true;
        try { printWindow.focus(); printWindow.print(); }
        catch(error) { fallbackIframePrint(html); }
      };
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.onload = function(){
        setTimeout(triggerPrint, 120);
      };
      setTimeout(function(){
        try { if (!printWindow.closed) triggerPrint(); }
        catch(error) { fallbackIframePrint(html); }
      }, 450);
    } catch(error) {
      try { if (printWindow && !printWindow.closed) printWindow.close(); } catch(closeError) {}
      fallbackIframePrint(html);
    }
  }
  function installCssGuard(){
    var style = document.getElementById("pms-v199-screen-print-guard");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v199-screen-print-guard";
      document.head.appendChild(style);
    }
    style.textContent = [
      "@media screen{body>#print-root{display:none!important;visibility:hidden!important;position:fixed!important;left:-10000px!important;top:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}}",
      "@media print{#pms199-print-frame{display:none!important}}"
    ].join("\n");
  }
  function install(){
    installCssGuard();
    removeInternalPrintRoot();
    var wrapped = function(innerHtml){ return externalPrint(innerHtml); };
    wrapped.__pms199Wrapped = true;
    try { openPrint = wrapped; } catch(error) {}
    window.openPrint = wrapped;
    if (!window.__pms199WindowPrintWrapped) {
      window.__pms199WindowPrintWrapped = true;
      var basePrint = window.print;
      window.print = function(){
        var root = document.getElementById("print-root");
        if (root && root.innerHTML && window.parmitaliaPrint && typeof window.parmitaliaPrint.toPdf === "function") {
          externalPrint(root.innerHTML);
          return;
        }
        return basePrint.apply(this, arguments);
      };
    }
    window.PMS_V199_EXTERNAL_PRINT_PREVIEW_FIX = {version:VERSION, print:externalPrint, cleanup:removeInternalPrintRoot};
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, {once:true});
  else install();
  [80, 240, 700, 1400].forEach(function(ms){ setTimeout(install, ms); });
  window.addEventListener("afterprint", function(){ setTimeout(removeInternalPrintRoot, 80); });
  console.info(VERSION + " loaded");
})();
