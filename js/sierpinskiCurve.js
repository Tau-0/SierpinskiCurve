const keepPrevious = document.getElementById("keepPreviousIteration");
const colorsToggle = document.getElementById("colorsToggle");
const delayToggle = document.getElementById("delayToggle");
const delaySize = document.getElementById("delaySize");
const slider = document.getElementById("iterationsSlider");
const iterationsText = document.getElementById("iterationsNumber");
const stopButton = document.getElementById("stopButton");

const BOX_SIZE = 10;
const ITERATIONS_LIMIT = 12;

const plotter = new Plotter("plot", {
    left: 0,
    right: BOX_SIZE,
    bottom: 0,
    top: BOX_SIZE,
    width: 800,
    height: 800
});

const state = {
    size: BOX_SIZE,
    keepIterations: false,
    differentColors: false,
    useDelay: false,
    delay: 100,
    iterationsNumber: 4,
    stop: false,
    plotter,
};

handler(state);

keepPrevious.addEventListener("change", changeKeepPrevious);
colorsToggle.addEventListener("change", changeColorsToggle);
delayToggle.addEventListener("change", changeDelayToggle);
delaySize.addEventListener("change", changeDelaySize);
slider.addEventListener("change", changeSlider);
stopButton.addEventListener("click", stopButtonClick);

function timer(state) {
    const { stop, delay, useDelay } = state;
    return new Promise((resolve, reject) => {
        if (stop) {
            state.stop = false;
            disableControls(false);
            reject();
        }

        if (useDelay) {
            setTimeout(() => resolve(), delay)
        } else {
            resolve();
        }
    });
}

function changeKeepPrevious(event) {
    state.keepIterations = event.target.checked;
    handler(state);
}

function changeColorsToggle(event) {
    state.differentColors = event.target.checked;
    handler(state);
}

function changeDelayToggle(event) {
    state.useDelay = event.target.checked;
}

function changeDelaySize(event) {
    state.delay = parseInt(event.target.value);
}

function changeSlider(event) {
    state.iterationsNumber = parseInt(event.target.value);
    iterationsText.innerHTML = state.iterationsNumber;
    handler(state);
}

function stopButtonClick() {
    state.stop = true;
}

async function handler() {
    const {
        size,
        iterationsNumber,
        keepIterations,
        plotter,
    } = state;

    plotter.removeAll();
    state.stop = false;
    disableControls();

    if (keepIterations) {
        for (let i = 1; i <= iterationsNumber; ++i) {
            await drawSierpinskiCurve(size, i, state);
            if (i !== iterationsNumber) {
                await timer(state);
            }
        }
    } else {
        await drawSierpinskiCurve(size, iterationsNumber, state)
    }

    disableControls(false);
}

function disableControls(toggle = true) {
    keepPrevious.disabled = toggle;
    colorsToggle.disabled = toggle;
    slider.disabled = toggle;
}

async function drawSierpinskiCurve(size, maxIterations, state) {
    const {plotter} = state;
    let color = 0;
    if (state.differentColors) {
        color = maxIterations === ITERATIONS_LIMIT
            ? 1
            : (maxIterations - 1) * 2;
    }

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
        plotter
            .addLine(points[i].x, points[i].y, points[j].x, points[j].y)
            .setColor(color);
        await timer(state);
    }

    plotter
        .addLine(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y)
        .setColor(color);
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
