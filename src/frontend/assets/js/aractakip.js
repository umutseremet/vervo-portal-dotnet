// src/frontend/assets/js/aractakip.js
// Araç Takip sayfası JavaScript fonksiyonları - DÜZELTILMIŞ

// Sayfa yüklendiğinde çalışacak ana fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    console.log('Arac Takip page loaded, checking auth...');
    
    // Title'ı parametrik yap
    updatePageTitle();
    
    // Auth kontrolü - NORMAL AUTH KONTROL
    try {
        if (window.authService && !window.authService.isAuthenticated()) {
            console.log('Not authenticated, redirecting to login...');
            window.location.href = '../index.html';
            return;
        }
    } catch (error) {
        console.warn('Auth service error, continuing without auth check:', error);
    }

    console.log('Authenticated, loading arac takip...');
    
    // Modal'ları kapat
    closeModal();
    closeEditRuhsatModal();
    closeEditKullaniciModal();
    closeEditAracBilgileriModal();
    
    // Header'ı yükle
    loadHeader();

    // Araçları yükle
    loadVehicles();
    
    // Modal event listeners
    setupModalEventListeners();
});

// Title'ı parametrik yap
function updatePageTitle() {
    try {
        const config = window.APP_CONFIG;
        if (config && config.PORTAL_TITLE) {
            const titleElement = document.getElementById('pageTitle');
            if (titleElement) {
                titleElement.textContent = `Araç Takip Sistemi - ${config.PORTAL_TITLE}`;
            }
        }
    } catch (error) {
        console.warn('Title update error:', error);
    }
}

// Header component'ini yükle
async function loadHeader() {
    try {
        const response = await fetch('../components/header.html');
        if (!response.ok) throw new Error('Header fetch failed');
        
        const html = await response.text();
        const container = document.getElementById('headerContainer');
        
        if (container) {
            container.innerHTML = html;
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Hamburger menu setup for arac takip
            setupHamburgerMenuForAracTakip();
            
            // Header initialization
            if (typeof window.initializeHeader === 'function') {
                try {
                    window.initializeHeader();
                } catch (error) {
                    console.warn('initializeHeader error:', error);
                }
            }
        }
    } catch (error) {
        console.error('Header load error:', error);
    }
}

