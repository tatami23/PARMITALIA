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
