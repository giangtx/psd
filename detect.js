const nlp = require('compromise');

const text = `G USPS GROUND ADVANTAGE U.S. POSTAGE PAID ATFM e-Postage USPS GROUND ADVANTAGE T AGAIN TRADE STORE 11940 CARDINAL MEADOW DR SUGAR LAND TX 77478 12/10/24 Mailed From 77478 WT: 3.00 oz SHIP TO: KATHERINE SARSFIELD 317 COUNTY ROUTE 40 MASSENA NY 13662-3421 USPS TRACKING # EP 9300 1201 1141 2187 8758 50`;

const testDetect = () => {
  const doc = nlp(text);
  
  const places = doc.places().out('array');

  const people = doc.people().out('array');
  console.log(text);
  // get address using regex
  const addressRegex = /\d{1,5}\s[\w\s]+(?:,\s[\w\s]+)+,\s[A-Z]{2}\s\d{5}/g;
  const addresses = text.match(addressRegex);

  const address = addresses;

  console.log('people', people);
  console.log('address', address);

  console.log('places', places);
};

testDetect();