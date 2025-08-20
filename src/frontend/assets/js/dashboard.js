// src/frontend/assets/js/dashboard.js
// Dashboard sayfası JavaScript fonksiyonları - AUTH KONTROLÜ AKTİF

// Dashboard sayfası için auth kontrolü
function checkDashboardAuth() {
    console.log('🔐 Checking dashboard authentication...');
    
    try {
        // AuthService varsa kullan
        if (window.authService) {
            if (window.authService.isAuthenticated()) {
                console.log('✅ User is authenticated');
                return true;
            } else {
                console.log('❌ User is not authenticated');
                console.log('🔄 Redirecting to login...');
                window.location.href = '../index.html';
                return false;
            }
        }
        
        // AuthService yoksa basit token kontrolü
        const token = localStorage.getItem('authToken') || localStorage.getItem('vervo_auth_token');
        const user = localStorage.getItem('user') || localStorage.getItem('vervo_user_data');
        
        if (!token || !user) {
            console.log('❌ No auth data found');
            console.log('🔄 Redirecting to login...');
            window.location.href = '../index.html';
            return false;
        }
        
        console.log('✅ Auth data found, user is authenticated');
        return true;
        
    } catch (error) {
        console.error('❌ Auth check error:', error);
        console.log('🔄 Redirecting to login due to error...');
        window.location.href = '../index.html';
        return false;
    }
}

// Dashboard initialization
function initDashboard() {
    console.log('📊 Initializing dashboard...');
    
    // Auth kontrolü yap
    if (!checkDashboardAuth()) {
        return; // Auth fail olursa daha fazla işlem yapma
    }
    
    console.log('✅ Dashboard authentication passed, continuing with initialization...');
    
    // Title güncelle
    updatePageTitle();
    
    // Header'ı yükle
    loadHeader();
    
    // Welcome mesajını güncelle
    updateWelcomeMessage();
    
    // Dashboard verilerini yükle
    loadDashboardData();
    
    // Event listeners'ı setup et
    setupEventListeners();
    
    console.log('✅ Dashboard initialized successfully');
}

