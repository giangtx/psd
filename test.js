const { fabric } = require('fabric');
const fs = require('fs');
const out = fs.createWriteStream(__dirname + '/test/helloworld.png');
const { v4: uuid } = require('uuid');
const Image = require('canvas').Image;

let json = fs.readFileSync('sample.json', 'utf8');

if (typeof json === 'string') {
  json = JSON.parse(json);
}

const { objects } = json;

const workareaTmp = objects.find((obj) => obj.id === 'workarea');

var canvas = new fabric.StaticCanvas(null, { width: workareaTmp.width, height: workareaTmp.height });
// const canvas = fabric.createCanvasForNode(200, 200);

// var text = new fabric.Text('Hello world', {
//   left: 100,
//   top: 100,
//   fill: '#f55',
//   angle: 15
// });
// canvas.add(text);
// canvas.renderAll();

const canvasOption = {
  preserveObjectStacking: true,
  width: 300,
  height: 150,
  selection: true,
  defaultCursor: 'default',
  backgroundColor: '#F6F8FA'
};

const keyEvent = {
  move: true,
  all: true,
  copy: true,
  paste: true,
  esc: true,
  del: true,
  clipboard: false,
  transaction: true,
  zoom: true,
  cut: true,
  grab: true
};

const gridOption = {
  enabled: false,
  grid: 10,
  snapToGrid: false,
  lineColor: '#ebebeb',
  borderColor: '#cccccc'
};

const workareaOption = {
  width: 600,
  height: 400,
  workareaWidth: 600,
  workareaHeight: 400,
  lockScalingX: true,
  lockScalingY: true,
  scaleX: 1,
  scaleY: 1,
  backgroundColor: '#fff',
  hasBorders: false,
  hasControls: false,
  selectable: false,
  lockMovementX: true,
  lockMovementY: true,
  hoverCursor: 'default',
  name: '',
  id: 'workarea',
  type: 'image',
  layout: 'fixed', // fixed, responsive, fullscreen
  link: {},
  tooltip: {
    enabled: false
  },
  isElement: false
};

const objectOption = {
  rotation: 0,
  centeredRotation: true,
  strokeUniform: true
};

const guidelineOption = {
  enabled: true
};

const activeSelectionOption = {
  hasControls: true
};

const propertiesToInclude = ['id', 'name', 'locked', 'editable'];

const CanvasObject = {
  group: {
    create: ({objects, ...option}) => new fabric.Group(objects, option)
  },
  'i-text': {
    create: ({text, ...option}) => new fabric.IText(text, option)
  },
  textbox: {
    create: ({text, ...option}) => new fabric.Textbox(text, option)
  },
  triangle: {
    create: (option) => new fabric.Triangle(option)
  },
  circle: {
    create: (option) => new fabric.Circle(option)
  },
  rect: {
    create: (option) => new fabric.Rect(option)
  },
  image: {
    create: ({element = new Image(), ...option}) =>
      new fabric.Image(element, {
        ...option,
        crossOrigin: 'anonymous'
      })
  },
};
const getObjects = () => {
  const objects = canvas.getObjects().filter((obj) => {
    if (obj.id === 'workarea') {
      return false;
    } else if (obj.id === 'grid') {
      return false;
    } else if (obj.superType === 'port') {
      return false;
    } else if (!obj.id) {
      return false;
    }
    return true;
  });
  if (objects.length) {
    objects.forEach(obj => (objectMap[obj.id] = obj));
  } else {
    objectMap = {};
  }
  return objects;
};

const SHARPEN_MATRIX = [0, -1, 0, -1, 5, -1, 0, -1, 0];
const EMBOSS_MATRIX = [1, 1, 1, 1, 0.7, -1, -1, -1, -1];
const createFilters = (filters = []) => {
  return filters.reduce((prev, filter) => {
    let type = filter.type;
    if (type.toLowerCase() === 'convolute' && isEqual(filter.matrix, SHARPEN_MATRIX)) {
      type = 'sharpen';
    } else if (type.toLowerCase() === 'convolute' && isEqual(filter.matrix, EMBOSS_MATRIX)) {
      type = 'emboss';
    }
    const findIndex = FILTER_TYPES.findIndex(filterType => type.toLowerCase() === filterType);
    if (findIndex > -1) {
      prev[findIndex] = createFilter({
        ...filter,
        type,
      });
    }
    return prev;
  }, []);
}

