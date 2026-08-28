(function(){
  "use strict";
  const VERSION = "PMS-V98-PRINT-LAYOUT-FIX";

  function inject(){
    if (document.getElementById("pms-v98-print-layout-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v98-print-layout-style";
    style.textContent = `
      .pms96-print-stage{
        overflow:auto!important;
        background:#dfe7f0!important;
      }
      .pms96-print-sheet{
        width:210mm!important;
        max-width:210mm!important;
        min-height:297mm!important;
        padding:10mm!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
      }
      .pms96-print-sheet .print-document{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        margin:0!important;
        padding:0!important;
        box-sizing:border-box!important;
        overflow:hidden!important;
        color:#0f172a!important;
      }
      .pms96-print-sheet .print-header{
        width:100%!important;
        max-width:100%!important;
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(42mm,72mm)!important;
        gap:7mm!important;
        align-items:start!important;
        box-sizing:border-box!important;
      }
      .pms96-print-sheet .print-header > *,
      .pms96-print-sheet .print-meta{
        min-width:0!important;
        max-width:100%!important;
        box-sizing:border-box!important;
      }
      .pms96-print-sheet .print-header h1{
        font-size:20pt!important;
        line-height:1.08!important;
        margin:0 0 1mm!important;
        overflow-wrap:anywhere!important;
      }
      .pms96-print-sheet .print-meta{
        text-align:right!important;
        font-size:9pt!important;
        overflow-wrap:anywhere!important;
      }
      .pms96-print-sheet .barcode-svg,
      .pms96-print-sheet svg.barcode-svg{
        width:100%!important;
        max-width:72mm!important;
        height:auto!important;
        box-sizing:border-box!important;
      }
      .pms96-print-sheet .print-table,
      .pms96-print-sheet table{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        table-layout:fixed!important;
        border-collapse:collapse!important;
        box-sizing:border-box!important;
        margin:4mm 0!important;
      }
      .pms96-print-sheet .print-table th,
      .pms96-print-sheet .print-table td,
      .pms96-print-sheet table th,
      .pms96-print-sheet table td{
        max-width:0!important;
        padding:2.1mm!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        word-break:break-word!important;
        vertical-align:top!important;
        font-size:9pt!important;
        line-height:1.25!important;
        box-sizing:border-box!important;
      }
      .pms96-print-sheet .pms94-print-note{
        width:100%!important;
        max-width:100%!important;
        box-sizing:border-box!important;
        overflow-wrap:anywhere!important;
      }
      .pms96-print-sheet .pms94-signatures{
        width:100%!important;
        max-width:100%!important;
        grid-template-columns:1fr 1fr!important;
        gap:10mm!important;
        box-sizing:border-box!important;
      }
      .pms96-print-sheet .print-footer{
        position:static!important;
        width:100%!important;
        max-width:100%!important;
        box-sizing:border-box!important;
      }
      @media print{
        @page{size:A4 portrait;margin:8mm}
        html,body{
          width:210mm!important;
          min-height:0!important;
          height:auto!important;
          overflow:visible!important;
          background:#fff!important;
        }
        #print-root{
          width:100%!important;
          max-width:100%!important;
          min-height:0!important;
          height:auto!important;
          padding:0!important;
          margin:0!important;
          overflow:visible!important;
          box-sizing:border-box!important;
        }
        #print-root .print-document{
          width:100%!important;
          max-width:100%!important;
          min-width:0!important;
          min-height:0!important;
          height:auto!important;
          margin:0!important;
          padding:0!important;
          box-sizing:border-box!important;
          overflow:visible!important;
          page-break-after:avoid!important;
          break-after:avoid!important;
          font-size:8.8pt!important;
          line-height:1.22!important;
        }
        #print-root .print-header{
          display:grid!important;
          grid-template-columns:minmax(0,1fr) minmax(38mm,66mm)!important;
          gap:6mm!important;
          width:100%!important;
          max-width:100%!important;
          margin-bottom:3mm!important;
          padding-bottom:2mm!important;
          box-sizing:border-box!important;
        }
        #print-root .print-header h1{
          font-size:15pt!important;
          line-height:1.08!important;
        }
        #print-root .print-meta{
          text-align:right!important;
          font-size:8pt!important;
          overflow-wrap:anywhere!important;
        }
        #print-root .print-table,
        #print-root table{
          width:100%!important;
          max-width:100%!important;
          min-width:0!important;
          table-layout:fixed!important;
          border-collapse:collapse!important;
          margin:2mm 0!important;
          box-sizing:border-box!important;
        }
        #print-root .print-table th,
        #print-root .print-table td,
        #print-root table th,
        #print-root table td{
          max-width:0!important;
          padding:1.35mm!important;
          white-space:normal!important;
          overflow-wrap:anywhere!important;
          word-break:break-word!important;
          vertical-align:top!important;
          font-size:7.7pt!important;
          line-height:1.18!important;
          box-sizing:border-box!important;
        }
        #print-root .barcode-svg,
        #print-root svg.barcode-svg{
          max-width:58mm!important;
          width:100%!important;
          height:auto!important;
        }
        #print-root .pms94-print-note{
          margin:2mm 0!important;
          padding:1.7mm!important;
          font-size:7.7pt!important;
        }
        #print-root .print-footer{
          position:static!important;
          margin-top:2mm!important;
          padding-top:1.5mm!important;
          font-size:7pt!important;
        }
      }
      @media(max-width:900px){
        .pms96-print-sheet{
          width:100%!important;
          max-width:100%!important;
          min-height:0!important;
          padding:10px!important;
        }
        .pms96-print-sheet .print-header{
          grid-template-columns:1fr!important;
        }
        .pms96-print-sheet .print-meta{
          text-align:left!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const baseOpenPrint = typeof openPrint === "function" ? openPrint : null;
  if (baseOpenPrint && !window.__pms98OpenPrintWrapped) {
    window.__pms98OpenPrintWrapped = true;
    openPrint = function(html){
      inject();
      const result = baseOpenPrint.apply(this, arguments);
      setTimeout(inject, 0);
      setTimeout(inject, 80);
      return result;
    };
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms98RenderWrapped) {
    window.__pms98RenderWrapped = true;
    render = function(){
      inject();
      const result = baseRender.apply(this, arguments);
      setTimeout(inject, 0);
      return result;
    };
  }

  inject();
  window.pmsV98PrintLayoutFix = {version:VERSION, inject};
})();
