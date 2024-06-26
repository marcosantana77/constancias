const { ipcRenderer } = require("electron");

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nombre: document.querySelector('input[placeholder="Nombres"]').value,
    apellidoPaterno: document.querySelector('input[placeholder="Apellido Paterno"]').value,
    apellidoMaterno: document.querySelector('input[placeholder="Apellido Materno"]').value,
    codigo: document.querySelector('input[placeholder="Código"]').value,
    nombreArchivo: document.querySelector('input[placeholder="Nombre del Archivo"]').value,
  };

  const tipoConstancia = document.querySelector(".constancia-select").value;

  // Enviar los datos al proceso principal
  ipcRenderer.send("generate-pdf", { data, tipoConstancia });

  // Capturar la respuesta del proceso principal
  ipcRenderer.once("pdf-generated", (event, message) => {
    console.log(message);
  });
});
