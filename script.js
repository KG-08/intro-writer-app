const maxCharacters = 250;
const intro = document.getElementById("intro");
const counter = document.getElementById("counter");

const BACKEND_URL = "/api/save-profile";

let map;
let marker;

// Initialize map with robust styling enforcement
function initializeMap(lat = 0, lon = 0, zoomLevel = 2) {
    try {
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
        } else if (lat !== 0 || lon !== 0) {
            marker = L.marker([lat, lon]).addTo(map);
        }

        // Force tile rendering across multiple intervals to fix race conditions
        setTimeout(() => { map.invalidateSize(); }, 100);
        setTimeout(() => { map.invalidateSize(); }, 500);
        setTimeout(() => { map.invalidateSize(); }, 1000);
    } catch (e) {
        console.error("Leaflet initialization failed:", e);
    }
}

// Automatically detect location coordinates securely over HTTPS
async function detectLocation() {
    const locationInput = document.getElementById("location");
    try {
        const res = await fetch("https://ipapi.co");
        
        // Handle network blockages or bad status codes gracefully
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        
        if(data && !data.error && data.latitude && data.longitude) {
            locationInput.value = `${data.city || 'Unknown City'}, ${data.country_name || 'Unknown Country'}`;
            const latitude = parseFloat(data.latitude);
            const longitude = parseFloat(data.longitude);
            initializeMap(latitude, longitude, 11);
        } else {
            throw new Error("Invalid data structure received from API");
        }
    } catch (err) {
        console.warn("Location fetch blocked or failed. Using fallback map grid view:", err);
        locationInput.value = "Location blocked by browser / unavailable";
        
        // 👈 FALLBACK: Force map initialization at global coordinates [0, 0] if API fails
        initializeMap(20, 0, 2); 
    }
}

// Force the initial layout map to drop immediately on page load
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
