(function(){
  "use strict";

  const VERSION = "pms_v188_global_a4_print_table_layout_fix";

  function installCss(){
    let style = document.getElementById("pms-v188-print-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v188-print-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      #print-root .print-document,
      #print-root .pms188-a4-print{
        width:190mm!important;
        max-width:190mm!important;
        min-height:0!important;
        height:auto!important;
        margin:0 auto!important;
        padding:0!important;
        box-sizing:border-box!important;
        color:#0f172a!important;
        font-size:9pt!important;
        line-height:1.24!important;
        overflow:visible!important;
      }
      #print-root .print-header{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) 42mm!important;
        align-items:start!important;
        gap:6mm!important;
        margin:0 0 4mm!important;
        padding:0 0 3mm!important;
        border-bottom:1px solid #334155!important;
        break-inside:avoid!important;
        page-break-inside:avoid!important;
      }
      #print-root .print-header h1{
        margin:0 0 1mm!important;
        font-size:17pt!important;
        line-height:1.05!important;
        letter-spacing:0!important;
        color:#475569!important;
        white-space:normal!important;
        word-break:normal!important;
        overflow-wrap:normal!important;
      }
      #print-root .print-header strong,
      #print-root .print-header span,
      #print-root .print-meta{
        font-size:8.5pt!important;
        line-height:1.2!important;
        white-space:normal!important;
        word-break:normal!important;
        overflow-wrap:anywhere!important;
      }
      #print-root .print-meta{
        text-align:right!important;
      }
      #print-root table.print-table,
      #print-root .print-document table{
        width:100%!important;
        max-width:100%!important;
        table-layout:auto!important;
        border-collapse:collapse!important;
        border-spacing:0!important;
        margin:3mm 0!important;
        page-break-inside:auto!important;
        break-inside:auto!important;
      }
      #print-root table.print-table tr,
      #print-root .print-document table tr{
        break-inside:avoid!important;
        page-break-inside:avoid!important;
      }
      #print-root table.print-table th,
      #print-root .print-document table th{
        writing-mode:horizontal-tb!important;
        text-orientation:mixed!important;
        white-space:normal!important;
        word-break:normal!important;
        overflow-wrap:normal!important;
        hyphens:none!important;
        vertical-align:top!important;
        text-align:left!important;
        min-width:24mm!important;
        width:auto!important;
        max-width:45mm!important;
        padding:1.6mm 2mm!important;
        font-size:8.2pt!important;
        line-height:1.15!important;
        font-weight:900!important;
        color:#0f172a!important;
        background:#f1f5f9!important;
        border:1px solid #cfd8df!important;
      }
      #print-root table.print-table td,
      #print-root .print-document table td{
        writing-mode:horizontal-tb!important;
        text-orientation:mixed!important;
        white-space:normal!important;
        word-break:normal!important;
        overflow-wrap:anywhere!important;
        hyphens:none!important;
        vertical-align:top!important;
        text-align:left!important;
        min-width:0!important;
        padding:1.6mm 2mm!important;
        font-size:8.2pt!important;
        line-height:1.15!important;
        color:#0f172a!important;
        border:1px solid #cfd8df!important;
        background:#fff!important;
      }
      #print-root table.print-table tbody tr > th:first-child,
      #print-root .print-document table tbody tr > th:first-child{
        width:34mm!important;
        min-width:34mm!important;
        max-width:42mm!important;
      }
      #print-root table.print-table tbody tr > th:nth-child(3),
      #print-root .print-document table tbody tr > th:nth-child(3){
        width:28mm!important;
        min-width:28mm!important;
        max-width:38mm!important;
      }
      #print-root table.print-table thead th,
      #print-root .print-document table thead th{
        min-width:0!important;
        width:auto!important;
        max-width:none!important;
        text-align:left!important;
        font-size:7.8pt!important;
        padding:1.4mm!important;
      }
      #print-root .pms184-linear-print table.print-table:not(:has(thead)) tbody,
      #print-root .pms184-linear-print .pms182-doc-main table tbody,
      #print-root .pms184-linear-print .pms179-table table tbody{
        display:table-row-group!important;
      }
      #print-root .pms184-linear-print table.print-table:not(:has(thead)) tr,
      #print-root .pms184-linear-print .pms182-doc-main table tr,
      #print-root .pms184-linear-print .pms179-table table tr{
        display:table-row!important;
      }
      #print-root .pms184-linear-print th,
      #print-root .pms184-linear-print td{
        display:table-cell!important;
      }
      #print-root .print-footer{
        position:static!important;
        margin-top:4mm!important;
        padding-top:2mm!important;
        border-top:1px solid #cfd8df!important;
        font-size:7.5pt!important;
        color:#475569!important;
      }
      #print-root svg,
      #print-root canvas,
      #print-root .barcode-svg,
      #print-root [class*="barcode"]{
        max-width:72mm!important;
        max-height:24mm!important;
        overflow:visible!important;
      }
      @media print{
        @page{size:A4 portrait;margin:9mm}
        html,body{width:210mm!important;min-height:0!important;height:auto!important;overflow:visible!important;background:#fff!important}
        #print-root{position:absolute!important;left:0!important;top:0!important;width:100%!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;overflow:visible!important;background:#fff!important}
        body>*:not(#print-root){display:none!important}
        #print-root .print-document{break-after:auto!important;page-break-after:auto!important}
      }
    `;
  }

  function markPrintRoot(){
    const root = document.getElementById("print-root");
    if (!root) return;
    root.querySelectorAll(".print-document").forEach(doc => {
      doc.classList.add("pms188-a4-print");
      doc.querySelectorAll("th").forEach(th => {
        th.style.writingMode = "horizontal-tb";
        th.style.textOrientation = "mixed";
      });
    });
  }

  function wrapOpenPrint(){
    if (typeof openPrint !== "function" || openPrint.__pms188Wrapped) return;
    const base = openPrint;
    const wrapped = function(html){
      const box = document.createElement("div");
      box.innerHTML = String(html || "");
      box.querySelectorAll(".print-document").forEach(doc => doc.classList.add("pms188-a4-print"));
      box.querySelectorAll("th").forEach(th => {
        th.style.writingMode = "horizontal-tb";
        th.style.textOrientation = "mixed";
      });
      const result = base.call(this, box.innerHTML);
      setTimeout(markPrintRoot, 20);
      setTimeout(markPrintRoot, 160);
      return result;
    };
    wrapped.__pms188Wrapped = true;
    try { openPrint = wrapped; window.openPrint = wrapped; } catch(error) {}
  }

  function wrapPrint(){
    if (window.__pms188PrintWrapped) return;
    window.__pms188PrintWrapped = true;
    const base = window.print;
    window.print = function(){
      installCss();
      markPrintRoot();
      return base.apply(this, arguments);
    };
  }

  function install(){
    installCss();
    wrapOpenPrint();
    wrapPrint();
    markPrintRoot();
    window.PMS_V188_GLOBAL_A4_PRINT_TABLE_LAYOUT_FIX = {version:VERSION, installCss, markPrintRoot};
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, {once:true});
  else install();
  [80, 240, 700, 1400].forEach(ms => setTimeout(install, ms));
})();
