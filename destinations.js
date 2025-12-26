// Visit Lombok ID - Destinations Page JavaScript with Mapbox

// Global variables
let allDestinationsComplete = [];
let currentDestinations = [];
let displayedCount = 12;
let map;
let markers = [];
let realTimeMode = true;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initScrollReveal();
    initDestinationFilter();
    initMobileMenu();
    initSearch();
    initSort();
    initializeMap();
    loadAllDestinations();
});

// Initialize Mapbox GL JS
function initializeMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0cI1fxAfuz_4IA';
    
    const mapStyle = document.body.classList.contains('light-mode') ? 
        'mapbox://styles/mapbox/streets-v11' : 
        'mapbox://styles/mapbox/dark-v10';
    
    map = new mapboxgl.Map({
        container: 'map',
        style: mapStyle,
        center: [116.2667, -8.6500],
        zoom: 9,
        pitch: 45,
        bearing: 0
    });
    
    // Add controls
    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-right');
    
    const fullscreen = new mapboxgl.FullscreenControl();
    map.addControl(fullscreen, 'top-right');
    
    const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
    });
    map.addControl(geolocate, 'top-right');
    
    const scale = new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'metric' });
    map.addControl(scale, 'bottom-left');
    
    map.on('load', function() {
        addDestinationMarkers();
        add3DBuildings();
    });
}

// Add destination markers to map
function addDestinationMarkers() {
    clearMarkers();
    
    currentDestinations.slice(0, 50).forEach(destination => { // Show first 50 on map
        const visitorStatus = getRandomVisitorStatus();
        const markerColor = getVisitorStatusColor(visitorStatus);
        
        // Create custom marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'custom-marker';
        markerEl.style.width = '20px';
        markerEl.style.height = '20px';
        markerEl.style.borderRadius = '50%';
        markerEl.style.backgroundColor = markerColor;
        markerEl.style.border = '2px solid white';
        markerEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        markerEl.style.cursor = 'pointer';
        
        if (visitorStatus === 'high') {
            markerEl.style.animation = 'pulse 2s infinite';
        }
        
        const marker = new mapboxgl.Marker(markerEl)
            .setLngLat([destination.coords[1], destination.coords[0]])
            .setPopup(createMapPopup(destination, visitorStatus))
            .addTo(map);
        
        markers.push(marker);
        
        markerEl.addEventListener('click', () => {
            showDestinationDetails(destination);
        });
    });
}

// Create map popup
function createMapPopup(destination, visitorStatus) {
    const statusText = getVisitorStatusText(visitorStatus);
    const statusColor = getVisitorStatusColor(visitorStatus);
    
    return new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false
    })
    .setHTML(`
        <div class="p-4 max-w-xs">
            <div class="flex items-center mb-2">
                <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${statusColor}"></div>
                <span class="text-xs font-bold">${statusText}</span>
            </div>
            <img src="${destination.image}" alt="${destination.name}" class="w-full h-32 object-cover rounded-lg mb-3">
            <h3 class="font-bold text-lg mb-2">${destination.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${destination.location}</p>
            <p class="text-sm mb-3">${destination.description}</p>
            <div class="flex justify-between items-center mb-3">
                <span class="font-bold text-accent">${destination.price}</span>
                <div class="flex items-center">
                    <span class="text-yellow-400 mr-1">⭐</span>
                    <span class="text-sm">${destination.rating}</span>
                </div>
            </div>
            <div class="flex items-center text-xs text-gray-500 mb-3">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Real-time visitor status</span>
            </div>
            <button onclick="viewDestination(${destination.id})" class="w-full bg-accent text-white py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all">
                Lihat Detail
            </button>
        </div>
    `);
}

// Map control functions
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
    }
}

function toggleTraffic() {
    realTimeMode = !realTimeMode;
    const btn = event.target;
    
    if (realTimeMode) {
        btn.textContent = 'Stop Real-time';
        btn.style.background = '#EF4444';
        startRealTimeUpdates();
        showNotification('Real-time tracking enabled', 'success');
    } else {
        btn.textContent = 'Real-time';
        btn.style.background = 'rgba(0, 0, 0, 0.7)';
        showNotification('Real-time tracking disabled', 'info');
    }
}

function toggleSatellite() {
    if (map) {
        const currentStyle = map.getStyle().sprite;
        const isSatellite = currentStyle && currentStyle.includes('satellite');
        
        if (!isSatellite) {
            map.setStyle('mapbox://styles/mapbox/satellite-v9');
            showNotification('Satellite view enabled', 'success');
        } else {
            const style = document.body.classList.contains('light-mode') ? 
                'mapbox://styles/mapbox/streets-v11' : 
                'mapbox://styles/mapbox/dark-v10';
            map.setStyle(style);
            showNotification('Satellite view disabled', 'info');
        }
    }
}

