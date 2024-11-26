const { fabric } = require('fabric');
const fs = require('fs');
const out = fs.createWriteStream(__dirname + '/test/helloworld.png');
const axios = require('axios');
const tmp = require('tmp');

let json = fs.readFileSync('sample.json', 'utf8');

if (typeof json === 'string') {
  json = JSON.parse(json);
}

const tags = {
    name: "Giang 2 yka",
    test: "test"
}

const { objects } = json;

const workareaTmp = objects.find((obj) => obj.id === 'workarea');
const workareaLeft = workareaTmp.left;
const workareaTop = workareaTmp.top;

let fonts = [
    {
        _id: "6735b93fcddcd830eabf6b9f",
        url: 'https://firebasestorage.googleapis.com/v0/b/pgcustom-staging.appspot.com/o/fonts%2F672dd43e0f098f50f53d5fd6%2Fall%2F1731574075977_tp-enjoy-doodle.otf?alt=media&token=0faab08f-60e0-407a-943b-47091239f221',
        name: 'tp-enjoy-doodle',
        userId: '672dd43e0f098f50f53d5fd6',
        type: 'otf',
    }
]

json.objects = json.objects.map((obj) => {
    if (tags && Object.keys(tags).includes(obj.tag)) {
        if (tags[obj.tag]) {
          obj.text = tags[obj.tag];
        }
      }
    if (obj.type === 'textbox') {
        const newWidth = obj.width * 1.1;
        const widthMinus = newWidth - obj.width;
        if (obj.textAlign === 'center') {
            obj.left = obj.left - widthMinus / 2;
        } else if (obj.textAlign === 'right') {
            obj.left = obj.left - widthMinus;
        } else {
            obj.left = obj.left;
        }
        obj.width = newWidth;
    }
    obj.left = obj.left - workareaLeft;
    obj.top = obj.top - workareaTop;
    return obj;
});


renderFabric();

async function renderFabric() {
    console.log('load');
    console.log('loadFonts', fonts);
    let fontList = [];
    for (let font of fonts) {
        const res = await axios.get(font.url, {
        responseType: 'stream'
        });
    
        const tmpFile = tmp.tmpNameSync();
        const writer = fs.createWriteStream(tmpFile);
        res.data.pipe(writer);
        console.log('tmpFile', tmpFile, font.name);
        await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
        });
    
        fabric.nodeCanvas.registerFont(tmpFile, {
        family: font.name, weight: 'regular', style: 'normal'
        });
        fontList.push(tmpFile);
    }
    var canvas = new fabric.StaticCanvas(null, { width: workareaTmp.width, height: workareaTmp.height });
    
    canvas.loadFromJSON(json, () => {
        canvas.renderAll();
        const stream = canvas.createPNGStream();
        stream.pipe(out);
    });
}