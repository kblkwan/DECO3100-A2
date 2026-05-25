const codFile = "data/long-term-cod-catch.csv";
const codColumn = "Northern Atlantic cod catch";
let codRows = [];

// Change the information in the key events section.
const codEvents = [
    {
        title: "Industrial Expansion",
        range: [1950, 1978],
        colour: "#3fa7c6",
        note: "The development of larger trawlers, sonar technology, and industrial processing dramatically increased fishing capacity."
    },
    {
        title: "Intensive Overfishing",
        range: [1978, 1992],
        colour: "#23798d",
        note: "Overfishing removed many large, older cod, which reduced breeding populations and accelerated stock decline."
    },
    {
        title: "Fishing Moratorium",
        range: [1992, 2019],
        colour: "#073f4c",
        note: "Fishing limits and closures were introduced to allow stocks to recover. "
    }
];
// Converts the CSV rows into simple year and catch values.
function cleanCodRows(data) {
    return data
        .map(row => ({
            year: parseInt(row.Year),
            catch: parseFloat(row[codColumn])
        }))
        .filter(row => !isNaN(row.year) && !isNaN(row.catch) && row.catch >= 0);
}

// Draws the key event context in a compact drawer below the chart.
function drawCodEvents() {
    document.getElementById("cod-events").innerHTML = `
        <div class="cod-event-cards">
            ${codEvents.map(event => `
                <div class="cod-event-card" style="border-left-color:${event.colour}">
                    <span>${event.range[0]}-${event.range[1]}</span>
                    <div>
                        <strong>${event.title}</strong>
                        <p>${event.note}</p>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

// Creates the Plotly line chart layout.
function makeCodLayout(rangeName) {
    const ranges = {
        all: [1508, 2019],
        collapse: [1950, 1995],
        recent: [1990, 2019]
    };

    return {
        title: "",
        showlegend: false,
        xaxis: {
            title: {
                text: "Year",
                standoff: 18
            },
            range: ranges[rangeName],
            showgrid: false,
            zeroline: false,
            fixedrange: true,
            automargin: true
        },
        yaxis: {
            title: {
                text: "Cod catch (tonnes)",
                standoff: 18
            },
            gridcolor: "#e5e7eb",
            tickformat: ",",
            zeroline: false,
            fixedrange: true,
            automargin: true
        },
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#ffffff",
        margin: { t: 48, l: 112, r: 32, b: 48 },
        font: {
            family: "Arial, sans-serif",
            color: "#111827"
        }
    };
}

// Draws the line chart for the selected time range.
function drawCodChart(rangeName = "all") {
    const lineTrace = {
        x: codRows.map(row => row.year),
        y: codRows.map(row => row.catch),
        mode: "lines",
        line: {
            color: "#0f766e",
            width: 2.5
        },
        fill: "tozeroy",
        fillcolor: "rgba(15, 118, 110, 0.12)",
        hovertemplate: "%{x}<br>%{y:,.0f} tonnes<extra></extra>"
    };

    Plotly.newPlot("graph1", [lineTrace], makeCodLayout(rangeName), {
        responsive: true,
        displayModeBar: false
    });
}

// Lets the user jump between important parts of the timeline.
function setupCodButtons() {
    document.querySelectorAll(".cod-range-buttons button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".cod-range-buttons button").forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            drawCodChart(button.dataset.range);
        });
    });
}

// Opens and closes the key event timeline drawer.
function setupCodEventsToggle() {
    const button = document.getElementById("cod-events-toggle");
    const events = document.getElementById("cod-events");

    button.addEventListener("click", () => {
        events.classList.toggle("open");
        button.classList.toggle("open");
        button.setAttribute("aria-expanded", events.classList.contains("open"));
    });
}

// Loads the CSV and starts the first graph.
d3.csv(codFile).then(data => {
    codRows = cleanCodRows(data);
    drawCodEvents();
    setupCodButtons();
    setupCodEventsToggle();
    drawCodChart();
});
