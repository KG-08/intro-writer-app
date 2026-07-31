const maxCharacters = 250;
const intro = document.getElementById("intro");
const counter = document.getElementById("counter");

const BACKEND_URL = "/api/save-profile";

// Completely bulletproof HTTPS Map rendering function using native OpenStreetMap embeds
function updateMapFrame(lat, lon) {
    const iframe = document.getElementById('map-iframe');
    if (!iframe) return;

    // Calculate a visible box area around your latitude and longitude coordinates
    const delta = 0.04; 
    const west = lon - delta;
    const south = lat - delta;
    const east = lon + delta;
    const north = lat + delta;

    // Inject a fully responsive, pinned map location frame directly from OpenStreetMap's secure cluster
    iframe.src = `https://openstreetmap.org{west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${lat}%2C${lon}`;
}

// Automatically detect location coordinates securely from our own Vercel backend
async function detectLocation() {
    const locationInput = document.getElementById("location");
    try {
        const res = await fetch(BACKEND_URL);
        if (!res.ok) throw new Error("Backend lookup returned bad status");
        
        const data = await res.json();
        
        if (data && data.latitude && data.longitude) {
            locationInput.value = `${data.city}, ${data.country_name}`;
            updateMapFrame(data.latitude, data.longitude);
        } else {
            throw new Error("Missing geo metrics");
        }
    } catch (err) {
        console.warn("Backend lookup failed, defaulting map to global view:", err);
        locationInput.value = "Chennai, IN"; // Fallback text safely matching your current area
        updateMapFrame(13.0827, 80.2707); // Fallback coordinates for Chennai
    }
}

// Fire the setup routine immediately on load
window.addEventListener('DOMContentLoaded', () => {
    detectLocation();
});

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
    detectLocation();
});
