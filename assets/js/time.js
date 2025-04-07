// This script updates the time and location display every second
    function updateTimeAndLocation() {
        const display = document.getElementById('locationTimeDisplay');
        const date = new Date();
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Get timezone location name (fallback)
        const region = Intl.DateTimeFormat().resolvedOptions().timeZone;
        display.innerHTML = `📍 ${region.replace('_', ' ')} | 🕒 ${time}`;
    }

    setInterval(updateTimeAndLocation, 1000);
    updateTimeAndLocation();