// Hamburger menu setup - ARAC TAKİP İÇİN
function setupHamburgerMenuForAracTakip() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarClose');
    
    if (!sidebarToggle || !sidebar || !overlay) {
        console.warn('Sidebar elements not found');
        return;
    }
    
    sidebarToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Hamburger clicked on arac takip');
        sidebar.classList.add('show');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    });
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', function(e) {
            e.preventDefault();
            closeSidebar();
        });
    }
    
    overlay.addEventListener('click', function(e) {
        closeSidebar();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('show')) {
            closeSidebar();
        }
    });
    
    function closeSidebar() {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Araçları yükle
function loadVehicles() {
    try {
        // API'den araç verilerini al (şimdilik mock data)
        const vehicles = getMockVehicles();
        displayVehicles(vehicles);
    } catch (error) {
        console.error('Vehicle loading error:', error);
        showError('Araç verileri yüklenirken hata oluştu.');
    }
}

// Mock araç verileri - 12 ARAÇ EKLENDI
function getMockVehicles() {
    return [
        {
            id: 1,
            brand: 'Opel',
            model: 'Mokka',
            plate: '34 ABC 123',
            year: 2021,
            mileage: '46.152 km',
            consumption: '6.8 lt/100km',
            image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
            status: 'active'
        },
        {
            id: 2,
            brand: 'Volkswagen',
            model: 'Passat',
            plate: '06 DEF 4561',
            year: 2020,
            mileage: '52.840 km',
            consumption: '7.2 lt/100km',
            image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=400',
            status: 'active'
        },
        {
            id: 3,
            brand: 'Ford',
            model: 'Focus',
            plate: '35 GHI 789',
            year: 2019,
            mileage: '38.920 km',
            consumption: '6.5 lt/100km',
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
            status: 'active'
        },
        {
            id: 4,
            brand: 'Renault',
            model: 'Clio',
            plate: '16 JKL 012',
            year: 2022,
            mileage: '23.750 km',
            consumption: '5.9 lt/100km',
            image: 'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=400',
            status: 'active'
        },
        {
            id: 5,
            brand: 'Toyota',
            model: 'Corolla',
            plate: '34 MNO 345',
            year: 2021,
            mileage: '41.200 km',
            consumption: '6.3 lt/100km',
            image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
            status: 'active'
        },
        {
            id: 6,
            brand: 'BMW',
            model: 'X3',
            plate: '34 BMW 456',
            year: 2023,
            mileage: '15.200 km',
            consumption: '8.1 lt/100km',
            image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
            status: 'active'
        },
        {
            id: 7,
            brand: 'Mercedes',
            model: 'C200',
            plate: '06 MRC 789',
            year: 2022,
            mileage: '28.340 km',
            consumption: '7.8 lt/100km',
            image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
            status: 'active'
        },
        {
            id: 8,
            brand: 'Audi',
            model: 'A4',
            plate: '35 AUD 234',
            year: 2021,
            mileage: '33.680 km',
            consumption: '7.5 lt/100km',
            image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400',
            status: 'active'
        },
        {
            id: 9,
            brand: 'Peugeot',
            model: '3008',
            plate: '16 PGT 567',
            year: 2020,
            mileage: '45.920 km',
            consumption: '6.9 lt/100km',
            image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400',
            status: 'maintenance'
        },
        {
            id: 10,
            brand: 'Nissan',
            model: 'Qashqai',
            plate: '34 NSN 890',
            year: 2022,
            mileage: '19.750 km',
            consumption: '6.4 lt/100km',
            image: 'https://images.unsplash.com/photo-1549399495-61893655107d?w=400',
            status: 'active'
        },
        {
            id: 11,
            brand: 'Hyundai',
            model: 'Tucson',
            plate: '06 HYU 123',
            year: 2023,
            mileage: '8.500 km',
            consumption: '7.2 lt/100km',
            image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400',
            status: 'active'
        },
        {
            id: 12,
            brand: 'Kia',
            model: 'Sportage',
            plate: '35 KIA 456',
            year: 2021,
            mileage: '32.100 km',
            consumption: '7.0 lt/100km',
            image: 'https://images.unsplash.com/photo-1605559911160-a3d95d213904?w=400',
            status: 'active'
        }
    ];
}

// Araçları ekranda göster
function displayVehicles(vehicles) {
    const container = document.getElementById('vehicleGrid');
    if (!container) return;

    if (vehicles.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-car"></i>
                <h3>Araç bulunamadı</h3>
                <p>Arama kriterlerinize uygun araç bulunamadı.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = vehicles.map(vehicle => createVehicleCard(vehicle)).join('');
}

// Araç kartı HTML'i oluştur
function createVehicleCard(vehicle) {
    return `
        <div class="vehicle-card" onclick="openVehicleModal(${vehicle.id})">
            <div class="vehicle-image-container">
                <img src="${vehicle.image}" alt="${vehicle.brand} ${vehicle.model}" class="vehicle-image">
                <div class="vehicle-status status-${vehicle.status}">
                    <i class="fas fa-circle"></i>
                </div>
            </div>
            <div class="vehicle-info">
                <div class="vehicle-header">
                    <h3 class="vehicle-title">${vehicle.brand} ${vehicle.model}</h3>
                    <span class="vehicle-year">${vehicle.year}</span>
                </div>
                <div class="vehicle-plate">${vehicle.plate}</div>
                <div class="vehicle-details">
                    <div class="detail-item">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>${vehicle.mileage}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-gas-pump"></i>
                        <span>${vehicle.consumption}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Filter toggle fonksiyonu
function toggleFilters() {
    const content = document.getElementById('filterContent');
    const icon = document.getElementById('filterToggleIcon');
    
    if (content.style.maxHeight === '0px' || content.style.maxHeight === '') {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.innerHTML = '<i class="fas fa-chevron-up"></i>';
    } else {
        content.style.maxHeight = '0';
        icon.innerHTML = '<i class="fas fa-chevron-down"></i>';
    }
}

// Modal fonksiyonları
function openVehicleModal(vehicleId) {
    const vehicle = getMockVehicles().find(v => v.id === vehicleId);
    if (!vehicle) return;

    const modal = document.getElementById('vehicleModal');
    if (modal) {
        // Modal içeriğini güncelle
        updateModalContent(vehicle);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('vehicleModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function closeEditRuhsatModal() {
    const modal = document.getElementById('editRuhsatModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function closeEditKullaniciModal() {
    const modal = document.getElementById('editKullaniciModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function closeEditAracBilgileriModal() {
    const modal = document.getElementById('editAracBilgileriModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Modal içeriğini güncelle
function updateModalContent(vehicle) {
    // Modal başlığını güncelle
    const titleElement = document.querySelector('#vehicleModal .modal-header h2');
    if (titleElement) {
        titleElement.textContent = `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`;
    }

    // Modal içeriğini güncelle (detaylı bilgiler)
    const bodyElement = document.querySelector('#vehicleModal .modal-body');
    if (bodyElement) {
        bodyElement.innerHTML = createModalContent(vehicle);
    }
}

// Modal içerik HTML'i oluştur - DETAYLI MODAL
function createModalContent(vehicle) {
    return `
        <div class="vehicle-card-modal">
            <div class="row">
                <div class="col-md-6">
                    <div class="vehicle-image-container-modal">
                        <img src="${vehicle.image}" alt="${vehicle.brand} ${vehicle.model}" class="vehicle-image-modal">
                        <div class="vehicle-plate-overlay-modal">${vehicle.plate}</div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="vehicle-details-modal">
                        <h3>${vehicle.brand} ${vehicle.model}</h3>
                        <div class="detail-row">
                            <strong>Model Yılı:</strong> ${vehicle.year}
                        </div>
                        <div class="detail-row">
                            <strong>Kilometre:</strong> ${vehicle.mileage}
                        </div>
                        <div class="detail-row">
                            <strong>Yakıt Tüketimi:</strong> ${vehicle.consumption}
                        </div>
                        <div class="detail-row">
                            <strong>Durum:</strong> 
                            <span class="status-badge status-${vehicle.status}">
                                ${vehicle.status === 'active' ? 'Aktif' : vehicle.status === 'maintenance' ? 'Bakımda' : 'Pasif'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal içindeki araç detay sayfası -->
            <div class="vehicle-detail-tabs mt-4">
                <ul class="nav nav-tabs" id="vehicleDetailTabs">
                    <li class="nav-item">
                        <a class="nav-link active" data-bs-toggle="tab" href="#vehicleInfo-${vehicle.id}">Araç Bilgileri</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-bs-toggle="tab" href="#vehicleLocation-${vehicle.id}">Konum</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-bs-toggle="tab" href="#vehicleHistory-${vehicle.id}">Geçmiş</a>
                    </li>
                </ul>
                
                <div class="tab-content mt-3">
                    <div class="tab-pane fade show active" id="vehicleInfo-${vehicle.id}">
                        <div class="row">
                            <div class="col-md-6">
                                <h5>Ruhsat Bilgileri</h5>
                                <table class="table table-borderless">
                                    <tr><td><strong>Plaka:</strong></td><td>${vehicle.plate}</td></tr>
                                    <tr><td><strong>Marka:</strong></td><td>${vehicle.brand}</td></tr>
                                    <tr><td><strong>Model:</strong></td><td>${vehicle.model}</td></tr>
                                    <tr><td><strong>Yıl:</strong></td><td>${vehicle.year}</td></tr>
                                </table>
                                <button class="btn btn-outline-primary btn-sm" onclick="openEditRuhsatModal(${vehicle.id})">
                                    <i class="fas fa-edit"></i> Düzenle
                                </button>
                            </div>
                            <div class="col-md-6">
                                <h5>Kullanıcı Bilgileri</h5>
                                <table class="table table-borderless">
                                    <tr><td><strong>Sürücü:</strong></td><td>Ahmet Yılmaz</td></tr>
                                    <tr><td><strong>Telefon:</strong></td><td>+90 532 123 45 67</td></tr>
                                </table>
                                <button class="btn btn-outline-primary btn-sm" onclick="openEditKullaniciModal(${vehicle.id})">
                                    <i class="fas fa-edit"></i> Düzenle
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="vehicleLocation-${vehicle.id}">
                        <div class="location-info">
                            <h5>Güncel Konum</h5>
                            <p><i class="fas fa-map-marker-alt"></i> Beşiktaş, İstanbul</p>
                            <div id="vehicleMap" style="height: 300px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <span class="text-muted">Harita yükleniyor...</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="vehicleHistory-${vehicle.id}">
                        <h5>Son Hareketler</h5>
                        <div class="timeline">
                            <div class="timeline-item">
                                <span class="timeline-time">14:30</span>
                                <span class="timeline-content">Araç hareket başladı</span>
                            </div>
                            <div class="timeline-item">
                                <span class="timeline-time">13:45</span>
                                <span class="timeline-content">Park edildi</span>
                            </div>
                            <div class="timeline-item">
                                <span class="timeline-time">12:20</span>
                                <span class="timeline-content">Yakıt alındı</span>
                            </div>
                            <div class="timeline-item">
                                <span class="timeline-time">11:15</span>
                                <span class="timeline-content">Servis durağı</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Edit modal fonksiyonları
function openEditRuhsatModal(vehicleId) {
    const modal = document.getElementById('editRuhsatModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function openEditKullaniciModal(vehicleId) {
    const modal = document.getElementById('editKullaniciModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function openEditAracBilgileriModal(vehicleId) {
    const modal = document.getElementById('editAracBilgileriModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Modal event listeners setup
function setupModalEventListeners() {
    // Modal close events
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
            closeEditRuhsatModal();
            closeEditKullaniciModal();
            closeEditAracBilgileriModal();
        }
    });

    // ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeEditRuhsatModal();
            closeEditKullaniciModal();
            closeEditAracBilgileriModal();
        }
    });
}

// Search fonksiyonu
function searchVehicles() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const vehicles = getMockVehicles();
    
    const filteredVehicles = vehicles.filter(vehicle => 
        vehicle.brand.toLowerCase().includes(searchTerm) ||
        vehicle.model.toLowerCase().includes(searchTerm) ||
        vehicle.plate.toLowerCase().includes(searchTerm)
    );
    
    displayVehicles(filteredVehicles);
}

// Hata mesajı göster
function showError(message) {
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer && typeof window.showAlert === 'function') {
        window.showAlert(message, 'danger');
    } else if (typeof showAlert === 'function') {
        showAlert(message, 'danger');
    } else {
        console.error(message);
        alert(message);
    }
}

// Global export for use in HTML
window.aracTakip = {
    toggleFilters,
    openVehicleModal,
    closeModal,
    closeEditRuhsatModal,
    closeEditKullaniciModal,
    closeEditAracBilgileriModal,
    searchVehicles
};

// Global fonksiyonları window object'ine ekle (eski HTML ile uyumluluk için)
window.toggleFilters = toggleFilters;
window.openVehicleModal = openVehicleModal;
window.closeModal = closeModal;
window.closeEditRuhsatModal = closeEditRuhsatModal;
window.closeEditKullaniciModal = closeEditKullaniciModal;
window.closeEditAracBilgileriModal = closeEditAracBilgileriModal;
window.openEditRuhsatModal = openEditRuhsatModal;
window.openEditKullaniciModal = openEditKullaniciModal;
window.openEditAracBilgileriModal = openEditAracBilgileriModal;
window.searchVehicles = searchVehicles;