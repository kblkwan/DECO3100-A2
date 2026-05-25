const fishStockFile4 = "data/fish-stocks-relative-to-the-maximum-sustainable-yield.csv";
const fishStockColumn4 = "Total biomass relative to maximum sustainable yield";
const profileColors = ["#0f766e", "#2563eb", "#9333ea", "#dc2626", "#ea580c", "#4d7c0f"];
let fishRows4 = [];
let selectedFish = "";

const fishInfo = {
    "Albacore tuna Northern Atlantic": {
        fish: "Albacore tuna",
        region: "Northern Atlantic"
    },
    "Japanese sardine Pacific Coast of Japan": {
        fish: "Japanese sardine",
        region: "Pacific Coast of Japan"
    },
    "Peruvian anchoveta North-Central Peruvian coast": {
        fish: "Peruvian anchoveta",
        region: "North-Central Peruvian coast"
    },
    "Red snapper Southern Atlantic coast": {
        fish: "Red snapper",
        region: "Southern Atlantic coast"
    },
    "Spanish mackerel Southern Atlantic coast": {
        fish: "Spanish mackerel",
        region: "Southern Atlantic coast"
    },
    "Tanner crab Bering Sea and Aleutian Islands": {
        fish: "Tanner crab",
        region: "Bering Sea and Aleutian Islands"
    }
};

const fishKeyEvents = {
    "Albacore tuna Northern Atlantic": [
        "1950–1970: Industrial fishing expansion",
        "1972–1976: Ocean warming shifts migration patterns",
        "2000–present: Government introduced catch limits and protected areas"
    ],
    "Japanese sardine Pacific Coast of Japan": [
        "1975–1988: Favourable currents and ocean conditions lead to population boom",
        "1988–1995: Ocean temperature shifts causing population collapse",
    ],
    "Peruvian anchoveta North-Central Peruvian coast": [
        "1972–1973: El Niño caused marine heatwaves which sparked population collapse",
        "1970s: Heavy industrial fishing accelerated population decline",
        "1990s–present: Government implemented stricter fishery management and monitoring programs"
    ],
    "Red snapper Southern Atlantic coast": [
        "1950s–1980s: Intensive commercial and recreational fishing causes population to rapidly decline",
        "1990s: Fishing restrictions and quotas introduced but population stuggles to recover",
    ],
    "Spanish mackerel Southern Atlantic coast": [
        "1970s–1980s: Spanish mackerel stocks experienced a massive surge in commercial fishing",
        "1980s–1990s: Catch limits and seasonal closures implemented",
        "2001–present: Population recovers to sustainable levels"
    ],
    "Tanner crab Bering Sea and Aleutian Islands": [
        "1960–1973: Favourable ocean conditions allowed population to thrive",
        "1978–1985: Overfishing causes population collapse",
        "1985–1991: Bitter Crab Disease",
    ]
};

// Converts the CSV into simple rows with numbers.
function cleanFishRows(data) {
    return data
        .map(row => ({
            entity: row.Entity,
            year: parseInt(row.Year),
            stock: parseFloat(row[fishStockColumn4])
        }))
        .filter(row => row.entity !== "Entity" && !isNaN(row.year) && !isNaN(row.stock));
}

// Gets every fish name from the dataset.
function getFishNames() {
    return [...new Set(fishRows4.map(row => row.entity))];
}

// Gets all rows for one fish.
function getFishRows(entity) {
    return fishRows4.filter(row => row.entity === entity);
}

// Finds the most recent data point for the selected fish.
function getCurrentStock(entity) {
    const rows = getFishRows(entity);
    return rows[rows.length - 1];
}

// Creates the fish selector buttons at the top.
function drawFishTabs() {
    const tabs = document.getElementById("fish-profile-tabs");

    tabs.innerHTML = getFishNames().map(entity => {
        const activeClass = entity === selectedFish ? " active" : "";

        return `<button class="fish-tab${activeClass}" data-fish="${entity}" type="button">${fishInfo[entity].fish}</button>`;
    }).join("");

    document.querySelectorAll(".fish-tab").forEach(button => {
        button.addEventListener("click", () => {
            selectedFish = button.dataset.fish;
            drawProfile();
        });
    });
}

