// Visit Lombok ID - Main JavaScript with Advanced Features

// Global variables
let map;
let markers = [];
let currentTheme = 'dark';
let currentLanguage = 'id';
let trafficLayer = false;
let satelliteLayer = false;
let directionsControl = null;
let userLocation = null;

// Enhanced destinations data
const destinationsData = [
    {
        id: 1,
        name: "Pantai Senggigi",
        category: "beach",
        location: "Lombok Barat",
        coords: [-8.4969, 116.0467],
        description: "Pantai ikonik Lombok dengan pasir putih dan sunset menakjubkan",
        image: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=800",
        rating: 4.8,
        price: "Free - Rp 10.000",
        openingHours: "06:00 - 18:00",
        facilities: ["Parkir", "Toilet", "Warung", "Penginapan"],
        contact: "+62 812-3456-7890"
    },
    {
        id: 2,
        name: "Gunung Rinjani",
        category: "mountain",
        location: "Lombok Timur",
        coords: [-8.4100, 116.4600],
        description: "Gunung berapi tertinggi kedua di Indonesia dengan pemandangan spektakuler",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        rating: 4.9,
        price: "Rp 150.000 - Rp 500.000",
        openingHours: "24 jam",
        facilities: ["Basecamp", "Guide", "Porter", "Camping"],
        contact: "+62 813-4567-8901"
    },
    {
        id: 3,
        name: "Air Terjun Tiu Kelep",
        category: "waterfall",
        location: "Lombok Utara",
        coords: [-8.3333, 116.0833],
        description: "Air terjun megah dengan kolam alami yang jernih untuk berenang",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
        rating: 4.7,
        price: "Rp 10.000 - Rp 20.000",
        openingHours: "07:00 - 17:00",
        facilities: ["Parkir", "Toilet", "Warung", "Tempat Ganti"],
        contact: "+62 814-5678-9012"
    },
    {
        id: 4,
        name: "Desa Sade",
        category: "culture",
        location: "Lombok Tengah",
        coords: [-8.8333, 116.1667],
        description: "Desa adat Sasak dengan arsitektur tradisional dan budaya autentik",
        image: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=800",
        rating: 4.6,
        price: "Rp 20.000 - Rp 50.000",
        openingHours: "08:00 - 17:00",
        facilities: ["Parkir", "Museum", "Workshop", "Souvenir"],
        contact: "+62 815-6789-0123"
    },
    {
        id: 5,
        name: "Pusat Kuliner Taliwang",
        category: "culinary",
        location: "Lombok Barat",
        coords: [-8.6167, 116.1333],
        description: "Surga ayam bakar Taliwang yang pedas dan lezat",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800",
        rating: 4.6,
        price: "Rp 25.000 - Rp 100.000",
        openingHours: "10:00 - 22:00",
        facilities: ["Parkir", "AC", "Toilet", "Wifi"],
        contact: "+62 816-7890-1234"
    },
    {
        id: 6,
        name: "Gili Trawangan",
        category: "beach",
        location: "Lombok Utara",
        coords: [-8.3500, 116.0400],
        description: "Pulau eksotis dengan pantai pasir putih dan terumbu karang indah",
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800",
        rating: 4.8,
        price: "Free - Rp 50.000",
        openingHours: "24 jam",
        facilities: ["Resort", "Restoran", "Dive Center", "Spa"],
        contact: "+62 817-8901-2345"
    }
];

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeLanguage();
    initTypewriter();
    initScrollReveal();
    initDestinationFilter();
    initMobileMenu();
    initCounterAnimation();
    loadDestinations();
    initializeMap();
    startRealTimeUpdates();
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    applyTheme(savedTheme);
    
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    currentTheme = newTheme;
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    
    // Update map style if map exists
    if (map) {
        const style = newTheme === 'dark' ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11';
        map.setStyle(style);
    }
}

function applyTheme(theme) {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (theme === 'light') {
        body.classList.add('light-mode');
        themeIcon.textContent = '☀️';
    } else {
        body.classList.remove('light-mode');
        themeIcon.textContent = '🌙';
    }
}

// Language Management
function initializeLanguage() {
    currentLanguage = getCurrentLanguage();
}

