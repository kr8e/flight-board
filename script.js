const tableBody = document.querySelector("#flight-table tbody");

// Example: fetch flights from OpenSky (no API key needed)
async function fetchFlights() {
    try {
        const response = await fetch("https://opensky-network.org/api/states/all");
        const data = await response.json();

        tableBody.innerHTML = "";

        // Example: take first 10 flights for demo
        data.states.slice(0, 10).forEach(flight => {
            const row = document.createElement("tr");

            const callsign = flight[1] ? flight[1].trim() : "N/A";
            const from = "Unknown"; // OpenSky free API doesn't give route
            const depTime = new Date(flight[3] * 1000).toLocaleTimeString();
            const to = "Unknown";
            const arrTime = "—";

            // For demo, randomly assign status
            const statuses = ["on-time", "delayed", "cancelled"];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            row.innerHTML = `
                <td>${callsign}</td>
                <td>${from}</td>
                <td>${depTime}</td>
                <td>${to}</td>
                <td>${arrTime}</td>
                <td class="status-${status}">${status.toUpperCase()}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching flights:", error);
    }
}

fetchFlights();
setInterval(fetchFlights, 60000); // Refresh every 60 sec
