// Visit Lombok ID - Main JavaScript with Advanced Features

// Global variables
let map;
let markers = [];
let currentTheme = 'dark';
let currentLanguage = 'id';
let trafficLayer = false;
let satelliteLayer = false;

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

// Mapbox GL JS Integration
function initializeMap() {
    // Mapbox access token (you should replace this with your own token)
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0cI1fxAfuz_4IA';
    
    const mapStyle = currentTheme === 'dark' ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11';
    
    map = new mapboxgl.Map({
        container: 'map',
        style: mapStyle,
        center: [116.2667, -8.6500], // Center of Lombok
        zoom: 9,
        pitch: 45,
        bearing: 0
    });
    
    // Add navigation controls
    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-right');
    
    // Add fullscreen control
    const fullscreen = new mapboxgl.FullscreenControl();
    map.addControl(fullscreen, 'top-right');
    
    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    });
    map.addControl(geolocate, 'top-right');
    
    // Add scale control
    const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
    });
    map.addControl(scale, 'bottom-left');
    
    // Load destination markers when map is ready
    map.on('load', function() {
        addDestinationMarkers();
        add3DBuildings();
        
        // Add map movement animation
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

// Add destination markers to map
function addDestinationMarkers() {
    clearMarkers();
    
    destinationsData.forEach(destination => {
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
        
        // Add pulsing effect for high traffic
        if (visitorStatus === 'high') {
            markerEl.style.animation = 'pulse 2s infinite';
        }
        
        // Create marker
        const marker = new mapboxgl.Marker(markerEl)
            .setLngLat([destination.coords[1], destination.coords[0]])
            .setPopup(createPopup(destination, visitorStatus))
            .addTo(map);
        
        markers.push(marker);
        
        // Add click event
        markerEl.addEventListener('click', () => {
            showDestinationDetails(destination);
        });
    });
}

// Create popup for marker
function createPopup(destination, visitorStatus) {
    const statusText = {
        'low': translate('map.low'),
        'medium': translate('map.medium'),
        'high': translate('map.high')
    };
    
    const statusColor = getVisitorStatusColor(visitorStatus);
    
    return new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false
    })
    .setHTML(`
        <div class="p-4 max-w-xs">
            <div class="flex items-center mb-2">
                <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${statusColor}"></div>
                <span class="text-xs font-bold">${statusText[visitorStatus]}</span>
            </div>
            <img src="${destination.image}" alt="${destination.name}" class="w-full h-32 object-cover rounded-lg mb-3">
            <h3 class="font-bold text-lg mb-2">${destination.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${destination.location}</p>
            <p class="text-sm mb-3">${destination.description}</p>
            <div class="flex justify-between items-center">
                <span class="font-bold text-accent">${destination.price}</span>
                <div class="flex items-center">
                    <span class="text-yellow-400 mr-1">⭐</span>
                    <span class="text-sm">${destination.rating}</span>
                </div>
            </div>
            <button onclick="viewDestination(${destination.id})" class="w-full mt-3 bg-accent text-white py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all">
                ${translate('hero.cta1')}
            </button>
        </div>
    `);
}

// Add 3D buildings to map
function add3DBuildings() {
    // Insert the layer beneath any symbol layer.
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
    ).id;
    
    // The 'building' layer in the mapbox-streets vector source contains building-height data from OpenStreetMap.
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

// Map control functions
function centerMap() {
    map.flyTo({
        center: [116.2667, -8.6500],
        zoom: 9,
        pitch: 45,
        bearing: 0,
        duration: 2000,
        easing: (t) => t * (2 - t)
    });
}

function toggleTraffic() {
    trafficLayer = !trafficLayer;
    
    if (trafficLayer) {
        // Add traffic layer (this would require a traffic data source in real implementation)
        console.log('Traffic layer enabled');
        showNotification('Traffic layer enabled', 'success');
    } else {
        console.log('Traffic layer disabled');
        showNotification('Traffic layer disabled', 'info');
    }
}

function toggleSatellite() {
    satelliteLayer = !satelliteLayer;
    
    if (satelliteLayer) {
        map.setStyle('mapbox://styles/mapbox/satellite-v9');
        showNotification('Satellite view enabled', 'success');
    } else {
        const style = currentTheme === 'dark' ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11';
        map.setStyle(style);
        showNotification('Satellite view disabled', 'info');
    }
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
            angle += 0.1;
            map.rotateTo(angle, { duration: 0 });
            requestAnimationFrame(rotateCamera);
        }
    }
    
    // Start slow rotation after 3 seconds
    setTimeout(rotateCamera, 3000);
}

// Real-time visitor simulation
function getRandomVisitorStatus() {
    const statuses = ['low', 'medium', 'high'];
    const weights = [0.3, 0.5, 0.2]; // 30% low, 50% medium, 20% high
    
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
        'low': '#10B981',    // Green
        'medium': '#F59E0B', // Yellow
        'high': '#EF4444'    // Red
    };
    return colors[status];
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
    // In real implementation, this would fetch from API
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

// Original functions (unchanged)
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
    
    grid.innerHTML = displayData.map(dest => `
        <div class="card-destination rounded-2xl overflow-hidden group cursor-pointer" onclick="viewDestination(${dest.id})">
            <div class="relative h-64 overflow-hidden">
                <div class="visitor-indicator visitor-${getRandomVisitorStatus()}">
                    ${getVisitorStatusText(getRandomVisitorStatus())}
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
            </div>
            <div class="p-6 relative z-10">
                <p class="font-quattrocento text-gray-300 mb-4 line-clamp-2">${dest.description}</p>
                <div class="flex justify-between items-center">
                    <span class="font-chiron text-accent font-bold">${dest.price}</span>
                    <button class="btn-futuristic px-4 py-2 rounded-full text-sm">
                        ${translate('hero.cta1')}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
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
        'id': { low: 'SEPI', medium: 'LUM', high: 'RAM' },
        'en': { low: 'LOW', medium: 'MED', high: 'HIGH' },
        'ja': { low: '静か', medium: '適度', high: '混雑' },
        'ko': { low: '적음', medium: '적당', high: '많음' },
        'zh': { low: '少', medium: '中', high: '多' },
        'fr': { low: 'CALME', medium: 'MOD', high: 'HAUT' },
        'es': { low: 'BAJO', medium: 'MED', high: 'ALTO' },
        'pt': { low: 'BAIXO', medium: 'MED', high: 'ALTO' },
        'ru': { low: 'МАЛО', medium: 'СРЕД', high: 'МНОГО' }
    };
    
    const lang = getCurrentLanguage();
    return texts[lang] ? texts[lang][status] : status.toUpperCase();
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
    }
}

function showDestinationModal(destination) {
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
                <div class="mb-4">
                    <div class="flex items-center mb-2">
                        <div class="w-3 h-3 rounded-full mr-2 visitor-${getRandomVisitorStatus()}"></div>
                        <span class="text-sm">${getVisitorStatusText(getRandomVisitorStatus())} - ${translate('map.visitorLegend').split(':')[0]}</span>
                    </div>
                </div>
                <button class="w-full bg-accent text-bg-primary py-3 rounded-lg font-chiron font-bold hover:bg-opacity-90 transition-all">
                    ${translate('hero.cta1')}
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
`;
document.head.appendChild(style);
