let x = null;
let y = null;
let rx = null;
let ry = null;

document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('mouseenter', onMouseUpdate, false);

function onMouseUpdate(e) {
    x = e.pageX;
    y = e.pageY;
    rx = e.clientX;
    ry = e.clientY;
}

function getMouseX() {
    return x;
}

function getMouseY() {
    return y;
}

function getRelativeMouseX() {
    return rx;
}
function getRelativeMouseY() {
    return ry;
}