// Mapbox GL JS Integration with Enhanced Features
function initializeMap() {
    // Mapbox access token (replace with your own token)
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0cI1fxAfuz_4IA';
    
    const mapStyle = currentTheme === 'dark' ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11';
    
    map = new mapboxgl.Map({
        container: 'map',
        style: mapStyle,
        center: [116.2667, -8.6500],
        zoom: 9,
        pitch: 45,
        bearing: 0
    });
    
    // Add enhanced navigation controls
    const nav = new mapboxgl.NavigationControl({ 
        showCompass: true,
        visualizePitch: true 
    });
    map.addControl(nav, 'top-right');
    
    // Add fullscreen control
    const fullscreen = new mapboxgl.FullscreenControl();
    map.addControl(fullscreen, 'top-right');
    
    // Add enhanced geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true,
            timeout: 6000
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true
    });
    map.addControl(geolocate, 'top-right');
    
    // Store user location when available
    geolocate.on('geolocate', function(e) {
        userLocation = [e.coords.longitude, e.coords.latitude];
        console.log('User location captured:', userLocation);
    });
    
    // Add scale control
    const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
    });
    map.addControl(scale, 'bottom-left');
    
    // Add directions control
    addDirectionsControl();
    
    // Load destination markers when map is ready
    map.on('load', function() {
        addDestinationMarkers();
        add3DBuildings();
        addTrafficLayer();
        animateMapCamera();
    });
    
    // Handle map style changes
    map.on('styledata', function() {
        if (map.getLayer('3d-buildings')) {
            map.removeLayer('3d-buildings');
        }
        add3DBuildings();
    });
}

// Add directions control
function addDirectionsControl() {
    directionsControl = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: 'metric',
        profile: 'mapbox/driving-traffic',
        controls: {
            instructions: true,
            profileSwitcher: true
        },
        flyTo: true,
        placeholderOrigin: 'Lokasi Anda',
        placeholderDestination: 'Tujuan',
        language: 'id'
    });
    
    map.addControl(directionsControl, 'top-left');
    
    // Listen for route completion
    directionsControl.on('route', function(e) {
        if (e.route && e.route[0]) {
            const route = e.route[0];
            showRouteDetails(route);
        }
    });
}

