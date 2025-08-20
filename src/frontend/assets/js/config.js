// src/frontend/assets/js/config.js
// Uygulama konfigürasyon dosyası - AUTH KONTROLÜ AKTİF

// Global konfigürasyon object'i
window.APP_CONFIG = {
    // Portal ayarları
    PORTAL_TITLE: 'Vervo Portal',
    COMPANY_NAME: 'Vervo Portal',
    VERSION: '1.0.0',
    
    // API ayarları - BACKEND API URL
    API_BASE_URL: 'http://localhost:5154/api', // Senin backend API URL'in
    API_TIMEOUT: 30000, // 30 saniye
    
    // Uygulama ayarları
    DEFAULT_LANGUAGE: 'tr',
    DATE_FORMAT: 'DD/MM/YYYY',
    TIME_FORMAT: 'HH:mm',
    
    // UI ayarları
    ITEMS_PER_PAGE: 10,
    SEARCH_DELAY: 300, // ms
    
    // Alert ayarları
    ALERT_DURATION: {
        SUCCESS: 5000,
        ERROR: 8000,
        WARNING: 6000,
        INFO: 5000
    },
    
    // Debug modu - AUTH KONTROLÜ İÇİN FALSE
    DEBUG_MODE: false, // Bu false olduğunda auth kontrolleri aktif olur
    
    // Local storage keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        USER: 'user',
        PREFERENCES: 'userPreferences'
    }
};

// API base URL'i global scope'a ekle (geriye uyumluluk için)
window.API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

// Debug fonksiyonu
window.debugLog = function(message, data = null) {
    if (window.APP_CONFIG.DEBUG_MODE) {
        console.log(`[${new Date().toISOString()}] ${message}`, data || '');
    }
};

// Konfigürasyon yüklendi log'u
window.debugLog('Configuration loaded', window.APP_CONFIG);