// src/frontend/assets/js/config.js
// SADECE DEBUG_MODE'U FALSE YAP - DİĞER HİÇBİR ŞEY DEĞİŞMESİN

window.APP_CONFIG = {
    // Portal ayarları
    PORTAL_TITLE: 'Vervo Portal',
    COMPANY_NAME: 'Vervo Portal',
    VERSION: '1.0.0',
    
    // API ayarları
    API_BASE_URL: 'http://127.0.0.1:5500/api',
    API_TIMEOUT: 30000,
    
    // Uygulama ayarları
    DEFAULT_LANGUAGE: 'tr',
    DATE_FORMAT: 'DD/MM/YYYY',
    TIME_FORMAT: 'HH:mm',
    
    // UI ayarları
    ITEMS_PER_PAGE: 10,
    SEARCH_DELAY: 300,
    
    // Alert ayarları
    ALERT_DURATION: {
        SUCCESS: 5000,
        ERROR: 8000,
        WARNING: 6000,
        INFO: 5000
    },
    
    // *** BU SATIRI FALSE YAP - AUTH KONTROLÜ AKTİF OLSUN ***
    DEBUG_MODE: false, 
    
    // Local storage keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        USER: 'user',
        PREFERENCES: 'userPreferences'
    }
};

// API base URL'i global scope'a ekle
window.API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

// Debug fonksiyonu
window.debugLog = function(message, data = null) {
    if (window.APP_CONFIG.DEBUG_MODE) {
        console.log(`[${new Date().toISOString()}] ${message}`, data || '');
    }
};

// Konfigürasyon yüklendi log'u
window.debugLog('Configuration loaded', window.APP_CONFIG);