// Show route details
function showRouteDetails(route) {
    const distance = (route.distance / 1000).toFixed(1);
    const duration = Math.round(route.duration / 60);
    
    // Remove existing route info
    const existingInfo = document.querySelector('.route-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    // Create route info display
    const routeInfo = document.createElement('div');
    routeInfo.className = 'route-info';
    routeInfo.innerHTML = `
        <div class="bg-black bg-opacity-75 text-white p-4 rounded-lg">
            <h3 class="font-bold mb-2">Informasi Rute</h3>
            <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center">
                    <span class="text-accent mr-2">📏</span>
                    <span>${distance} km</span>
                </div>
                <div class="flex items-center">
                    <span class="text-accent mr-2">⏱️</span>
                    <span>${duration} menit</span>
                </div>
                <div class="flex items-center">
                    <span class="text-accent mr-2">🚗</span>
                    <span>${getTrafficCondition(route)}</span>
                </div>
                <div class="flex items-center">
                    <span class="text-accent mr-2">💰</span>
                    <span>${estimateCost(route)}</span>
                </div>
            </div>
            <div class="mt-3 text-xs text-gray-300">
                Estimasi berdasarkan kondisi lalu lintas saat ini
            </div>
        </div>
    `;
    
    // Add to map
    const mapContainer = document.getElementById('map');
    routeInfo.style.position = 'absolute';
    routeInfo.style.bottom = '10px';
    routeInfo.style.left = '10px';
    routeInfo.style.zIndex = '1000';
    routeInfo.style.maxWidth = '300px';
    
    mapContainer.appendChild(routeInfo);
}

// Get traffic condition
function getTrafficCondition(route) {
    if (!trafficLayer) return 'Normal';
    
    // Simulate traffic conditions
    const duration = route.duration / 60;
    const expectedDuration = route.distance / 1000 * 3;
    
    if (duration > expectedDuration * 1.5) return 'Macet';
    if (duration > expectedDuration * 1.2) return 'Padat';
    return 'Lancar';
}

// Estimate cost
function estimateCost(route) {
    const distance = route.distance / 1000;
    const baseCost = 5000;
    const perKm = 3000;
    
    const totalCost = baseCost + (distance * perKm);
    return `Rp ${Math.round(totalCost / 1000)} rb`;
}

// Enhanced destination markers with real-time data
function addDestinationMarkers() {
    clearMarkers();
    
    destinationsData.forEach(destination => {
        const visitorData = getRealTimeVisitorData(destination.id);
        const markerColor = getVisitorStatusColor(visitorData.status);
        
        // Create enhanced marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'enhanced-marker';
        markerEl.innerHTML = `
            <div class="marker-circle" style="background-color: ${markerColor}"></div>
            <div class="visitor-count">${visitorData.count}</div>
        `;
        
        // Create marker
        const marker = new mapboxgl.Marker({
            element: markerEl,
            anchor: 'bottom'
        })
            .setLngLat([destination.coords[1], destination.coords[0]])
            .setPopup(createEnhancedPopup(destination, visitorData))
            .addTo(map);
        
        markers.push(marker);
        
        // Add click event to marker
        markerEl.addEventListener('click', () => {
            showDestinationModal(destination);
            centerMapToDestination(destination);
        });
    });
}

// Create enhanced popup with navigation options
function createEnhancedPopup(destination, visitorData) {
    const statusText = {
        'low': 'Sepi',
        'medium': 'Lumayan',
        'high': 'Ramai'
    };
    
    return new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: '350px'
    })
    .setHTML(`
        <div class="p-4">
            <div class="flex justify-between items-center mb-3">
                <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${getVisitorStatusColor(visitorData.status)}"></div>
                    <span class="text-sm font-bold">${statusText[visitorData.status]}</span>
                </div>
                <div class="text-xs text-gray-500">
                    🔄 Real-time
                </div>
            </div>
            
            <img src="${destination.image}" alt="${destination.name}" class="w-full h-40 object-cover rounded-lg mb-3">
            
            <h3 class="font-bold text-lg mb-2">${destination.name}</h3>
            <p class="text-sm text-gray-600 mb-2">📍 ${destination.location}</p>
            <p class="text-sm mb-3 line-clamp-2">${destination.description}</p>
            
            <div class="grid grid-cols-2 gap-2 mb-3">
                <div class="bg-gray-100 p-2 rounded">
                    <div class="text-accent font-bold text-lg">${destination.rating} ⭐</div>
                    <div class="text-xs text-gray-600">Rating</div>
                </div>
                <div class="bg-gray-100 p-2 rounded">
                    <div class="text-accent font-bold">${visitorData.count}</div>
                    <div class="text-xs text-gray-600">Pengunjung</div>
                </div>
            </div>
            
            <div class="space-y-2">
                <button onclick="startNavigationToDestination(${destination.id})" 
                        class="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
                    🚗 Navigasi dari Lokasi Anda
                </button>
                <button onclick="viewDestination(${destination.id})" 
                        class="w-full bg-accent text-white py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all">
                    📖 Lihat Detail Lengkap
                </button>
            </div>
        </div>
    `);
}

// Start navigation to destination
function startNavigationToDestination(destinationId) {
    const destination = destinationsData.find(dest => dest.id === destinationId);
    
    if (!destination) {
        showNotification('Destinasi tidak ditemukan', 'error');
        return;
    }
    
    if (!userLocation) {
        showNotification('Mengambil lokasi Anda...', 'info');
        
        // Try to get user location
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = [position.coords.longitude, position.coords.latitude];
                setDirections(destination);
            },
            function(error) {
                showNotification('Gagal mendapatkan lokasi. Silakan aktifkan GPS atau gunakan lokasi default.', 'error');
                // Use Mataram as default location
                userLocation = [116.1167, -8.5833];
                setDirections(destination);
            }
        );
    } else {
        setDirections(destination);
    }
}

// Set directions in the control
function setDirections(destination) {
    if (directionsControl) {
        directionsControl.setOrigin(userLocation);
        directionsControl.setDestination([destination.coords[1], destination.coords[0]]);
        showNotification('Rute navigasi diatur. Lihat panel navigasi di kiri atas.', 'success');
    } else {
        showNotification('Fitur navigasi belum tersedia', 'error');
    }
}

// Center map to destination
function centerMapToDestination(destination) {
    if (map) {
        map.flyTo({
            center: [destination.coords[1], destination.coords[0]],
            zoom: 14,
            pitch: 60,
            bearing: 0,
            duration: 2000
        });
    }
}