// Header component'ini yükle
async function loadHeader() {
    try {
        console.log('🔄 Loading header component...');
        
        const response = await fetch('../components/header.html');
        if (response.ok) {
            const html = await response.text();
            const container = document.getElementById('headerContainer');
            
            if (container) {
                container.innerHTML = html;
                console.log('✅ Header component loaded');
                
                // Header initialization
                setTimeout(() => {
                    if (typeof window.initializeHeader === 'function') {
                        window.initializeHeader();
                    } else {
                        console.log('⏳ Waiting for header initialization...');
                        setTimeout(() => {
                            if (typeof window.initializeHeader === 'function') {
                                window.initializeHeader();
                            }
                        }, 100);
                    }
                }, 50);
                
            } else {
                console.error('❌ Header container not found');
            }
        } else {
            console.error('❌ Header component load failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Error loading header:', error);
    }
}

// Page title'ı güncelle
function updatePageTitle() {
    if (window.APP_CONFIG && window.APP_CONFIG.PORTAL_TITLE) {
        document.title = `Dashboard - ${window.APP_CONFIG.PORTAL_TITLE}`;
    }
}

// Welcome message'ı güncelle
function updateWelcomeMessage() {
    try {
        const userStr = localStorage.getItem('user') || localStorage.getItem('vervo_user_data');
        if (userStr) {
            const user = JSON.parse(userStr);
            const userName = user.name || user.fullname || user.firstName || 'Kullanıcı';
            
            const welcomeUserNameEl = document.getElementById('welcomeUserName');
            if (welcomeUserNameEl) {
                welcomeUserNameEl.textContent = userName;
            }
            
            console.log('✅ Welcome message updated for:', userName);
        }
        
        // Update welcome message with portal title
        if (window.APP_CONFIG && window.APP_CONFIG.PORTAL_TITLE) {
            const welcomeMessageEl = document.getElementById('welcomeMessage');
            if (welcomeMessageEl) {
                welcomeMessageEl.textContent = `${window.APP_CONFIG.PORTAL_TITLE}'a hoş geldiniz. Buradan tüm sistemlerinizi yönetebilir, raporlarınızı görüntüleyebilir ve araç takip sistemini kullanabilirsiniz.`;
            }
        }
    } catch (error) {
        console.warn('⚠️ Welcome message update error:', error);
    }
}

// Dashboard verilerini yükle
function loadDashboardData() {
    try {
        console.log('📊 Loading dashboard data...');
        
        // Mock data ile stats'ları güncelle
        updateDashboardStats();
        
        // Chart'ları yükle
        loadCharts();
        
        console.log('✅ Dashboard data loaded');
    } catch (error) {
        console.error('❌ Dashboard data load error:', error);
    }
}

// Dashboard istatistiklerini güncelle
function updateDashboardStats() {
    const stats = {
        totalVehicles: 15,
        activeVehicles: 12,
        totalDistance: '1,250 km',
        fuelConsumption: '8.5 lt/100km'
    };
    
    // Stats kartlarını güncelle
    const statElements = {
        'totalVehicles': document.querySelector('[data-stat="totalVehicles"]'),
        'activeVehicles': document.querySelector('[data-stat="activeVehicles"]'),
        'totalDistance': document.querySelector('[data-stat="totalDistance"]'),
        'fuelConsumption': document.querySelector('[data-stat="fuelConsumption"]')
    };
    
    Object.keys(stats).forEach(key => {
        const element = statElements[key];
        if (element) {
            element.textContent = stats[key];
        }
    });
}

// Chart'ları yükle
function loadCharts() {
    try {
        const chartContainer = document.getElementById('chartContainer');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6c757d;">
                    <div style="text-align: center;">
                        <i class="fas fa-chart-line fa-3x mb-3"></i>
                        <h5>Grafik Yükleniyor...</h5>
                        <p>Araç performans verileri hazırlanıyor</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Chart load error:', error);
    }
}

// Event listeners'ı setup et
function setupEventListeners() {
    try {
        // Quick action button'ları
        const quickActionButtons = document.querySelectorAll('.quick-action');
        quickActionButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const actionName = this.querySelector('h6')?.textContent || 'Bu özellik';
                handleQuickAction(actionName);
            });
        });
        
        console.log('✅ Event listeners setup completed');
    } catch (error) {
        console.error('❌ Event listeners setup error:', error);
    }
}

// Quick action click handler
function handleQuickAction(actionName) {
    console.log('🔗 Quick action clicked:', actionName);
    
    if (typeof window.showAlert === 'function') {
        window.showAlert(`${actionName} özelliği yakında aktif olacak!`, 'info');
    } else {
        alert(`${actionName} özelliği yakında aktif olacak!`);
    }
}

// Global logout function
function logout() {
    console.log('🚪 Logout from dashboard...');
    
    try {
        // Auth service varsa kullan
        if (window.authService && typeof window.authService.logout === 'function') {
            window.authService.logout();
        } else {
            // Manual logout
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('vervo_auth_token');
            localStorage.removeItem('vervo_user_data');
            window.location.href = '../index.html';
        }
    } catch (error) {
        console.error('❌ Logout error:', error);
        // Force redirect
        window.location.href = '../index.html';
    }
}

// Page load event
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Dashboard page loaded');
    
    // Config yüklenene kadar bekle
    if (window.APP_CONFIG) {
        initDashboard();
    } else {
        // Config henüz yüklenmemişse biraz bekle
        setTimeout(() => {
            initDashboard();
        }, 100);
    }
});

// Global fonksiyonları window object'ine ekle
window.handleQuickAction = handleQuickAction;
window.logout = logout;
window.initDashboard = initDashboard;
window.checkDashboardAuth = checkDashboardAuth;