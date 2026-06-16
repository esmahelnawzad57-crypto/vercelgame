/* global Sketchpad, socket, animateCSS */
const canvas = document.getElementById('sketchpad');
const smBrush = document.getElementById('sm-brush');
const mdBrush = document.getElementById('md-brush');
const lgBrush = document.getElementById('lg-brush');
const xlBrush = document.getElementById('xl-brush');
const clearCanvas = document.getElementById('clearCanvas');
const colors = Array.from(document.getElementsByClassName('color'));
const pad = new Sketchpad(canvas, {
    line: {
        size: 5,
    },
    aspectRatio: 5 / 8,
});
const current = {
    lineColor: '#000',
    lineSize: 5,
};
pad.setReadOnly(true);

function setLineSize() {
    if (pad.readOnly) return;
    current.lineSize = Number(this.dataset.linesize);
    pad.setLineSize(Number(this.dataset.linesize));
}

// لۆجیکی وەرگرتنی پۆینتەری سەرەتا (بۆ ماوس و لەمس)
function onMouseDown(e) {
    if (pad.readOnly) return;
    
    // ئەگەر مۆبایل بوو، ڕووداوی لەمس بەکاربهێنە، ئەگەر نا ماوس
    const event = e.touches ? e.touches[0] : e;
    const rect = canvas.getBoundingClientRect();
    const { width: w, height: h } = pad.getCanvasSize();
    
    current.x = (event.clientX - rect.left) / w;
    current.y = (event.clientY - rect.top) / h;
    current.drawing = true; // نیشانەیەک بۆ دەستپێکردنی کێشان
}

// لۆجیکی وەرگرتنی پۆینتەری کۆتایی (بۆ ماوس و لەمس)
function onMouseUp(e) {
    if (pad.readOnly || !current.drawing) return;
    current.drawing = false;

    const event = e.changedTouches ? e.changedTouches[0] : e;
    const rect = canvas.getBoundingClientRect();
    const { width: w, height: h } = pad.getCanvasSize();
    
    socket.emit('drawing', {
        start: {
            x: current.x,
            y: current.y,
        },
        end: {
            x: (event.clientX - rect.left) / w,
            y: (event.clientY - rect.top) / h,
        },
        lineColor: current.lineColor,
        lineSize: current.lineSize,
    });
}

// لۆجیکی جووڵان و کێشانی هێڵ (بۆ ماوس و لەمس)
function onMouseMove(e) {
    if (pad.readOnly || !current.drawing) return;
    
    const event = e.touches ? e.touches[0] : e;
    const { width: w, height: h } = pad.getCanvasSize();
    const rect = canvas.getBoundingClientRect();
    
    socket.emit('drawing', {
        start: {
            x: current.x,
            y: current.y,
        },
        end: {
            x: (event.clientX - rect.left) / w,
            y: (event.clientY - rect.top) / h,
        },
        lineColor: current.lineColor,
        lineSize: current.lineSize,
    });
    
    current.x = (event.clientX - rect.left) / w;
    current.y = (event.clientY - rect.top) / h;
}

// سنووردارکردنی ژمارەی ناردنی داتاکان بۆ سێرڤەر بۆ ڕێگری لە خاوبوونەوە
function throttle(callback, delay) {
    let previousCall = new Date().getTime();
    return (...args) => {
        const time = new Date().getTime();
        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback(...args);
        }
    };
}

colors.forEach((color) => {
    color.addEventListener('click', function () {
        if (pad.readOnly) return;
        current.lineColor = getComputedStyle(this).backgroundColor;
        pad.setLineColor(current.lineColor);
        document.querySelector('.selected-color').style.backgroundColor = current.lineColor;
    }, false);
});

smBrush.addEventListener('click', setLineSize);
mdBrush.addEventListener('click', setLineSize);
lgBrush.addEventListener('click', setLineSize);
xlBrush.addEventListener('click', setLineSize);
clearCanvas.addEventListener('click', () => {
    if (pad.readOnly) return;
    socket.emit('clearCanvas');
    pad.clear();
});

window.addEventListener('resize', () => pad.resize(canvas.offsetWidth));

// 🖥️ ڕووداوەکانی تایبەت بە کۆمپیوتەر (Mouse Events)
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', throttle(onMouseUp, 10));
canvas.addEventListener('mousemove', throttle(onMouseMove, 10));

// 📱 ڕووداوەکانی تایبەت بە مۆبایل (Touch Events)
canvas.addEventListener('touchstart', onMouseDown, { passive: true });
canvas.addEventListener('touchend', throttle(onMouseUp, 10), { passive: true });
canvas.addEventListener('touchmove', throttle(onMouseMove, 10), { passive: true });

socket.on('clearCanvas', () => pad.clear());
socket.on('drawing', ({
    start,
    end,
    lineColor,
    lineSize,
}) => {
    const { width: w, height: h } = pad.getCanvasSize();
    start.x *= w;
    start.y *= h;
    end.x *= w;
    end.y *= h;
    pad.setLineColor(lineColor);
    pad.setLineSize(lineSize);
    pad.drawLine(start, end);
    pad.setLineColor(current.lineColor);
    pad.setLineSize(current.lineSize);
});

socket.on('disableCanvas', async () => {
    pad.setReadOnly(true);
    await animateCSS('#tools', 'fadeOutDown');
    document.querySelector('#tools').classList.add('d-none');
});