// Add 3D buildings
function add3DBuildings() {
    if (!map.getLayer('3d-buildings')) {
        const layers = map.getStyle().layers;
        const labelLayerId = layers.find(
            (layer) => layer.type === 'symbol' && layer.layout['text-field']
        ).id;
        
        map.addLayer(
            {
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': document.body.classList.contains('light-mode') ? '#E47B5A' : '#2C3E50',
                    'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
                    'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
                    'fill-extrusion-opacity': 0.6
                }
            },
            labelLayerId
        );
    }
}

// Clear markers
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
}

// Real-time visitor functions
function getRandomVisitorStatus() {
    const statuses = ['low', 'medium', 'high'];
    const weights = [0.3, 0.5, 0.2];
    
    let random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < statuses.length; i++) {
        sum += weights[i];
        if (random <= sum) {
            return statuses[i];
        }
    }
    
    return 'medium';
}

function getVisitorStatusColor(status) {
    const colors = {
        'low': '#10B981',
        'medium': '#F59E0B',
        'high': '#EF4444'
    };
    return colors[status];
}

function getVisitorStatusText(status) {
    const texts = {
        'low': 'Sepi',
        'medium': 'Lumayan',
        'high': 'Ramai'
    };
    return texts[status];
}

// Load all destinations
function loadAllDestinations() {
    displayDestinations(allDestinationsComplete.slice(0, displayedCount));
    
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            displayedCount += 12;
            const newDestinations = currentDestinations.slice(0, displayedCount);
            displayDestinations(newDestinations);
            
            if (displayedCount >= currentDestinations.length) {
                loadMoreBtn.style.display = 'none';
            }
        });
    }
}