// Enhanced real-time visitor data
function getRealTimeVisitorData(destinationId) {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // More visitors during weekends and daytime
    let baseCount;
    if (day >= 5) { // Weekend
        baseCount = Math.floor(Math.random() * 300) + 100;
    } else if (hour >= 8 && hour <= 18) {
        baseCount = Math.floor(Math.random() * 200) + 50;
    } else {
        baseCount = Math.floor(Math.random() * 50) + 10;
    }
    
    // Status based on visitor count
    let status;
    if (baseCount > 200) status = 'high';
    else if (baseCount > 80) status = 'medium';
    else status = 'low';
    
    return {
        count: baseCount,
        status: status,
        lastUpdate: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
}

// Add 3D buildings to map
function add3DBuildings() {
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
    )?.id;

    if (!labelLayerId) return;

    if (!map.getLayer('3d-buildings')) {
        map.addLayer(
            {
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': currentTheme === 'dark' ? '#2C3E50' : '#E47B5A',
                    'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.6
                }
            },
            labelLayerId
        );
    }
}

// Add traffic layer
function addTrafficLayer() {
    if (trafficLayer) {
        if (!map.getSource('traffic')) {
            map.addSource('traffic', {
                type: 'vector',
                url: 'mapbox://mapbox.mapbox-traffic-v1'
            });
        }

        if (!map.getLayer('traffic')) {
            map.addLayer({
                id: 'traffic',
                type: 'line',
                source: 'traffic',
                'source-layer': 'traffic',
                paint: {
                    'line-color': [
                        'case',
                        ['==', ['get', 'congestion'], 'low'],
                        '#10B981',
                        ['==', ['get', 'congestion'], 'moderate'],
                        '#F59E0B',
                        '#EF4444'
                    ],
                    'line-width': 3,
                    'line-opacity': 0.6
                }
            });
        }
    }
}

// Toggle traffic layer
function toggleTraffic() {
    trafficLayer = !trafficLayer;
    
    if (trafficLayer) {
        addTrafficLayer();
        showNotification('Layer traffic diaktifkan', 'success');
    } else {
        if (map.getLayer('traffic')) {
            map.removeLayer('traffic');
            map.removeSource('traffic');
        }
        showNotification('Layer traffic dimatikan', 'info');
    }
}

// Toggle satellite view
function toggleSatellite() {
    satelliteLayer = !satelliteLayer;
    
    if (satelliteLayer) {
        map.setStyle('mapbox://styles/mapbox/satellite-streets-v11');
        showNotification('Tampilan satellite diaktifkan', 'success');
    } else {
        const style = currentTheme === 'dark' ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11';
        map.setStyle(style);
        showNotification('Tampilan satellite dimatikan', 'info');
    }
}

// Center map function
function centerMap() {
    if (map) {
        map.flyTo({
            center: [116.2667, -8.6500],
            zoom: 9,
            pitch: 45,
            bearing: 0,
            duration: 2000,
            easing: (t) => t * (2 - t)
        });
        showNotification('Peta dipusatkan ke Lombok', 'info');
    }
}

// Find nearby places
function findNearbyPlaces() {
    if (!userLocation) {
        showNotification('Mendapatkan lokasi Anda...', 'info');
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = [position.coords.longitude, position.coords.latitude];
                showNearbyPlaces(userLocation);
            },
            function() {
                showNotification('Aktifkan GPS untuk fitur ini', 'error');
            }
        );
    } else {
        showNearbyPlaces(userLocation);
    }
}

