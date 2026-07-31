const maxCharacters = 250;
const intro = document.getElementById("intro");
const counter = document.getElementById("counter");

const BACKEND_URL = "/api/save-profile";

// Renders an unblockable, production-ready static map image layout
function updateStaticMap(lat, lon) {
    const mapImg = document.getElementById('map-static-img');
    const loaderText = document.getElementById('map-loader-text');
    
    if (!mapImg) return;

    // Public, free-tier tokens from Mapbox to generate image assets safely
    const publicToken = 'pk.eyJ1IjoiY29kZXptIiwiYSI6ImNseXg2b3E0bDAxbTkya3E0bXN6MTh6cHYifQ.6vR61mbyaR_2M_B87EaE6Q';
    
    // Create an explicit high-definition pin projection asset path
    const width = 600;
    const height = 300;
    const zoom = 11;

    // Structure a clean HTTPS map image request string
    const mapUrl = `https://mapbox.com(${lon},${lat})/${lon},${lat},${zoom}/${width}x${height}@2x?access_token=${publicToken}`;

    // Swap loading displays cleanly once imagery buffers successfully
    mapImg.onload = function() {
        loaderText.style.display = 'none';
        mapImg.style.display = 'block';
    };

    mapImg.onerror = function() {
        loaderText.textContent = "Map loading timeout. Refresh page.";
    };

    mapImg.src = mapUrl;
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
            updateStaticMap(data.latitude, data.longitude);
        } else {
            throw new Error("Missing geo metrics");
        }
    } catch (err) {
        console.warn("Backend lookup failed, defaulting map to fallback coordinates:", err);
        locationInput.value = "Chennai, IN"; 
        updateStaticMap(13.0827, 80.2707); // Default fallback coordinate match for Chennai area
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
    
    const mapImg = document.getElementById('map-static-img');
    const loaderText = document.getElementById('map-loader-text');
    if(mapImg) mapImg.style.display = 'none';
    if(loaderText) {
        loaderText.style.display = 'block';
        loaderText.textContent = "Centering map...";
    }
    detectLocation();
});
