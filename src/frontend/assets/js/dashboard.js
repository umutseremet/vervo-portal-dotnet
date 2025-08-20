// Dashboard Page JavaScript - AUTH KONTROLÜ İLE
// src/frontend/assets/js/dashboard.js

$(document).ready(function() {
    console.log('🔒 Dashboard: Auth kontrolü başlatılıyor...');
    
    // AUTH KONTROLÜ - ZORUNLU
    enforceAuthentication().then(() => {
        console.log('✅ Auth tamam, dashboard yükleniyor...');
        initializeDashboard();
    }).catch(() => {
        console.log('❌ Auth başarısız, yönlendiriliyor...');
    });
});

/**
 * Auth kontrolü - Her korumalı sayfa için
 */
function enforceAuthentication() {
    return new Promise((resolve, reject) => {
        // Manual token kontrolü (AuthService olmasa da çalışır)
        const token = localStorage.getItem('vervo_auth_token');
        const user = localStorage.getItem('vervo_user_data');
        
        if (!token || !user) {
            alert('Bu sayfaya erişim için giriş yapmanız gerekiyor.');
            window.location.href = 'login.html';
            reject(false);
            return;
        }
        
        // AuthService varsa onu da kontrol et
        if (window.authService) {
            if (window.authService.isAuthenticated()) {
                resolve(true);
            } else {
                alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
                window.location.href = 'login.html';
                reject(false);
            }
        } else {
            // AuthService yoksa manual kontrolle devam et
            resolve(true);
        }
    });
}

/**
 * Initialize dashboard
 */
function initializeDashboard() {
    console.log('🚀 Dashboard initialization starting...');
    
    // Config'ten title güncelle
    updatePageTitle();
    
    // Header component'ini yükle
    loadHeaderComponent();
    
    // User bilgilerini yükle
    loadUserInfo();
    
    // Chart'ı initialize et
    initializeChart();
    
    // Welcome mesajını güncelle
    updateWelcomeMessage();
    
    // Animasyonları başlat
    animateElements();
    
    console.log('✅ Dashboard initialization complete');
}

/**
 * Update page title from config
 */
function updatePageTitle() {
    const checkConfig = () => {
        if (window.APP_CONFIG) {
            const titleElement = document.getElementById('pageTitle');
            if (titleElement) {
                titleElement.textContent = `Dashboard - ${window.APP_CONFIG.PORTAL_TITLE}`;
            }
            document.title = `Dashboard - ${window.APP_CONFIG.PORTAL_TITLE}`;
        } else {
            setTimeout(checkConfig, 100);
        }
    };
    checkConfig();
}

/**
 * Load header component
 */
async function loadHeaderComponent() {
    console.log('📥 Loading header component...');
    
    try {
        const response = await fetch('../components/header.html');
        if (response.ok) {
            const headerHtml = await response.text();
            document.getElementById('headerContainer').innerHTML = headerHtml;
            console.log('✅ Header component loaded');
            
            // Header initialize edilene kadar bekle
            setTimeout(() => {
                if (typeof window.initializeHeader === 'function') {
                    window.initializeHeader();
                }
            }, 100);
        } else {
            console.error('❌ Header component load failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Error loading header:', error);
    }
}

/**
 * Load user information and update UI
 */
function loadUserInfo() {
    try {
        const userStr = localStorage.getItem('vervo_user_data');
        if (userStr) {
            const user = JSON.parse(userStr);
            
            // Welcome message'ı güncelle
            const welcomeUserName = document.getElementById('welcomeUserName');
            if (welcomeUserName) {
                const displayName = user.fullName || user.firstName || user.username || 'Kullanıcı';
                welcomeUserName.textContent = displayName;
            }
            
            console.log('✅ User info loaded:', user.username || 'Unknown');
        } else {
            console.warn('⚠️ No user data found');
        }
    } catch (error) {
        console.error('❌ Error loading user info:', error);
    }
}

/**
 * Initialize chart
 */
function initializeChart() {
    const ctx = document.getElementById('usageChart');
    if (!ctx) {
        console.warn('Chart canvas not found');
        return;
    }
    
    try {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
                datasets: [{
                    label: 'Araç Kullanımı',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        console.log('✅ Chart initialized');
    } catch (error) {
        console.error('❌ Chart initialization failed:', error);
    }
}

/**
 * Update welcome message from config
 */
function updateWelcomeMessage() {
    const checkConfig = () => {
        if (window.APP_CONFIG) {
            const welcomeMessage = document.getElementById('welcomeMessage');
            if (welcomeMessage) {
                welcomeMessage.textContent = `${window.APP_CONFIG.PORTAL_TITLE}'a hoş geldiniz. Buradan tüm sistemlerinizi yönetebilir, raporlarınızı görüntüleyebilir ve araç takip sistemini kullanabilirsiniz.`;
            }
        } else {
            setTimeout(checkConfig, 100);
        }
    };
    checkConfig();
}

/**
 * Add animations to elements
 */
function animateElements() {
    // Fade-in animasyonları için class ekle
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

/**
 * Handle quick action clicks
 */
function handleQuickAction(actionName) {
    console.log('🔗 Quick action clicked:', actionName);
    
    switch(actionName) {
        case 'Yeni Araç Ekle':
            alert('Yeni Araç Ekleme özelliği yakında aktif olacak!');
            break;
        case 'Rapor Oluştur':
            alert('Rapor Oluşturma özelliği yakında aktif olacak!');
            break;
        case 'Sistem Ayarları':
            alert('Sistem Ayarları özelliği yakında aktif olacak!');
            break;
        default:
            alert(`${actionName} özelliği yakında aktif olacak!`);
    }
}

/**
 * Global logout function
 */
function logout() {
    console.log('🚪 Logout from dashboard...');
    
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        try {
            // Clear all auth data
            localStorage.removeItem('vervo_auth_token');
            localStorage.removeItem('vervo_user_data');
            localStorage.removeItem('vervo_login_time');
            localStorage.removeItem('vervo_refresh_token');
            
            console.log('✅ Auth data cleared');
            
            // Redirect to login
            window.location.href = 'login.html';
        } catch (error) {
            console.error('❌ Logout error:', error);
            window.location.href = 'login.html';
        }
    }
}

/**
 * Periodic updates
 */
function startPeriodicUpdates() {
    // Her 5 dakikada bir auth kontrolü yap
    setInterval(() => {
        const token = localStorage.getItem('vervo_auth_token');
        if (!token) {
            console.log('⚠️ Token bulunamadı, login\'e yönlendiriliyor...');
            alert('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
            window.location.href = 'login.html';
        }
    }, 5 * 60 * 1000); // 5 dakika
}

/**
 * Page visibility change handler
 */
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Sayfa görünür olduğunda auth kontrolü yap
        const token = localStorage.getItem('vervo_auth_token');
        if (!token) {
            console.log('⚠️ Sayfa odaklandığında token bulunamadı');
            window.location.href = 'login.html';
        }
    }
});

// Global fonksiyonları export et
window.dashboardUtils = {
    handleQuickAction,
    logout,
    loadUserInfo,
    initializeChart,
    updateWelcomeMessage
};

// Periodic updates'i başlat
setTimeout(startPeriodicUpdates, 1000);