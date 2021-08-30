const keepPrevious = document.getElementById("keepPreviousIteration");
const colorsToggle = document.getElementById("colorsToggle");
const delayToggle = document.getElementById("delayToggle");
const delaySize = document.getElementById("delaySize");
const slider = document.getElementById("iterationsSlider");
const iterationsText = document.getElementById("iterationsNumber");
const stopButton = document.getElementById("stopButton");

const BOX_SIZE = 10;
const ITERATIONS_LIMIT = 14;

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
    useDifferentColors: false,
    useDelay: false,
    delay: 100,
    totalIterations: 4,
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
    return new Promise((resolve, reject) => {
        if (state.stop) {
            state.stop = false;
            disableControls(false);
            reject();
        }

        if (state.useDelay) {
            setTimeout(() => resolve(), state.delay)
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
    state.useDifferentColors = event.target.checked;
    handler(state);
}

function changeDelayToggle(event) {
    state.useDelay = event.target.checked;
}

function changeDelaySize(event) {
    state.delay = parseInt(event.target.value);
}

function changeSlider(event) {
    state.totalIterations = parseInt(event.target.value);
    iterationsText.innerHTML = state.totalIterations;
    handler(state);
}

function stopButtonClick() {
    state.stop = true;
}

function disableControls(toggle = true) {
    keepPrevious.disabled = toggle;
    colorsToggle.disabled = toggle;
    slider.disabled = toggle;
}

async function handler(state) {
    state.plotter.removeAll();
    state.stop = false;
    disableControls();

    if (state.keepIterations) {
        for (let i = 1; i <= state.totalIterations; ++i) {
            await drawSierpinskiCurve(state, i);
            if (i !== state.totalIterations) {
                await timer(state);
            }
        }
    } else {
        await drawSierpinskiCurve(state, state.totalIterations);
    }

    disableControls(false);
}

async function drawSierpinskiCurve(state, totalIterations) {
    let color = 0;
    if (state.useDifferentColors) {
        color = getColor(totalIterations);
    }

    const triangle1 = [
        {x: 0, y: 0},
        {x: 0, y: state.size},
        {x: state.size, y: state.size}
    ];

    const triangle2 = [
        {x: state.size, y: state.size},
        {x: state.size, y: 0},
        {x: 0, y: 0}
    ];

    let points = getCurvePoints(triangle1, totalIterations);
    points.push(...getCurvePoints(triangle2, totalIterations));

    for (let i = 0, j = 1; j < points.length; ++i, ++j) {
        state.plotter
            .addLine(points[i].x, points[i].y, points[j].x, points[j].y)
            .setColor(color);
        await timer(state);
    }

    state.plotter
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

const colors = {
    1: "#1f77b4",
    2: "#aec7e8",
    3: "#ff7f0e",
    4: "#ffbb78",
    5: "#2ca02c",
    6: "#98df8a",
    7: "#d62728",
    8: "#ff9896",
    9: "#9467bd",
    10: "#ff00ff",
    11: "#ffff00",
    12: "#ff0000",
    13: "#0000ff",
    14: "#000000",
}

function getColor(index) {
    return colors[index];
}
