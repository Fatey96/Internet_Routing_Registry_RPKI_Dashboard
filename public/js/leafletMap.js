function initializeLeafletMap() {
  try {
    const mapContainer = document.getElementById('leafletMap');
    if (!mapContainer) {
      console.error("Leaflet map container not found.");
      return;
    }
    // Check if the map has already been initialized to prevent re-initialization
    if (!window.leafletMap) {
      window.leafletMap = L.map('leafletMap').setView([37.8, -96], 4); // Centers the map on the US with an appropriate zoom level
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(window.leafletMap);

      // Load and display GeoJSON for US boundaries
      fetch('/data/usGeo.json') // Correct path to the US GeoJSON file
        .then(response => response.json())
        .then(data => {
          const usLayer = L.geoJson(data, {
            style: function(feature) {
              return {color: "#2262cc", weight: 2};
            }
          }).addTo(window.leafletMap);

          // Define a large rectangle that covers the entire map
          const bounds = [[90, -360], [-90, 360]];
          // Define a mask layer to cover areas outside the US
          const worldMask = L.rectangle(bounds, {color: "#fff", weight: 0, fillOpacity: 0.7}).addTo(window.leafletMap);
          // Set the US layer to bring it to front, making it visible
          usLayer.bringToFront();
        })
        .catch(error => {
          console.error('Error loading US GeoJSON:', error.message);
          console.error(error.stack);
        });

      console.log("Leaflet map initialized successfully.");
    } else {
      console.log("Leaflet map already initialized, checking for invalidateSize method.");
      if (typeof window.leafletMap.invalidateSize === 'function') {
        window.leafletMap.invalidateSize();
        console.log("Leaflet map size invalidated successfully.");
      } else {
        console.log("Leaflet map invalidateSize method not available.");
      }
    }
  } catch (error) {
    console.error('Error initializing Leaflet map:', error.message);
    console.error(error.stack);
  }
}

// Attach the initializeLeafletMap function to the window object for global access.
window.initializeLeafletMap = initializeLeafletMap;