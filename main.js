const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true, // Habilitar la integración de Node.js
      contextIsolation: false, // Deshabilitar el aislamiento del contexto
    },
  });

  win.loadFile("index.html");
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Función para generar el PDF
async function generatePDF(data, templatePath, outputPath) {
  try {
    // Leer la plantilla PDF
    const existingPdfBytes = fs.readFileSync(templatePath);

    // Cargar el documento PDF existente
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Insertar los datos en el PDF
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Concatenar el nombre completo
    const nombreCompleto = `${data.nombre} ${data.apellidoPaterno} ${data.apellidoMaterno}`;

    firstPage.drawText(nombreCompleto, {
      x: 250, // Ajusta esta coordenada para nombre
      y: 320,
      size: 24,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(data.codigo, {
      x: 600, // Ajusta esta coordenada para el codigo
      y: 200,
      size: 24,
      color: rgb(0, 0, 0),
    });

    // Serializar el PDFDocument a bytes (un Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Guardar el PDF modificado
    fs.writeFileSync(outputPath, pdfBytes);
    console.log("PDF generado exitosamente");
  } catch (error) {
    console.error("Error generando el PDF:", error);
  }
}

// Manejar el evento de generación de PDF desde el proceso de renderizado
ipcMain.on("generate-pdf", async (event, { data, tipoConstancia }) => {
  const templatePath = path.resolve(
    __dirname,
    `src/templates/${tipoConstancia}.pdf`
  );
  const outputPath = path.resolve(
    __dirname,
    `src/output/${data.nombreArchivo}.pdf`
  );

  await generatePDF(data, templatePath, outputPath);

  event.reply("pdf-generated", "PDF generado exitosamente");
});
