(function(){
  "use strict";

  const VERSION = "PMS-V131-BACKUP-BUTTONS-FIX";

  function appState(){
    try {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
    } catch(e) {}
    window.state = window.state || {};
    return window.state;
  }

  function persist(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState()));
        return true;
      }
    } catch(error) {
      console.warn("Backup non salvato", error);
    }
    return false;
  }

  function redraw(){
    try { if (typeof renderNav === "function") renderNav(); } catch(e) { console.warn(e); }
    try { if (typeof render === "function") render(); } catch(e) { console.warn(e); }
  }

  function downloadJson(filename, data){
    const blob = new Blob([data], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportBackupFixed(event){
    if (event) event.preventDefault();
    const today = new Date().toISOString().slice(0,10);
    downloadJson("parmitalia-backup-" + today + ".json", JSON.stringify(appState(), null, 2));
  }

  function replaceState(data){
    const target = appState();
    Object.keys(target).forEach(key => delete target[key]);
    Object.assign(target, data);
    try { window.state = target; } catch(e) {}
  }

  function importBackupFixed(file){
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(){
      try {
        const data = JSON.parse(String(reader.result || "{}"));
        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("Formato backup non valido");
        }
        if (!confirm("Importare questo backup e sostituire i dati attuali?")) return;
        replaceState(data);
        persist();
        redraw();
        alert("Backup importato correttamente.");
      } catch(error) {
        console.warn(error);
        alert("Backup non importato: file JSON non valido.");
      }
    };
    reader.onerror = function(){
      alert("Backup non importato: impossibile leggere il file.");
    };
    reader.readAsText(file);
  }

  function resetDataFixed(event){
    if (event) event.preventDefault();
    if (typeof resetData === "function") return resetData();
    if (!confirm("Azzerare tutti i dati locali?")) return;
    try {
      if (typeof STORAGE_KEY !== "undefined") localStorage.removeItem(STORAGE_KEY);
      location.reload();
    } catch(error) {
      console.warn(error);
      alert("Impossibile eseguire il reset dati.");
    }
  }

  function ensureVisible(){
    document.querySelectorAll("#export-json,.topbar-actions .import-label,#reset-data").forEach(el => {
      el.classList.remove("pms79-hidden-top-action");
      el.style.removeProperty("display");
      el.style.removeProperty("visibility");
      el.style.removeProperty("opacity");
      el.style.pointerEvents = "auto";
    });
  }

  function bindBackupButtons(){
    ensureVisible();

    const exportButton = document.getElementById("export-json");
    if (exportButton) {
      exportButton.disabled = false;
      exportButton.onclick = exportBackupFixed;
    }

    const importInput = document.getElementById("import-json");
    const importLabel = document.querySelector(".topbar-actions .import-label");

    if (importInput) {
      importInput.disabled = false;
      importInput.onchange = function(event){
        const file = event.target.files && event.target.files[0];
        importBackupFixed(file);
        event.target.value = "";
      };
    }

    if (importLabel) {
      importLabel.onclick = function(event){
        if (event.target === importInput) return;
        event.preventDefault();
        if (importInput) importInput.click();
      };
    }

    const resetButton = document.getElementById("reset-data");
    if (resetButton) {
      resetButton.disabled = false;
      resetButton.onclick = resetDataFixed;
    }
  }

  function injectCss(){
    if (document.getElementById("pms-v131-backup-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v131-backup-style";
    style.textContent = `
      #export-json,
      .topbar-actions .import-label,
      #reset-data{
        display:inline-flex !important;
        visibility:visible !important;
        opacity:1 !important;
        pointer-events:auto !important;
      }
      .topbar-actions .import-label{
        align-items:center;
        justify-content:center;
        min-height:38px;
        cursor:pointer;
      }
    `;
    document.head.appendChild(style);
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !baseRender.__pms131BackupWrapped) {
    render = function(){
      const result = baseRender.apply(this, arguments);
      injectCss();
      setTimeout(bindBackupButtons, 20);
      setTimeout(bindBackupButtons, 120);
      return result;
    };
    render.__pms131BackupWrapped = true;
  }

  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !baseBind.__pms131BackupWrapped) {
    bindPageActions = function(){
      const result = baseBind.apply(this, arguments);
      injectCss();
      setTimeout(bindBackupButtons, 20);
      return result;
    };
    bindPageActions.__pms131BackupWrapped = true;
  }

  injectCss();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindBackupButtons);
  } else {
    bindBackupButtons();
  }
  setTimeout(bindBackupButtons, 100);
  setTimeout(bindBackupButtons, 500);

  window.pmsV131BackupButtonsFix = {
    version: VERSION,
    bind: bindBackupButtons,
    exportBackup: exportBackupFixed,
    importBackup: importBackupFixed
  };
})();