const loadCanvasImageFormUrl = (src) => {
  return new Promise(resolve => {
    fabric.Image.fromURL(src, (img) => {
      resolve(img);
    }, { crossOrigin: 'anonymous' });
  })
}


const addImage = async (obj) => {
  const { filters = [], src, file, ...otherOption } = obj;
  const image = new Image();
  // if (typeof src === 'string') {
  // 	image.src = src;
  // }
  const createdObj = new fabric.Image(image, {
    ...objectOption,
    ...otherOption,
  });
  createdObj.set({
    filters: createFilters(filters),
  });
  await setImage(createdObj, src || file);
  
  return createdObj;
};

const setImage = (
  obj,
  source,
  keepSize,
  options
) => {
  const { height, scaleY } = obj;
  const renderCallbaack = (imgObj, src) => {
    if (keepSize) {
      const scale = (height * scaleY) / imgObj.height;
      imgObj.set({ scaleY: scale, scaleX: scale, src });
    }
    canvas.requestRenderAll();
  };
  return new Promise(resolve => {
    if (!source) {
      obj.set('file', null);
      obj.set('src', null);
      resolve(
        obj.setSrc(
          '',
          (imgObj) => renderCallbaack(imgObj, null),
          {
            dirty: true,
            ...options,
          },
        ),
      );
    }
    // if (source instanceof File) {
    //   const reader = new FileReader();
    //   reader.onload = () => {
    //     obj.set('file', source);
    //     obj.set('src', null);
    //     resolve(
    //       obj.setSrc(
    //         reader.result,
    //         (imgObj) => renderCallbaack(imgObj, reader.result),
    //         {
    //           dirty: true,
    //           ...options,
    //         },
    //       ),
    //     );
    //   };
    //   reader.readAsDataURL(source);
    // } else {
      obj.set('file', null);
      obj.set('src', source);
      resolve(
        obj.setSrc(source, (imgObj) => renderCallbaack(imgObj, source), {
          dirty: true,
          crossOrigin: 'anonymous',
          ...options,
        }),
      );
    // }
  });
};

const setByPartial = (obj, option) => {
  if (!obj) {
    return;
  }
  if (obj.type === 'svg') {
    if (option.fill) {
      obj.setFill(option.fill);
    } else if (option.stroke) {
      obj.setStroke(option.stroke);
    }
  }
  obj.set(option);
  obj.setCoords();
  canvas.renderAll();
  const { id, superType, type, player, width, height } = obj;
  if (superType === 'element') {
    if ('visible' in option) {
      if (option.visible) {
        obj.element.style.display = 'block';
      } else {
        obj.element.style.display = 'none';
      }
    }
  }
};

const add = async (obj, centered = true, loaded = false, group = false) => {
  const editable = false;
  const option = {
    hasControls: editable,
    hasBorders: editable,
    selectable: editable,
    lockMovementX: !editable,
    lockMovementY: !editable,
    hoverCursor: !editable ? 'pointer' : 'move',
  };
  if (obj.type === 'i-text') {
    option.editable = false;
  } else {
    option.editable = editable;
  }
  if (editable && workareaOb.layout === 'fullscreen') {
    option.scaleX = workareaOb.scaleX;
    option.scaleY = workareaOb.scaleY;
  }
  const newOption = Object.assign(
    {},
    objectOption,
    obj,
    {
      // container: this.container.id,
      container: uuid(),
      editable,
    },
    option,
  );
  // Individually create canvas object
  let createdObj;
  // Create canvas object
  if (obj.type === 'image') {
    createdObj = await addImage(newOption);
    console.log(createdObj);
    // console.log(createdObj);
  } else if (obj.type === 'group') {
    createdObj = await addGroup(newOption);
  } else {
    createdObj = CanvasObject[obj.type].create(newOption);
  }
  if (group) {
    return createdObj;
  }
  canvas.add(createdObj);
  // objects = getObjects();
  // if (!editable && !(obj.superType === 'element')) {
  // 	createdObj.on('mousedown', this.eventHandler.object.mousedown);
  // }
  // if (createdObj.dblclick) {
  // 	createdObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
  // }
  if (obj.superType !== 'drawing' && obj.superType !== 'link' && editable && !loaded) {
    if (centered) {
      canvas.centerObject(obj);
      obj.setCoords();
    } else {
      setByPartial(obj, {
        left:
        obj.left / canvas.getZoom() -
        obj.width / 2 -
        canvas.viewportTransform[4] / canvas.getZoom(),
      top:
        obj.top / canvas.getZoom() -
        obj.height / 2 -
        canvas.viewportTransform[5] / canvas.getZoom(),
      })
    }
  }
  if (createdObj.superType === 'node') {
    // this.portHandler.create(createdObj);
    if (createdObj.iconButton) {
      canvas.add(createdObj.iconButton);
    }
  }
  if (createdObj.superType === 'node') {
    createdObj.set('shadow', {
      color: createdObj.stroke,
    });
  }
  // if (gridOption.enabled) {
  // 	this.gridHandler.setCoords(createdObj);
  // }
  // if (!this.transactionHandler.active && !loaded) {
  // 	this.transactionHandler.save('add');
  // }
  // if (onAdd && editable && !loaded) {
  // 	onAdd(createdObj);
  // }
  return createdObj;
};

