const tableBody = document.querySelector("#flight-table tbody");
const flightForm = document.getElementById("flight-form");
const flightInput = document.getElementById("flight-number");

// Load stored flights from localStorage
let trackedFlights = JSON.parse(localStorage.getItem("trackedFlights")) || {};

// Save flights to localStorage
function saveFlights() {
    localStorage.setItem("trackedFlights", JSON.stringify(trackedFlights));
}

// Add a new flight
flightForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const flightNumber = flightInput.value.trim().toUpperCase();
    if (!trackedFlights[flightNumber]) {
        trackedFlights[flightNumber] = { lastSeen: Date.now(), landed: false };
        saveFlights();
    }
    flightInput.value = "";
    fetchFlights();
});

// Fetch flight data from OpenSky
async function fetchFlights() {
    try {
        const response = await fetch("https://opensky-network.org/api/states/all");
        const data = await response.json();

        const now = Date.now();
        tableBody.innerHTML = "";

        Object.keys(trackedFlights).forEach(flightNum => {
            const match = data.states.find(f => f[1] && f[1].trim().toUpperCase() === flightNum);

            if (match) {
                const depTime = match[3] ? new Date(match[3] * 1000).toLocaleTimeString() : "—";
                const arrTime = match[4] ? new Date(match[4] * 1000).toLocaleTimeString() : "—";

                let status = "on-time";
                if (match[8] === 0 && match[9] === 0) { 
                    status = "landed";
                    trackedFlights[flightNum].landed = true;
                    trackedFlights[flightNum].lastSeen = now;
                }

                addRow(flightNum, "Unknown", depTime, "Unknown", arrTime, status);
            } else {
                if (trackedFlights[flightNum].landed) {
                    // Keep landed flights for 30 min
                    if (now - trackedFlights[flightNum].lastSeen > 30 * 60 * 1000) {
                        delete trackedFlights[flightNum];
                        saveFlights();
                    } else {
                        addRow(flightNum, "Unknown", "—", "Unknown", "—", "landed");
                    }
                }
            }
        });

        saveFlights(); // Save after updating data

    } catch (error) {
        console.error("Error fetching flights:", error);
    }
}

function addRow(flight, from, dep, to, arr, status) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${flight}</td>
        <td>${from}</td>
        <td>${dep}</td>
        <td>${to}</td>
        <td>${arr}</td>
        <td class="status-${status}">${status.toUpperCase()}</td>
    `;
    tableBody.appendChild(row);
}

setInterval(fetchFlights, 60000); // Refresh every 60 sec
fetchFlights(); // Initial load
