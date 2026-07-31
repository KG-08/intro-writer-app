const maxCharacters = 250;
const intro = document.getElementById("intro");
const counter = document.getElementById("counter");

const BACKEND_URL = "/api/save-profile";

let map;
let marker;

function initializeMap(lat = 20, lon = 0, zoomLevel = 2) {
    // 👈 Check if Leaflet is actually loaded in the browser yet
    if (typeof L === 'undefined') {
        console.warn("Leaflet library not loaded yet. Retrying in 200ms...");
        setTimeout(() => initializeMap(lat, lon, zoomLevel), 200);
        return;
    }

    try {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.warn("Map DOM container element not found yet.");
            return;
        }

        if (!map) {
            map = L.map('map').setView([lat, lon], zoomLevel);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        } else {
            map.setView([lat, lon], zoomLevel);
        }

        if (marker) {
            marker.setLatLng([lat, lon]);
        } else if (lat !== 20 || lon !== 0) {
            marker = L.marker([lat, lon]).addTo(map);
        }

        // Multiple sizing safety intervals to force tiles onto the screen
        setTimeout(() => { if (map) map.invalidateSize(); }, 100);
        setTimeout(() => { if (map) map.invalidateSize(); }, 400);
        setTimeout(() => { if (map) map.invalidateSize(); window.dispatchEvent(new Event('resize')); }, 800);

    } catch (e) {
        console.error("Leaflet initiation failed entirely:", e);
    }
}

async function detectLocation() {
    const locationInput = document.getElementById("location");
    try {
        const res = await fetch(BACKEND_URL);
        if (!res.ok) throw new Error("Backend lookup returned bad status");
        
        const data = await res.json();
        
        if (data && data.latitude && data.longitude) {
            locationInput.value = `${data.city}, ${data.country_name}`;
            initializeMap(data.latitude, data.longitude, 10);
        } else {
            throw new Error("Missing geo metrics");
        }
    } catch (err) {
        console.warn("Backend lookup failed, defaulting map to global view:", err);
        locationInput.value = "Location parameters unavailable";
        initializeMap(20, 0, 2); 
    }
}

// 👈 CRUCIAL CHANGE: Safely wait until the browser window is completely loaded before starting
window.addEventListener('load', () => {
    initializeMap(20, 0, 2);
    detectLocation();
});

// ... Keep the rest of your script.js file (the event listeners for previewBtn and clearBtn) exactly the same ...

// Automatically detect location coordinates securely from our own Vercel backend
async function detectLocation() {
    const locationInput = document.getElementById("location");
    try {
        const res = await fetch(BACKEND_URL);
        if (!res.ok) throw new Error("Backend lookup returned bad status");
        
        const data = await res.json();
        
        if (data && data.latitude && data.longitude) {
            locationInput.value = `${data.city}, ${data.country_name}`;
            initializeMap(data.latitude, data.longitude, 10);
        } else {
            throw new Error("Missing geo metrics");
        }
    } catch (err) {
        console.warn("Backend lookup failed, defaulting map to global view:", err);
        locationInput.value = "Location parameters unavailable";
        initializeMap(20, 0, 2); 
    }
}

// Render fallback map structure on load
initializeMap(20, 0, 2);
detectLocation();

intro.addEventListener("input", function(){
    const remaining = maxCharacters - intro.value.length;
    counter.textContent = remaining + " characters remaining";
});

document.getElementById("previewBtn").addEventListener("click", async function(){
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const website = document.getElementById("website").value.trim();
    const location = document.getElementById("location").value.trim();
    const introduction = intro.value.trim();

    document.getElementById("previewName").textContent = name || "-";
    document.getElementById("previewEmail").textContent = email || "-";
    document.getElementById("previewLocation").textContent = location || "-";
    document.getElementById("previewIntro").textContent = introduction || "Your introduction will appear here.";

    const previewWebsite = document.getElementById("previewWebsite");
    if(website !== ""){
        previewWebsite.href = website;
        previewWebsite.textContent = website;
    } else {
        previewWebsite.removeAttribute("href");
        previewWebsite.textContent = "-";
    }

    const profileData = {
        name: name || "Anonymous",
        email: email || "Not provided",
        website: website || "",
        introduction: introduction || "",
        location: location || "Unknown"
    };

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });

        const result = await response.json();
        if(response.ok) {
            alert("Success! Entry safely saved to your MongoDB Atlas cluster via Vercel.");
        } else {
            alert("Database Error: " + result.error);
        }
    } catch (err) {
        console.error("Network issue connecting to serverless function:", err);
        alert("Failed to contact the serverless API.");
    }
});

document.getElementById("clearBtn").addEventListener("click", function(){
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("website").value = "";
    intro.value = "";
    counter.textContent = maxCharacters + " characters remaining";
    document.getElementById("previewName").textContent = "-";
    document.getElementById("previewEmail").textContent = "-";
    document.getElementById("previewLocation").textContent = "-";
    const previewWebsite = document.getElementById("previewWebsite");
    previewWebsite.textContent = "-";
    previewWebsite.removeAttribute("href");
    document.getElementById("previewIntro").textContent = "Your introduction will appear here.";
    
    if (marker) {
        map.removeLayer(marker);
        marker = null;
    }
    detectLocation();
});
