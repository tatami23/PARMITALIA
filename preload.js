const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("parmitaliaAI", {
  generate(request) {
    return ipcRenderer.invoke("parmitalia-ai-generate", request);
  }
});

contextBridge.exposeInMainWorld("parmitaliaMail", {
  fetchInbox(config) {
    return ipcRenderer.invoke("parmitalia-mail-fetch-inbox", config);
  }
});

contextBridge.exposeInMainWorld("parmitaliaStorage", {
  load() {
    return ipcRenderer.invoke("parmitalia-storage-load");
  },
  save(payload) {
    return ipcRenderer.invoke("parmitalia-storage-save", payload);
  }
});

contextBridge.exposeInMainWorld("parmitaliaPrint", {
  toPdf(payload) {
    return ipcRenderer.invoke("parmitalia-print-to-pdf", payload);
  }
});