// Show nearby places
function showNearbyPlaces(location) {
    const categories = ['restoran', 'hotel', 'parkir', 'atm', 'spbu', 'rumah sakit'];
    const places = categories.map((cat, i) => ({
        name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Terdekat`,
        category: cat,
        distance: (Math.random() * 5).toFixed(1)
    }));
    
    // Create places panel
    const placesPanel = document.createElement('div');
    placesPanel.className = 'nearby-places-panel';
    placesPanel.innerHTML = `
        <div class="bg-black bg-opacity-85 text-white p-4 rounded-lg">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-bold">Tempat Terdekat</h3>
                <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-white">
                    ✕
                </button>
            </div>
            <div class="space-y-2">
                ${places.map(place => `
                    <div class="flex justify-between items-center p-2 hover:bg-gray-800 rounded cursor-pointer" 
                         onclick="searchPlace('${place.category}')">
                        <div class="flex items-center">
                            <span class="mr-3">📍</span>
                            <span>${place.name}</span>
                        </div>
                        <span class="text-accent">${place.distance} km</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add to map
    const mapContainer = document.getElementById('map');
    placesPanel.style.position = 'absolute';
    placesPanel.style.top = '10px';
    placesPanel.style.left = '10px';
    placesPanel.style.zIndex = '1000';
    placesPanel.style.maxWidth = '250px';
    
    mapContainer.appendChild(placesPanel);
}

// Search place function
function searchPlace(category) {
    showNotification(`Mencari ${category} terdekat...`, 'info');
    // In real implementation, this would search Mapbox Places API
}

// Clear all markers
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
}

// Animate map camera
function animateMapCamera() {
    let angle = 0;
    
    function rotateCamera() {
        if (map) {
            angle += 0.05;
            map.rotateTo(angle % 360, { duration: 0 });
            requestAnimationFrame(rotateCamera);
        }
    }
    
    // Start slow rotation after 3 seconds
    setTimeout(rotateCamera, 3000);
}

// Get visitor status color
function getVisitorStatusColor(status) {
    const colors = {
        'low': '#10B981',
        'medium': '#F59E0B',
        'high': '#EF4444'
    };
    return colors[status] || '#F59E0B';
}

// Start real-time updates
function startRealTimeUpdates() {
    // Update visitor status every 30 seconds
    setInterval(() => {
        updateVisitorStatus();
    }, 30000);
    
    // Update map markers every 2 minutes
    setInterval(() => {
        if (map) {
            addDestinationMarkers();
        }
    }, 120000);
}

function updateVisitorStatus() {
    console.log('Updating visitor status...');
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg text-white max-w-sm ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                document.body.removeChild(notification);
            }
        });
    }, 3000);
}

// Original functions (unchanged but updated for compatibility)
function initTypewriter() {
    const typed = new Typed('#typed-text', {
        strings: [
            'LOMBOK',
            'PANTAI SENGIGGI',
            'GUNUNG RINJANI',
            'PULAU GILI',
            'AIR TERJUN TIU KELEP',
            'KOTA MATARAM'
        ],
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000,
        startDelay: 500,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

function initDestinationFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filter = button.dataset.filter;
            filterDestinations(filter);
        });
    });
}

function filterDestinations(filter) {
    const grid = document.getElementById('destination-grid');
    
    anime({
        targets: grid.children,
        opacity: 0,
        translateY: 20,
        duration: 300,
        easing: 'easeInQuad',
        complete: () => {
            loadDestinations(filter);
        }
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                
                anime({
                    targets: counter,
                    innerHTML: [0, target],
                    duration: 2000,
                    round: 1,
                    easing: 'easeOutExpo'
                });
                
                observer.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

function loadDestinations(filter = 'all') {
    const grid = document.getElementById('destination-grid');
    let filteredData = destinationsData;
    
    if (filter !== 'all') {
        filteredData = destinationsData.filter(dest => dest.category === filter);
    }
    
    const displayData = filteredData.slice(0, 6);
    
    grid.innerHTML = displayData.map(dest => {
        const visitorData = getRealTimeVisitorData(dest.id);
        const statusColor = getVisitorStatusColor(visitorData.status);
        const statusText = getVisitorStatusText(visitorData.status);
        
        return `
            <div class="card-destination rounded-2xl overflow-hidden group cursor-pointer" onclick="viewDestination(${dest.id})">
                <div class="relative h-64 overflow-hidden">
                    <div class="visitor-indicator visitor-${visitorData.status}">
                        ${statusText}
                    </div>
                    <img src="${dest.image}" alt="${dest.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    <div class="absolute top-4 right-4 bg-accent text-bg-primary px-3 py-1 rounded-full text-sm font-chiron font-bold">
                        ⭐ ${dest.rating}
                    </div>
                    <div class="absolute bottom-4 left-4 right-4">
                        <h3 class="font-orbitron text-xl font-bold text-white mb-1">${dest.name}</h3>
                        <p class="font-hedvig text-sm text-gray-300">${dest.location}</p>
                    </div>
                    <div class="destination-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); startNavigationToDestination(${dest.id})">
                            🚗 Navigasi
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); viewDestination(${dest.id})">
                            📖 Detail
                        </button>
                    </div>
                </div>
                <div class="p-6 relative z-10">
                    <p class="font-quattrocento text-gray-300 mb-4 line-clamp-2">${dest.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="font-chiron text-accent font-bold">${dest.price}</span>
                        <button class="btn-futuristic px-4 py-2 rounded-full text-sm" onclick="event.stopPropagation(); viewDestination(${dest.id})">
                            Jelajahi
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    anime({
        targets: grid.children,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: anime.stagger(100),
        easing: 'easeOutQuad'
    });
}

function getVisitorStatusText(status) {
    const texts = {
        'low': 'SEPI',
        'medium': 'LUM',
        'high': 'RAM'
    };
    return texts[status] || 'LUM';
}

function scrollToDestinations() {
    document.getElementById('destinations').scrollIntoView({
        behavior: 'smooth'
    });
}

function viewDestination(id) {
    const destination = destinationsData.find(dest => dest.id === id);
    if (destination) {
        showDestinationModal(destination);
        centerMapToDestination(destination);
    }
}

function showDestinationModal(destination) {
    const visitorData = getRealTimeVisitorData(destination.id);
    
    const modal = document.createElement('div');
    modal.className = 'destination-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="text-gradient font-orbitron">${destination.name}</h2>
                <button onclick="closeModal()" class="close-btn">✕</button>
            </div>
            <div class="modal-body">
                <div class="destination-image">
                    <img src="${destination.image}" alt="${destination.name}">
                    <div class="real-time-badge">
                        <span class="visitor-count">${visitorData.count} pengunjung</span>
                        <span class="visitor-status ${visitorData.status}">${visitorData.status.toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="destination-info">
                    <div class="info-section">
                        <h3>📍 Lokasi</h3>
                        <p>${destination.location}</p>
                    </div>
                    
                    <div class="info-section">
                        <h3>📝 Deskripsi</h3>
                        <p>${destination.description}</p>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-card">
                            <div class="info-icon">⭐</div>
                            <div class="info-value">${destination.rating}</div>
                            <div class="info-label">Rating</div>
                        </div>
                        <div class="info-card">
                            <div class="info-icon">💰</div>
                            <div class="info-value">${destination.price}</div>
                            <div class="info-label">Harga</div>
                        </div>
                        <div class="info-card">
                            <div class="info-icon">👥</div>
                            <div class="info-value">${visitorData.count}</div>
                            <div class="info-label">Pengunjung</div>
                        </div>
                        <div class="info-card">
                            <div class="info-icon">🕒</div>
                            <div class="info-value">${destination.openingHours || '09:00-18:00'}</div>
                            <div class="info-label">Jam Operasi</div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3>🏪 Fasilitas</h3>
                        <div class="flex flex-wrap gap-2">
                            ${(destination.facilities || ['Parkir', 'Toilet', 'Warung']).map(facility => `
                                <span class="bg-gray-800 px-3 py-1 rounded-full text-sm">${facility}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="navigation-section">
                        <h3>🚗 Navigasi</h3>
                        <button onclick="startNavigationToDestination(${destination.id})" 
                                class="nav-btn primary">
                            🚗 Navigasi dari Lokasi Saya
                        </button>
                        <button onclick="shareLocation(${destination.id})" 
                                class="nav-btn secondary">
                            📤 Bagikan Lokasi
                        </button>
                        <div class="route-estimate">
                            <h4>Estimasi Perjalanan:</h4>
                            <p>Dari Kota Mataram: 30-45 menit</p>
                            <p>Kondisi jalan: ${getRandomRoadCondition()}</p>
                            <p>Estimasi biaya: Rp 50.000 - 100.000</p>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3>📞 Kontak</h3>
                        <p>${destination.contact || '+62 812-3456-7890'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Close modal function
function closeModal() {
    const modal = document.querySelector('.destination-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Share location function
function shareLocation(destinationId) {
    const destination = destinationsData.find(dest => dest.id === destinationId);
    if (!destination) return;
    
    const shareText = `Lihat ${destination.name} di Lombok!\nLokasi: ${destination.location}\nRating: ${destination.rating} ⭐\nHarga: ${destination.price}\n\nLihat di: ${window.location.origin}?destination=${destinationId}`;
    
    if (navigator.share) {
        navigator.share({
            title: destination.name,
            text: shareText,
            url: window.location.origin
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareText);
        showNotification('Informasi destinasi disalin ke clipboard!', 'success');
    }
}

// Get random road condition
function getRandomRoadCondition() {
    const conditions = ['Lancar', 'Normal', 'Sedikit Padat', 'Padat'];
    return conditions[Math.floor(Math.random() * conditions.length)];
}

// Get current language
function getCurrentLanguage() {
    return currentLanguage;
}

// Add CSS for pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    .custom-marker {
        transition: all 0.3s ease;
    }
    
    .custom-marker:hover {
        transform: scale(1.2);
        z-index: 1000;
    }
    
    .marker-circle.pulse {
        animation: pulse 2s infinite;
    }
`;
document.head.appendChild(style);
