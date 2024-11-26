var PSD = require('psd');
var fs = require('fs');
const jsdom = require("jsdom");
const canvas = require('canvas');
const axios = require('axios');

const { JSDOM } = jsdom;

const dom = new JSDOM(`<body><canvas id="canvas"></canvas></body>`);

const url = 'https://firebasestorage.googleapis.com/v0/b/pgcustom-staging.appspot.com/o/media%2Fall%2F1729503948621_test.psd?alt=media&token=5bf2d620-79e8-49af-ab02-446abe29a09b';

// axios.get(url, {
//   responseType: 'arraybuffer',
// }).then((response) => {

//   const data = new Uint8Array(response.data);

//   const psd = new PSD(data);

//   psd.parse();

//   const tree = psd.tree();

//   fs.writeFileSync('./output.json', JSON.stringify(tree.export(), null, 2));
// });
// return;

var psd = PSD.fromFile('./test.psd');

psd.parse();

var tree = psd.tree();

let data = {
  children: [],
  document: tree.export().document,
};

const invisible = (node) => {
  if (node.parent.name) {
    return invisible(node.parent);
  }
  return node.visible();
}; 

psd.tree().descendants().forEach((node) => {
  if (node.isGroup()) return true;

  let info = node.export();

  if (invisible(node)) {

    // let random = Math.floor(Math.random() * 100000);
    // let imageName = `${random}.png`;
    // node.get('image').saveAsPng(`./images/${imageName}`).catch(function (err) {
    //   console.log(err.stack);
    // });

    const style = node.get('typeTool')?.export() || {};

    if (info?.text?.value) {
      const typeObj = node.get('typeTool');

      const buffer = Buffer.from(typeObj.textData.EngineData);

      require('file-type').fileTypeFromBuffer(buffer).then((type) => {
        console.log(type);
      });
    }

    data.children.push({
      ...info,
      visible: invisible(node),
      // style: style,
    });
    
  }
});

fs.writeFileSync('./output.json', JSON.stringify(data, null, 2));
// fs.writeFileSync('./output.json', JSON.stringify(tree.export(), null, 2));

console.log('loading images...');

// psd.tree().descendants().forEach((node) => {
//   if (node.isGroup()) return true;

//   if (invisible(node)) {
//     let ramdom = Math.floor(Math.random() * 100000);
//     // node.get('objectEffects').saveAsPng(`./images/${ramdom}.png`).catch(function (err) {
//     //   console.log(err.stack);
//     // });

//     const unit8Array = new Uint8ClampedArray(node.get('image').pixelData);

//     var c = dom.window.document.querySelector("canvas");
//     var ctx = c.getContext("2d");
//     c.width = node.get('image').width();
//     c.height = node.get('image').height();
//     console.log(node.get('image').width(), node.get('image').height());
//     var imageData = new canvas.ImageData(unit8Array, node.get('image').width(), node.get('image').height());

//     ctx.putImageData(imageData, 0, 0);

//     var base64 = c.toDataURL('image/png');

//     let image = {
//       name: node.name,
//       data: base64,
//     }
//     fs.writeFileSync(`./json/${ramdom}.json`, JSON.stringify(image, null, 2));
//   }
// });
