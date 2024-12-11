const { getDocument } = require("pdfjs-dist/legacy/build/pdf");

const url = '';

async function testPdf() {
  let loadingTask = getDocument(url);

  let pdfDoc = await loadingTask.promise;
  const metadata = await pdfDoc.getMetadata();
  console.log('metadata', metadata);
  
  const page = await pdfDoc.getPage(1);
  const viewport = page.getViewport({ scale: 1 });

  // show all text of pdf
  const { items: textItems, styles } = await page.getTextContent();
  console.log('textItems', textItems);
}

testPdf();