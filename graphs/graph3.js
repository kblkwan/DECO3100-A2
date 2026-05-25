const captureFile = "data/capture-fishery-production.csv";
const captureColumn = "Capture fisheries production (metric tons)";
const mapColors = ["#d8e8f3", "#b7d4e8", "#85b9d9", "#4f97c8", "#2171b5", "#0b4f8a", "#08306b"];
const legendBreaks = [0, 10000, 100000, 500000, 1000000, 5000000, 10000000];
const legendLabels = ["0", "10k", "100k", "500k", "1M", "5M", "10M+"];
let captureData = [];
let latestYear = 0;
let maxProduction = 0;

// Text shown when the information button is opened.
const mapInfo = {
    title: "Global Fishing Patterns",
    text: "The chart shows the distribution of wild fish caught by each country. The colour intensity represents the amount of fish caught, with darker colours indicating higher capture volumes. Use the slider to explore how global fish catches have changed over time."
};

// Converts CSV rows into simple objects the graph can use.
function cleanCaptureData(data) {
    return data
        .map(row => ({
            entity: row.Entity,
            code: row.Code,
            year: parseInt(row.Year),
            production: parseFloat(row[captureColumn])
        }))
        .filter(row => row.code && row.code.length === 3 && !isNaN(row.production));
}

// Gets every year in the dataset, from oldest to newest.
function getYears(data) {
    return [...new Set(data.map(row => row.year))].sort((a, b) => a - b);
}

// Gets only the country data for one year.
function getYearData(year) {
    return captureData.filter(row => row.year === year);
}

// Creates a stepped colour scale using the same break values as the legend.
function makeSteppedColorscale() {
    return mapColors.flatMap((color, index) => {
        const start = legendBreaks[index] / maxProduction;
        const nextBreak = legendBreaks[index + 1] || maxProduction;
        const end = nextBreak / maxProduction;

        return [[start, color], [end, color]];
    });
}

// Creates one choropleth map for a selected year.
function makeMapTrace(year, geoName) {
    const yearData = getYearData(year);

    return {
        type: "choropleth",
        locationmode: "ISO-3",
        locations: yearData.map(row => row.code),
        z: yearData.map(row => row.production),
        text: yearData.map(row => row.entity),
        colorscale: makeSteppedColorscale(),
        zmin: 0,
        zmax: maxProduction,
        geo: geoName,
        showscale: false,
        hovertemplate: "%{text}<br>%{z:,.0f} metric tons<extra></extra>"
    };
}

// Controls how the world map looks and keeps it fixed.
function makeGeoLayout(domain) {
    return {
        domain: domain,
        scope: "world",
        projection: {
            type: "natural earth"
        },
        fixedrange: true,
        showframe: false,
        showcoastlines: true,
        showcountries: true,
        showland: true,
        showocean: true,
        coastlinecolor: "#cfd6df",
        countrycolor: "#ffffff",
        landcolor: "#f3f4f6",
        oceancolor: "#ffffff",
        lakecolor: "#ffffff",
        bgcolor: "#ffffff"
    };
}

// Layout for the default single-map view.
function makeSingleLayout(year) {
    return {
        title: {
            text: `<b>Capture Fishery Production (${year})</b>`,
            x: 0.5
        },
        geo: makeGeoLayout({ x: [0, 1], y: [0, 1] }),
        dragmode: false,
        paper_bgcolor: "#ffffff",
        margin: { t: 64, l: 14, r: 14, b: 6 }
    };
}

// Layout for the comparison view after the slider changes year.
function makeComparisonLayout(selectedYear) {
    return {
        title: {
            text: `<b>Capture Fishery Production: ${selectedYear} compared with ${latestYear}</b>`,
            x: 0.5
        },
        geo: makeGeoLayout({ x: [0, 0.47], y: [0, 1] }),
        geo2: makeGeoLayout({ x: [0.53, 1], y: [0, 1] }),
        annotations: [
            { text: selectedYear, x: 0.24, y: 1, xref: "paper", yref: "paper", showarrow: false },
            { text: latestYear, x: 0.76, y: 1, xref: "paper", yref: "paper", showarrow: false }
        ],
        dragmode: false,
        paper_bgcolor: "#ffffff",
        margin: { t: 76, l: 14, r: 14, b: 6 }
    };
}

// Draws either one map or two comparison maps.
function drawMap(year) {
    const chartData = year === latestYear
        ? [makeMapTrace(latestYear, "geo")]
        : [makeMapTrace(year, "geo"), makeMapTrace(latestYear, "geo2")];

    const layout = year === latestYear
        ? makeSingleLayout(latestYear)
        : makeComparisonLayout(year);

    Plotly.newPlot("graph3", chartData, layout, {
        responsive: true,
        scrollZoom: false,
        displayModeBar: false,
        doubleClick: false,
        showTips: false
    });
}

// Draws a simple horizontal legend below the map.
function drawLegend() {
    const legend = document.getElementById("map-legend");

    legend.innerHTML = `
        <div class="map-legend-title">Capture fishery production (metric tons)</div>
        <div class="map-legend-bar">
            ${mapColors.map(color => `<span style="background:${color}"></span>`).join("")}
        </div>
        <div class="map-legend-labels">
            ${legendLabels.map(label => `<span>${label}</span>`).join("")}
        </div>
    `;
}

// Adds the short explanation inside the map information box.
function drawMapInfoBox() {
    document.getElementById("map-info-box").innerHTML = `
        <strong>${mapInfo.title}</strong>
        <p>${mapInfo.text}</p>
    `;
}

// Opens and closes the map information box.
function setupMapInfoButton() {
    const button = document.getElementById("map-info-button");
    const infoBox = document.getElementById("map-info-box");

    button.addEventListener("click", () => {
        infoBox.classList.toggle("open");
        button.classList.toggle("open");
        button.setAttribute("aria-expanded", infoBox.classList.contains("open"));
    });
}

// Sets up the year slider and redraws the map when it moves.
function setupSlider(years) {
    const slider = document.getElementById("year-slider");
    const selectedYear = document.getElementById("selected-year");

    slider.min = years[0];
    slider.max = latestYear;
    slider.step = 1;
    slider.value = latestYear;
    selectedYear.textContent = latestYear;
    moveYearBox(slider, selectedYear);

    slider.addEventListener("input", () => {
        const year = parseInt(slider.value);
        selectedYear.textContent = year;
        moveYearBox(slider, selectedYear);
        drawMap(year);
    });
}

// Moves the year text box so it follows the slider thumb.
function moveYearBox(slider, selectedYear) {
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);
    const value = parseInt(slider.value);
    const percent = ((value - min) / (max - min)) * 100;

    selectedYear.style.left = `${percent}%`;
}

// Loads the CSV, finds the latest year, then draws the first map.
d3.csv(captureFile).then(data => {
    captureData = cleanCaptureData(data);

    const years = getYears(captureData);
    latestYear = years[years.length - 1];
    maxProduction = d3.max(captureData, row => row.production);

    setupSlider(years);
    drawMapInfoBox();
    setupMapInfoButton();
    drawLegend();
    drawMap(latestYear);
});
