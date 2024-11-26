fetch('./output.json').then((response) => {
    return response.json();
}).then(async(data) => {
    console.log(data);

    let canvas = document.getElementById('canvas');

    let ctx = canvas.getContext('2d');

    let maxWidth = 1000;

    ctx.canvas.width = maxWidth;
    ctx.canvas.height = data.document.height * (maxWidth / data.document.width);

    // sort desc index
    const childrens = data.children.reverse();

    console.log(childrens);

    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    };

    for (let i = 0; i < childrens.length; i++) {
        let child = childrens[i];
        let image = await loadImage(child.image);

        ctx.drawImage(image, child.left * (maxWidth / data.document.width), child.top * (maxWidth / data.document.width), child.width * (maxWidth / data.document.width), child.height * (maxWidth / data.document.width));
    }
});