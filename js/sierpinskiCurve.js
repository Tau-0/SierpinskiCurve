const checkbox = document.getElementById("keepPreviousIteration");
const slider = document.getElementById('iterationsSlider');
const iterationsText = document.getElementById('iterationsNumber');

let keepIterations = false;
let iterationsNumber = 4;

checkbox.addEventListener('change', changeCheckbox)
slider.addEventListener('change', changeSlider)

const BOX_SIZE = 10;
let plotter = new Plotter("plot", {
    left: 0,
    right: BOX_SIZE,
    bottom: 0,
    top: BOX_SIZE,
    width: 800,
    height: 800
});
handler(BOX_SIZE, iterationsNumber, keepIterations, plotter);

function changeCheckbox(event) {
    keepIterations = event.target.checked;
    handler(BOX_SIZE, iterationsNumber, keepIterations, plotter);
}

function changeSlider(event) {
    iterationsNumber = parseInt(event.target.value);
    iterationsText.innerHTML = iterationsNumber;
    handler(BOX_SIZE, iterationsNumber, keepIterations, plotter);
}

function getTriangleCentroid(v1, v2, v3) {
    const x = (v1.x + v2.x + v3.x) / 3;
    const y = (v1.y + v2.y + v3.y) / 3;
    return {x: x, y: y};
}

function getMiddlePoint(v1, v2) {
    const x = (v1.x + v2.x) / 2;
    const y = (v1.y + v2.y) / 2;
    return {x: x, y: y};
}

function handler(size, maxIterations, keepIterations, plotter) {
    plotter.removeAll();

    if (keepIterations) {
        for (let i = 0; i <= maxIterations; ++i) {
            drawSierpinskiCurve(size, i, plotter);
        }
    } else {
        drawSierpinskiCurve(size, maxIterations, plotter)
    }
}

function drawSierpinskiCurve(size, maxIterations, plotter) {
    const triangle1 = [
        {x: 0, y: 0},
        {x: 0, y: size},
        {x: size, y: size}
    ];

    const triangle2 = [
        {x: size, y: size},
        {x: size, y: 0},
        {x: 0, y: 0}
    ];

    const half1 = getCurvePoints(triangle1, maxIterations);
    const half2 = getCurvePoints(triangle2, maxIterations);
    const points = [...half1, ...half2];

    for (let i = 0, j = 1; j < points.length; ++i, ++j) {
        plotter.addLine(points[i].x, points[i].y, points[j].x, points[j].y);
    }
    plotter.addLine(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
}

function getCurvePoints(triangle, currentIteration) {
    const points = [];
    if (currentIteration == 0) {
        points.push(getTriangleCentroid(...triangle));
    } else {
        const [v1, v2, v3] = triangle;
        const triangle1 = [v1, getMiddlePoint(v1, v3), v2];
        const triangle2 = [v2, getMiddlePoint(v1, v3), v3];
        points.push(...getCurvePoints(triangle1, currentIteration - 1));
        points.push(...getCurvePoints(triangle2, currentIteration - 1));
    }

    return points;
}
