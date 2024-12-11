const { createWorker } = require('tesseract.js');
const nlp = require('compromise');

async function testTesseract() {
  const worker = await createWorker('eng');

  const ret = await worker.recognize('./testpdf.png');

  const text = ret.data.text;

  await worker.terminate();

  const doc = nlp(text);

  const places = doc.places().out('array');
  const people = doc.people().out('array');
  console.log(text);

  // get address using regex

  const address = parseAddress(text);

  console.log('people', people);
  console.log('address', address);
}

testTesseract();
function parseAddress(addressString) {
  // First, try to find the "TO:" section and everything after it
  let addressPart = addressString;
  const toMatch = addressString.match(/TO:\s*(.*?)(?=\*|USPS|$)/i);
  if (toMatch) {
    addressPart = toMatch[1].trim();
  } else {
    // If no "TO:", try to find a pattern that looks like an address
    const addressMatch = addressString.match(/\d+\s+[A-Z\s]+(?:ROUTE|RD|ST|AVE|BLVD|LN|DR|CT|PL|CIR)\.?\s+\d*\s*[A-Z\s]+,?\s+[A-Z]{2}\s+\d{5}(-\d{4})?/i);
    if (addressMatch) {
      addressPart = addressMatch[0];
    }
  }

  // Remove any trailing asterisks or special characters
  addressPart = addressPart.replace(/\*.*$/, '').trim();

  // Split the address into parts
  const parts = addressPart.split(/[,\n]/);
  
  let address, city, state, zip;
  
  if (parts.length > 1) {
    // Case with comma or newline
    address = parts[0].trim();
    const lastPart = parts[parts.length - 1].trim();
    const matches = lastPart.match(/([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/);
    if (matches) {
      state = matches[1];
      zip = matches[2];
      city = parts[parts.length - 1].replace(matches[0], '').trim();
    }
  } else {
    // Case without comma
    const stateZipMatch = addressPart.match(/([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/);
    if (stateZipMatch) {
      state = stateZipMatch[1];
      zip = stateZipMatch[2];
      const beforeStateZip = addressPart.slice(0, addressPart.indexOf(stateZipMatch[0])).trim();
      const words = beforeStateZip.split(' ');
      city = words.pop(); // Last word before state is city
      address = words.join(' '); // Rest is address
    }
  }
  
  return {
    address,
    city,
    state,
    zip
  };
}
// const examples = [
//   `G ADVANTAGE U.S. POSTAGE PAID ATFM e-Postage AGAIN TRADE STORE 12/10/24 Sch Eom on topo Tar SHIP KATHERINE SARSFIELD TO: 317 COUNTY ROUTE 40 MASSENA NY 13662-3421 _________________________________________________________ USPS TRACKING # EP 9300 1201 1141 2187 8758 50 a`, // Trường hợp có TO:
//   "123 Main St, Los Angeles CA 90001", // Trường hợp có dấu phẩy
//   "456 Elm Rd Springfield IL 62704-2345", // Trường hợp không có dấu phẩy
//   "Random text 789 Pine St, Denver CO 80203" // Địa chỉ trong đoạn văn bản lớn
// ];

// // Chạy thử từng ví dụ
// examples.forEach((example, index) => {
//   console.log(`Example ${index + 1}:`, parseAddress(example));
// });