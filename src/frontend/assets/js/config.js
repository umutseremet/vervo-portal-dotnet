// Frontend Configuration - DÜZELTİLDİ
// src/frontend/assets/js/config.js

/**
 * Application Configuration
 * Bu dosyada müşteri ismi ve diğer parametrik değerler tanımlanır
 */
window.APP_CONFIG = {
    // *** MÜŞTERİ AYARLARI ***
    // COMPANY_NAME: 'Aslan Group',
    // PORTAL_TITLE: 'Aslan Group Portal',
    COMPANY_NAME: 'Vervo',
    PORTAL_TITLE: 'Vervo Portal',
    
    // Logo ayarları
    LOGO: {
        PATH: 'assets/images/logo.png',
        ALT_TEXT: 'Vervo',
        HEIGHT: {
            HEADER: '30px',
            LOGIN: '60px',
            MAIN: '80px'
        }
    },
    
    // API ayarları
    API: {
        BASE_URL: 'http://localhost:5154/api',
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3
    },
    
    // Güvenlik ayarları
    SECURITY: {
        TOKEN_STORAGE_KEY: 'vervo_auth_token',
        USER_STORAGE_KEY: 'vervo_user_data',
        REFRESH_TOKEN_KEY: 'vervo_refresh_token',
        LOGIN_TIME_KEY: 'vervo_login_time',
        REMEMBER_USERNAME_KEY: 'vervo_remember_username',
        AUTO_LOGOUT_MINUTES: 60
    },
    
    // UI ayarları - Aslan Group renk teması
    UI: {
        THEME: 'aslan-group',
        PRIMARY_COLOR: '#667eea',
        SECONDARY_COLOR: '#764ba2',
        SUCCESS_COLOR: '#28a745',
        WARNING_COLOR: '#ffc107',
        DANGER_COLOR: '#dc3545',
        INFO_COLOR: '#17a2b8',
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 5000
    },
    
    // Sayfa ayarları
    PAGES: {
        LOGIN_REDIRECT: 'pages/dashboard.html',
        LOGOUT_REDIRECT: 'pages/login.html',
        DEFAULT_PAGE: 'index.html'
    },
    
    // Özellik bayrakları
    FEATURES: {
        REMEMBER_ME: true,
        AUTO_REFRESH_TOKEN: true,
        SHOW_CONSOLE_LOGS: true,
        ENABLE_NOTIFICATIONS: true
    },
    
    // Mesajlar
    MESSAGES: {
        WELCOME: 'Vervo Portal\'a hoş geldiniz',
        LOGIN_SUCCESS: 'Giriş başarılı! Portal\'a yönlendiriliyorsunuz...',
        LOGIN_ERROR: 'Kullanıcı adı veya şifre hatalı.',
        LOGOUT_MESSAGE: 'Güvenli çıkış yapıldı.',
        SESSION_EXPIRED: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.'
    },
    
    // Console mesajları
    CONSOLE: {
        WELCOME_MESSAGE: '🎉 {{COMPANY_NAME}} Portal',
        WELCOME_STYLE: 'color: #667eea; font-size: 16px; font-weight: bold;',
        SUCCESS_MESSAGE: 'Dashboard başarıyla yüklendi!',
        SUCCESS_STYLE: 'color: #28a745; font-size: 14px;'
    }
};

/**
 * Müşteri adı değiştirme fonksiyonu
 */
window.setCompanyName = function(companyName) {
    window.APP_CONFIG.COMPANY_NAME = companyName;
    
    window.APP_CONFIG.PORTAL_TITLE = `${companyName} Portal`;
    
    updatePageElements();
    console.log(`Müşteri adı güncellendi: ${companyName}`);
};

/**
 * Sayfa elementlerini güncelleme fonksiyonu
 */
window.updatePageElements = function() {
    const config = window.APP_CONFIG;
    
    // Title elementlerini güncelle
    const titleElements = document.querySelectorAll('[data-company-title]');
    titleElements.forEach(element => {
        element.textContent = config.PORTAL_TITLE;
    });
    
    // Header title güncelle
    const headerTitle = document.getElementById('headerTitle');
    if (headerTitle) {
        headerTitle.textContent = config.PORTAL_TITLE;
    }
    
    // Sidebar title güncelle
    const sidebarTitle = document.getElementById('sidebarTitle');
    if (sidebarTitle) {
        sidebarTitle.textContent = config.PORTAL_TITLE;
    }
    
    // Page title güncelle
    if (document.title.includes('Portal')) {
        document.title = document.title.replace(/Portal.*/, config.PORTAL_TITLE);
    }
    
    // Console mesajlarını güncelle
    if (config.FEATURES.SHOW_CONSOLE_LOGS) {
        const welcomeMsg = config.CONSOLE.WELCOME_MESSAGE.replace('{{COMPANY_NAME}}', config.COMPANY_NAME);
        console.log(`%c${welcomeMsg}`, config.CONSOLE.WELCOME_STYLE);
    }
};

/**
 * Configuration doğrulama
 */
window.validateConfig = function() {
    const config = window.APP_CONFIG;
    const errors = [];
    
    if (!config.COMPANY_NAME) {
        errors.push('COMPANY_NAME boş olamaz');
    }
    
    if (!config.API.BASE_URL) {
        errors.push('API.BASE_URL boş olamaz');
    }
    
    if (errors.length > 0) {
        console.error('Config doğrulama hataları:', errors);
        return false;
    }
    
    return true;
};

// Config'i hemen kullanıma hazırla
console.log('📝 Config loading...', window.APP_CONFIG?.PORTAL_TITLE);

// Sayfa yüklendiğinde config'i doğrula
document.addEventListener('DOMContentLoaded', function() {
    if (window.validateConfig()) {
        console.log('✅ Configuration başarıyla yüklendi:', window.APP_CONFIG.PORTAL_TITLE);
        window.updatePageElements();
        
        // Config yüklendiğini bildir
        window.dispatchEvent(new CustomEvent('configLoaded', {
            detail: { config: window.APP_CONFIG }
        }));
    } else {
        console.error('❌ Configuration hatası!');
    }
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.APP_CONFIG;
}