const maxCharacters = 250;
const intro = document.getElementById("intro");
const counter = document.getElementById("counter");

const BACKEND_URL = "/api/save-profile";

// Safely updates the pure CSS geolocation radar frame text
function renderMapImage(locationText) {
    const label = document.getElementById('map-geo-label');
    if (label) {
        label.textContent = locationText;
    }
}

// Automatically detect location coordinates securely from our own Vercel backend
async function detectLocation() {
    const locationInput = document.getElementById("location");
    try {
        const res = await fetch(BACKEND_URL);
        if (!res.ok) throw new Error("Backend lookup returned bad status");
        
        const data = await res.json();
        
        if (data && data.city) {
            const fullLocation = `${data.city}, ${data.country_name || ''}`;
            locationInput.value = fullLocation;
            renderMapImage(fullLocation);
        } else {
            throw new Error("Missing geo location text metrics");
        }
    } catch (err) {
        console.warn("Backend lookup failed, defaulting map to fallback location:", err);
        locationInput.value = "Chennai, IN"; 
        renderMapImage("Chennai, IN"); 
    }
}

// Fire application routing sequence on load
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
