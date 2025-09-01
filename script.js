let map;
let userMarker;
let shopMarkers = [];
let targetShop = null;

// Initialize map
function initMap(lat, lng) {
  map = L.map("map").setView([lat, lng], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  userMarker = L.marker([lat, lng], {
    icon: L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
      iconSize: [32, 32],
    }),
  }).addTo(map).bindPopup("📍 You are here").openPopup();

  fetchNearbyShops(lat, lng);
}

// Fetch nearby phone shops using OpenStreetMap Nominatim
async function fetchNearbyShops(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=mobile+shop&limit=15&viewbox=${lng-0.02},${lat+0.02},${lng+0.02},${lat-0.02}&bounded=1`;

  try {
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();

    if (!data.length) {
      document.getElementById("message").textContent = "❌ No nearby shops found!";
      return;
    }

    data.forEach(shop => {
      const marker = L.marker([shop.lat, shop.lon], {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/1041/1041883.png",
          iconSize: [30, 30],
        }),
      }).addTo(map);

      marker.bindPopup(
        `<b style="font-size:16px;">${shop.display_name.split(",")[0]}</b><br>📍 ${shop.display_name}`
      );

      shopMarkers.push({ name: shop.display_name, lat: shop.lat, lng: shop.lon, marker });
    });

    document.getElementById("message").textContent =
      `📌 Found ${data.length} phone shops near you`;
  } catch (e) {
    document.getElementById("message").textContent = "⚠️ Error fetching shops!";
    console.error(e);
  }
}

// Search shop by name
function searchShop() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  targetShop = null;

  shopMarkers.forEach(s => {
    if (s.name.toLowerCase().includes(query)) {
      targetShop = s;
      map.setView([s.lat, s.lng], 17);
      s.marker.openPopup();
    }
  });

  if (!targetShop) {
    document.getElementById("message").textContent = "❌ No shop found";
  }
}

// Ask for location permission
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      initMap(lat, lng);
    },
    err => {
      alert("📌 အနီးနားက ဖုန်းဆိုင်ရှာဖို့ allow ကိုနှိပ်ပါ😚");
    }
  );
} else {
  alert("Geolocation is not supported!");
}
