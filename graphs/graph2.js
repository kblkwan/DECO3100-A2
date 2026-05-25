const fishStockFile = "data/fish-stocks-relative-to-the-maximum-sustainable-yield.csv";
const fishStockColumn = "Total biomass relative to maximum sustainable yield";
const fishStockColors = ["#636efa", "#ef553b", "#00cc96", "#ab63fa", "#ffa15a", "#19d3f3"];
let fishStockData = [];

function getEntities(data) {
    return [...new Set(data.map(row => row.Entity))];
}

function makeTrace(data, entity, color) {
    const entityData = data.filter(row => row.Entity === entity);

    return {
        x: entityData.map(row => row.Year),
        y: entityData.map(row => parseFloat(row[fishStockColumn])),
        mode: "lines",
        name: entity,
        line: {
            color: color
        }
    };
}

function makeLayout() {
    return {
        title: {
            text: "<b>Fish Stocks Relative to Maximum Sustainable Yield</b>",
            x: 0.5
        },
        xaxis: {
            title: "Year",
            showgrid: false,
            fixedrange: true
        },
        yaxis: {
            title: "Relative to maximum sustainable yield",
            fixedrange: true
        },
        shapes: [{
            type: "line",
            xref: "paper",
            x0: 0,
            x1: 1,
            y0: 1,
            y1: 1,
            line: {
                color: "#111827",
                width: 2,
                dash: "dash"
            }
        }],
        annotations: [{
            xref: "paper",
            x: 1,
            y: 1,
            text: "Sustainable level",
            showarrow: false,
            xanchor: "right",
            yanchor: "bottom"
        }],
        showlegend: false,
        plot_bgcolor: "#ffffff",
        paper_bgcolor: "#f9fafb",
        margin: { t: 70, l: 70, r: 30, b: 70 }
    };
}

function getSelectedEntities() {
    return [...document.querySelectorAll("#fish-controls input:checked")]
        .map(checkbox => checkbox.value);
}

function makeCheckbox(entity, color, checked) {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const swatch = document.createElement("span");

    checkbox.type = "checkbox";
    checkbox.value = entity;
    checkbox.checked = checked;
    checkbox.addEventListener("change", drawGraph);

    swatch.className = "line-colour";
    swatch.style.backgroundColor = color;

    label.appendChild(checkbox);
    label.appendChild(swatch);
    label.append(" " + entity);

    return label;
}

function drawControls(data) {
    const controls = document.getElementById("fish-controls");
    const entities = getEntities(data);

    entities.forEach((entity, index) => {
        controls.appendChild(makeCheckbox(entity, fishStockColors[index], index === 0));
    });
}

function drawGraph() {
    const entities = getEntities(fishStockData);
    const selectedEntities = getSelectedEntities();
    const traces = entities
        .map((entity, index) => ({ entity, color: fishStockColors[index] }))
        .filter(item => selectedEntities.includes(item.entity))
        .map(item => makeTrace(fishStockData, item.entity, item.color));

    Plotly.newPlot("graph2", traces, makeLayout(), { responsive: true });
}

d3.csv(fishStockFile).then(data => {
    fishStockData = data;
    drawControls(data);
    drawGraph();
});