// Display destinations
function displayDestinations(destinations) {
    const grid = document.getElementById('destination-grid');
    
    grid.innerHTML = destinations.map(dest => {
        const visitorStatus = getRandomVisitorStatus();
        const statusColor = getVisitorStatusColor(visitorStatus);
        const statusText = getVisitorStatusText(visitorStatus);
        
        return `
            <div class="card-destination rounded-2xl overflow-hidden group cursor-pointer" onclick="viewDestination(${dest.id})">
                <div class="relative h-48 overflow-hidden">
                    <div class="visitor-indicator visitor-${visitorStatus}">
                        ${statusText}
                    </div>
                    <img src="${dest.image}" alt="${dest.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    <div class="absolute top-3 right-3 bg-accent text-bg-primary px-2 py-1 rounded-full text-xs font-chiron font-bold">
                        ⭐ ${dest.rating}
                    </div>
                    <div class="absolute bottom-3 left-3 right-3">
                        <h3 class="font-orbitron text-lg font-bold text-white mb-1">${dest.name}</h3>
                        <p class="font-hedvig text-xs text-gray-300">${dest.location}</p>
                    </div>
                </div>
                <div class="p-4 relative z-10">
                    <p class="font-quattrocento text-gray-300 text-sm mb-3 line-clamp-2">${dest.description}</p>
                    <div class="flex items-center justify-between mb-3">
                        <span class="font-chiron text-accent font-bold text-sm">${dest.price}</span>
                        <div class="flex items-center gap-1">
                            <div class="w-2 h-2 rounded-full" style="background-color: ${statusColor}"></div>
                            <span class="text-xs text-gray-400">${statusText}</span>
                        </div>
                    </div>
                    <div class="flex justify-between items-center">
                        <button class="bg-accent text-bg-primary px-3 py-1 rounded-full text-xs font-chiron hover:bg-opacity-90 transition-all">
                            JELAJAHI
                        </button>
                        <span class="text-xs text-gray-400">Real-time</span>
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
        delay: anime.stagger(50),
        easing: 'easeOutQuad'
    });
}

// View destination details
function viewDestination(id) {
    const destination = allDestinationsComplete.find(dest => dest.id === id);
    if (destination) {
        showDestinationModal(destination);
    }
}

function showDestinationModal(destination) {
    const visitorStatus = getRandomVisitorStatus();
    const statusColor = getVisitorStatusColor(visitorStatus);
    const statusText = getVisitorStatusText(visitorStatus);
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div class="relative">
                <img src="${destination.image}" alt="${destination.name}" class="w-full h-64 object-cover rounded-t-2xl">
                <button onclick="closeModal()" class="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70">
                    ✕
                </button>
            </div>
            <div class="p-6">
                <h2 class="font-orbitron text-3xl font-bold text-gradient mb-2">${destination.name}</h2>
                <p class="font-hedvig text-gray-300 mb-4">📍 ${destination.location}</p>
                <p class="font-quattrocento text-gray-300 mb-6">${destination.description}</p>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <div class="text-accent font-bold text-2xl">⭐ ${destination.rating}</div>
                        <div class="text-gray-300 text-sm">Rating</div>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <div class="text-accent font-bold text-lg">${destination.price}</div>
                        <div class="text-gray-300 text-sm">Price</div>
                    </div>
                </div>
                
                <div class="bg-gray-800 p-4 rounded-lg mb-6">
                    <h3 class="font-bold text-white mb-3">Real-time Visitor Status</h3>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="w-4 h-4 rounded-full mr-3" style="background-color: ${statusColor}"></div>
                            <span class="text-white font-bold">${statusText}</span>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-accent">${Math.floor(Math.random() * 500) + 50}</div>
                            <div class="text-xs text-gray-400">pengunjung saat ini</div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <div class="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Sepi</span>
                            <span>Ramai</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-2">
                            <div class="h-2 rounded-full" style="width: ${status === 'low' ? '25%' : status === 'medium' ? '60%' : '90%'}; background-color: ${statusColor}"></div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <button class="bg-blue-600 text-white py-3 rounded-lg font-chiron font-bold hover:bg-blue-700 transition-all">
                        📍 Navigasi
                    </button>
                    <button class="bg-green-600 text-white py-3 rounded-lg font-chiron font-bold hover:bg-green-700 transition-all">
                        📞 Hubungi
                    </button>
                </div>
                
                <button class="w-full bg-accent text-bg-primary py-3 rounded-lg font-chiron font-bold hover:bg-opacity-90 transition-all">
                    JELAJAHI DESTINASI
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    window.closeModal = () => {
        document.body.removeChild(modal);
        delete window.closeModal;
    };
}

// Other functions
function initSearch() {
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchDestinations(e.target.value);
            }, 300);
        });
    }
}

function searchDestinations(query) {
    const filteredData = allDestinationsComplete.filter(dest => 
        dest.name.toLowerCase().includes(query.toLowerCase()) ||
        dest.location.toLowerCase().includes(query.toLowerCase()) ||
        dest.description.toLowerCase().includes(query.toLowerCase())
    );
    
    currentDestinations = filteredData;
    displayedCount = 12;
    displayDestinations(filteredData.slice(0, displayedCount));
    
    if (map) {
        addDestinationMarkers();
    }
}

function initSort() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortDestinations(e.target.value);
        });
    }
}

function sortDestinations(sortBy) {
    let sortedData = [...currentDestinations];
    
    switch(sortBy) {
        case 'name':
            sortedData.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            sortedData.sort((a, b) => b.rating - a.rating);
            break;
        case 'location':
            sortedData.sort((a, b) => a.location.localeCompare(b.location));
            break;
        case 'visitors':
            sortedData.sort((a, b) => {
                const aStatus = getRandomVisitorStatus();
                const bStatus = getRandomVisitorStatus();
                const statusOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                return statusOrder[bStatus] - statusOrder[aStatus];
            });
            break;
    }
    
    displayDestinations(sortedData.slice(0, displayedCount));
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
    let filteredData = allDestinationsComplete;
    
    if (filter !== 'all') {
        filteredData = allDestinationsComplete.filter(dest => dest.category === filter);
    }
    
    currentDestinations = filteredData;
    displayedCount = 12;
    displayDestinations(filteredData.slice(0, displayedCount));
    
    if (map) {
        addDestinationMarkers();
    }
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg text-white max-w-sm ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
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

// Initialize destinations data
document.addEventListener('DOMContentLoaded', function() {
    // Copy destinations data from main.js or import it
    if (typeof destinationsData !== 'undefined') {
        allDestinationsComplete = destinationsData;
    } else {
        // Fallback data
        allDestinationsComplete = [
            { id: 1, name: "Pantai Senggigi", category: "beach", location: "Lombok Barat", coords: [-8.4969, 116.0467], description: "Pantai ikonik Lombok dengan pasir putih dan sunset menakjubkan", image: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=400", rating: 4.8, price: "Free - Rp 10.000" },
            { id: 2, name: "Gunung Rinjani", category: "mountain", location: "Lombok Timur", coords: [-8.4100, 116.4600], description: "Gunung berapi tertinggi kedua di Indonesia dengan pemandangan spektakuler", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", rating: 4.9, price: "Rp 150.000 - Rp 500.000" },
            { id: 3, name: "Air Terjun Tiu Kelep", category: "waterfall", location: "Lombok Utara", coords: [-8.3333, 116.0833], description: "Air terjun megah dengan kolam alami yang jernih", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400", rating: 4.7, price: "Rp 10.000 - Rp 20.000" },
            { id: 4, name: "Desa Sade", category: "culture", location: "Lombok Tengah", coords: [-8.8333, 116.1667], description: "Desa adat Sasak dengan arsitektur tradisional", image: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400", rating: 4.6, price: "Rp 20.000 - Rp 50.000" },
            { id: 5, name: "Pusat Kuliner Taliwang", category: "culinary", location: "Lombok Barat", coords: [-8.6167, 116.1333], description: "Surga ayam bakar Taliwang yang pedas dan lezat", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400", rating: 4.6, price: "Rp 25.000 - Rp 100.000" }
        ];
    }
    
    currentDestinations = allDestinationsComplete;
});
