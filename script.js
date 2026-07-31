const maxCharacters = 250;
const intro = document.getElementById("intro");
const counter = document.getElementById("counter");

const BACKEND_URL = "/api/save-profile";

// Map pointers to track dynamic instance changes
let map;
let marker;

// Initialize an empty layout map centered on the equator
// Initialize an empty layout map centered on the equator
function initializeMap(lat = 0, lon = 0, zoomLevel = 2) {
    if (!map) {
        map = L.map('map').setView([lat, lon], zoomLevel);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lon], zoomLevel);
    }

    // Refresh marker placement smoothly
    if (marker) {
        marker.setLatLng([lat, lon]);
    } else if (lat !== 0 || lon !== 0) {
        marker = L.marker([lat, lon]).addTo(map);
    }

    setTimeout(() => {
        if (map) {
            map.invalidateSize();
        }
    }, 200); 
}


// Automatically detect location coordinates securely over HTTPS
async function detectLocation() {
    const locationInput = document.getElementById("location");
    try {
        const res = await fetch("https://ipapi.co");
        const data = await res.json();
        
        if(data && !data.error) {
            locationInput.value = `${data.city}, ${data.country_name}`;
            // Extract coordinates to plot OpenStreetMap marker automatically
            const latitude = parseFloat(data.latitude);
            const longitude = parseFloat(data.longitude);
            initializeMap(latitude, longitude, 11);
        } else {
            locationInput.value = "Location unavailable";
            initializeMap(0, 0, 2);
        }
    } catch (err) {
        console.error("Error fetching location:", err);
        locationInput.value = "Failed to detect location";
        initializeMap(0, 0, 2);
    }
}

// Draw base elements immediately on load
initializeMap(0, 0, 2);
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
    
    // Clear out map marker positioning metrics 
    if (marker) {
        map.removeLayer(marker);
        marker = null;
    }
    detectLocation();
});