const addGroup = async (obj) => {
  const { objects = [], ...other } = obj;
  const _objects = objects.map(async (child) => await add(child, false, true, true));
  return new fabric.Group(_objects, other);
};

const importJson = async (json, canvas) => {
  if (typeof json === 'string') {
    json = JSON.parse(json);
  }

  let prevLeft = 0;
  let prevTop = 0;

  canvas.setBackgroundColor(canvasOption.backgroundColor, canvas.renderAll.bind(canvas));

  const workarea = json.find((obj) => obj.id === 'workarea');

  // const image = new Image(workareaOption.width, workareaOption.height);
  // image.width = workareaOption.width;
  // image.height = workareaOption.height;

  const workareaOb = new fabric.Image(null, workareaOption);
  canvas.add(workareaOb);
  const objects = getObjects();
  canvas.centerObject(workareaOb);
  canvas.renderAll();
  
  prevLeft = workarea.left;
  prevTop = workarea.top;
  workareaOb.set(workarea);

  const loaded = true;

  const imageFromUrl = async (src) => {
    return new Promise(resolve => {
      fabric.Image.fromURL(src, (img) => {
        let width = canvas.getWidth();
        let height = canvas.getHeight();
        if (workareaOb.layout === 'fixed') {
          width = workareaOb.width * workareaOb.scaleX;
          height = workareaOb.height * workareaOb.scaleY;
        }
        let scaleX = 1;
        let scaleY = 1;
        if (img._element) {
          scaleX = width / img.width;
          scaleY = height / img.height;
          img.set({
            originX: 'left',
            originY: 'top',
            scaleX,
            scaleY,
          });
          workareaOb.set({
            ...img,
            isElement: true,
            selectable: false,
          });
        } else {
          // workarea.setElement(new Image());
          workareaOb.set({
            width,
            height,
            scaleX,
            scaleY,
            isElement: false,
            selectable: false,
          });
        }
        canvas.centerObject(workareaOb);
        const editable = false;
        if (editable && !loaded) {
          const { layout } = workareaOb;
          canvas.getObjects().forEach((obj) => {
          });
        }
        const center = canvas.getCenter();
        const zoom = loaded || workareaOb.layout === 'fullscreen' ? 1 : canvas.getZoom();
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        // this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
        canvas.renderAll();
        resolve(workareaOb);
      }, { crossOrigin: 'anonymous' });
    });
  };

  
  await imageFromUrl(workarea.src);

  workareaOb.setCoords();

  json.forEach(async (obj) => {
    if (obj.id === 'workarea') {
    } else {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
  
      const { width, height, scaleX, scaleY, layout, left, top } = workareaOb;
  
      if (layout === 'fullscreen') {
        const leftRatio = canvasWidth / (width * scaleX);
        const topRatio = canvasHeight / (height * scaleY);
        obj.left *= leftRatio;
        obj.top *= topRatio;
        obj.scaleX *= leftRatio;
        obj.scaleY *= topRatio;
      } else {
        const diffLeft = left - prevLeft;
        const diffTop = top - prevTop;
        obj.left += diffLeft;
        obj.top += diffTop;
      }
      if (obj.superType === 'element') {
        obj.id = uuid();
      }
      await add(obj, false, true);
      canvas.renderAll();
    }
  });
};

importJson(objects, canvas).then(() => {
  var stream = canvas.createPNGStream();
  stream.on('data', function(chunk) {
    out.write(chunk);
  });
});