// Draws the left information panel.
function drawFishInfo() {
    const info = fishInfo[selectedFish];
    const current = getCurrentStock(selectedFish);
    const status = current.stock >= 1 ? "At or above sustainable level" : "Below sustainable level";
    const keyEvents = fishKeyEvents[selectedFish];

    document.getElementById("fish-profile-info").innerHTML = `
        <div class="fish-title-row">
            <div>
                <div class="fish-region">${info.region}</div>
                <h2>${info.fish}</h2>
            </div>
            <button id="fish-info-button" class="fish-info-button" type="button" aria-expanded="false" aria-label="Explain this data">i</button>
        </div>
        <div id="fish-explanation" class="fish-explanation">
            This graph compares current fish biomass to the maximum sustainable yield (MSY), where 1 represents the optimal population level for sustainable fishing without long-term decline. A value above 1 means the fish stock is at or above the sustainable level, while a value below 1 indicates overfishing and potential ecological risks. 
        </div>
        <div class="current-stock">
            <span>Current fish stock</span>
            <strong>${current.stock.toFixed(2)}</strong>
            <em>${status}</em>
        </div>
        <div class="key-events">
            <h3>Key events</h3>
            <ul>
                ${keyEvents.map(event => `<li>${event}</li>`).join("")}
            </ul>
        </div>
    `;

    setupInfoButton();
}

// Draws the clean line chart for the selected fish.
function drawSelectedChart() {
    const rows = getFishRows(selectedFish);

    const trace = {
        x: rows.map(row => row.year),
        y: rows.map(row => row.stock),
        mode: "lines",
        line: {
            color: "#0f766e",
            width: 3
        },
        hovertemplate: "%{x}<br>Stock: %{y:.2f}<extra></extra>"
    };

    const layout = {
        title: "",
        showlegend: false,
        xaxis: {
            title: "Year",
            showgrid: false,
            fixedrange: true
        },
        yaxis: {
            title: "Relative to sustainable yield",
            gridcolor: "#e5e7eb",
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
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#ffffff",
        margin: { t: 30, l: 64, r: 24, b: 56 }
    };

    Plotly.newPlot("graph4", [trace], layout, {
        responsive: true,
        displayModeBar: false
    });
}

// Gets the fish selected in the comparison checkboxes.
function getSelectedCompareFish() {
    return [...document.querySelectorAll("#graph4-compare-controls input:checked")]
        .map(checkbox => checkbox.value);
}

// Creates one checkbox row for the comparison chart.
function makeCompareCheckbox(entity, color, checked) {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const swatch = document.createElement("span");

    checkbox.type = "checkbox";
    checkbox.value = entity;
    checkbox.checked = checked;
    checkbox.addEventListener("change", drawCompareChart);

    swatch.className = "line-colour";
    swatch.style.backgroundColor = color;

    label.appendChild(checkbox);
    label.appendChild(swatch);
    label.append(" " + fishInfo[entity].fish);

    return label;
}

// Draws the checkbox legend for the comparison chart.
function drawCompareControls() {
    const controls = document.getElementById("graph4-compare-controls");

    controls.innerHTML = "";
    getFishNames().forEach((entity, index) => {
        controls.appendChild(makeCompareCheckbox(entity, profileColors[index], index === 0));
    });
}

// Draws the comparison chart inside the expandable bottom panel.
function drawCompareChart() {
    const selectedCompareFish = getSelectedCompareFish();
    const traces = getFishNames()
        .map((entity, index) => ({ entity, color: profileColors[index] }))
        .filter(item => selectedCompareFish.includes(item.entity))
        .map(item => {
            const rows = getFishRows(item.entity);

            return {
                x: rows.map(row => row.year),
                y: rows.map(row => row.stock),
                mode: "lines",
                name: fishInfo[item.entity].fish,
                line: {
                    color: item.color,
                    width: 2
                }
            };
        });

    const layout = {
        title: "",
        showlegend: false,
        xaxis: {
            title: "Year",
            showgrid: false,
            fixedrange: true
        },
        yaxis: {
            title: "Relative to sustainable yield",
            gridcolor: "#e5e7eb",
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
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#ffffff",
        margin: { t: 20, l: 64, r: 24, b: 64 }
    };

    Plotly.newPlot("graph4-compare", traces, layout, {
        responsive: true,
        displayModeBar: false
    });
}

// Redraws the whole profile when the selected fish changes.
function drawProfile() {
    drawFishTabs();
    drawFishInfo();
    drawSelectedChart();
}

// Opens and closes the comparison panel.
function setupCompareToggle() {
    const button = document.getElementById("compare-fish-toggle");
    const panel = document.getElementById("compare-fish-panel");

    button.addEventListener("click", () => {
        panel.classList.toggle("open");
        button.classList.toggle("open");
        drawCompareChart();
    });
}

// Opens and closes the explanation panel in the fish information card.
function setupInfoButton() {
    const button = document.getElementById("fish-info-button");
    const explanation = document.getElementById("fish-explanation");

    button.addEventListener("click", () => {
        explanation.classList.toggle("open");
        button.classList.toggle("open");
        button.setAttribute("aria-expanded", explanation.classList.contains("open"));
    });
}

// Loads the data and starts the graph with the first fish selected.
d3.csv(fishStockFile4).then(data => {
    fishRows4 = cleanFishRows(data);
    selectedFish = getFishNames()[0];

    setupCompareToggle();
    drawCompareControls();
    drawProfile();
    drawCompareChart();
});
