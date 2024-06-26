const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  generatePDF: (data, tipoConstancia) =>
    ipcRenderer.send("generate-pdf", { data, tipoConstancia }),
  onPDFGenerated: (callback) => ipcRenderer.on("pdf-generated", callback),
});
