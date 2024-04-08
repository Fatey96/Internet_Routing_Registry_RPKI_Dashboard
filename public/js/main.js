document.addEventListener('DOMContentLoaded', function() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const currentTheme = localStorage.getItem('theme');
  const mapToggle = document.getElementById('mapToggle'); // Add map toggle button reference

  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
  }

  darkModeToggle.addEventListener('change', function() {
    try {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        console.log('Dark mode enabled');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        console.log('Light mode enabled');
      }
    } catch (error) {
      console.error('Error toggling dark mode:', error.message);
      console.error(error.stack);
    }
  });

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', applyFilters);

  const searchFilter = document.getElementById('searchFilter');
  searchFilter.addEventListener('change', applyFilters);

  function applyFilters() {
    // Existing filter functionality...
  }

  // Map toggle functionality
  if (mapToggle) {
    mapToggle.addEventListener('click', function() {
      const d3Map = document.getElementById('d3Map');
      const leafletMap = document.getElementById('leafletMap');
      if (leafletMap.style.display === 'block') {
        d3Map.style.display = 'block';
        leafletMap.style.display = 'none';
        console.log('Switched to D3.js map');
      } else {
        d3Map.style.display = 'none';
        leafletMap.style.display = 'block';
        if (!window.leafletMap) {
          window.initializeLeafletMap(); // Initialize Leaflet map if not already initialized
        } else {
          window.leafletMap.invalidateSize(); // Adjust the map size if it's already initialized
        }
        console.log('Switched to Leaflet map');
      }
    });
  }
});