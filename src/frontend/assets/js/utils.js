/**
 * Navigation Utility Functions - URL REDIRECT FIX
 * src/frontend/assets/js/navigation-utils.js
 * 
 * Bu dosya navigation ve yönlendirme işlemleri için yardımcı fonksiyonlar içerir
 * Özellikle "/pages" fazladan eklenmesi sorununu çözer
 */

/**
 * Mevcut konuma göre doğru yönlendirme path'ini hesaplar
 * @param {string} targetPage - Hedef sayfa (örn: 'dashboard.html' veya 'login.html')
 * @returns {string} - Doğru relative path
 */
function getCorrectRedirectPath(targetPage) {
    const currentPath = window.location.pathname;
    const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
    
    console.log('Navigation Utils - Current path:', currentPath);
    console.log('Navigation Utils - Current dir:', currentDir);
    console.log('Navigation Utils - Target page:', targetPage);
    
    // Mevcut konumu analiz et
    const isInPagesFolder = currentPath.includes('/pages/');
    const isTargetInPages = ['dashboard.html', 'login.html', 'aractakip.html'].includes(targetPage);
    
    let redirectPath;
    
    if (isInPagesFolder && isTargetInPages) {
        // Pages klasöründeyiz ve hedef de pages klasöründe
        redirectPath = targetPage;
    } else if (isInPagesFolder && !isTargetInPages) {
        // Pages klasöründeyiz ama hedef root'ta
        redirectPath = '../' + targetPage;
    } else if (!isInPagesFolder && isTargetInPages) {
        // Root'tayız ama hedef pages klasöründe
        redirectPath = 'pages/' + targetPage;
    } else {
        // Root'tayız ve hedef de root'ta
        redirectPath = targetPage;
    }
    
    console.log('Navigation Utils - Final redirect path:', redirectPath);
    return redirectPath;
}

/**
 * Login başarılı olduktan sonra dashboard'a yönlendir
 */
function redirectToDashboard() {
    const redirectPath = getCorrectRedirectPath('dashboard.html');
    console.log('Redirecting to dashboard:', redirectPath);
    window.location.href = redirectPath;
}

/**
 * Logout olduktan sonra login sayfasına yönlendir
 */
function redirectToLogin() {
    const redirectPath = getCorrectRedirectPath('login.html');
    console.log('Redirecting to login:', redirectPath);
    window.location.href = redirectPath;
}

/**
 * Mevcut sayfanın hangi klasörde olduğunu kontrol et
 */
function getCurrentPageLocation() {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment);
    
    return {
        isInPagesFolder: currentPath.includes('/pages/'),
        isInRootFolder: !currentPath.includes('/pages/'),
        currentPage: pathSegments[pathSegments.length - 1] || 'index.html',
        fullPath: currentPath,
        directory: currentPath.substring(0, currentPath.lastIndexOf('/'))
    };
}

/**
 * Sayfa yönlendirmesi için genel fonksiyon
 * @param {string} targetPage - Hedef sayfa
 * @param {number} delay - Yönlendirme gecikmesi (ms)
 */
function navigateToPage(targetPage, delay = 0) {
    const redirectPath = getCorrectRedirectPath(targetPage);
    
    if (delay > 0) {
        setTimeout(() => {
            window.location.href = redirectPath;
        }, delay);
    } else {
        window.location.href = redirectPath;
    }
}

/**
 * Güvenli sayfa yönlendirmesi - redirect loop'unu önler
 * @param {string} targetPage - Hedef sayfa
 */
function safeRedirect(targetPage) {
    const currentLocation = getCurrentPageLocation();
    
    // Aynı sayfaya yönlendirme yapmaya çalışıyorsak durdur
    if (currentLocation.currentPage === targetPage) {
        console.log('Already on target page:', targetPage);
        return false;
    }
    
    // Yönlendirme yap
    navigateToPage(targetPage);
    return true;
}

/**
 * Auth durumuna göre otomatik yönlendirme
 */
function autoRedirectBasedOnAuth() {
    const currentLocation = getCurrentPageLocation();
    const isAuthenticated = window.authService ? window.authService.isAuthenticated() : false;
    
    console.log('Auto redirect check:', {
        currentPage: currentLocation.currentPage,
        isAuthenticated: isAuthenticated
    });
    
    // Eğer kullanıcı giriş yapmış ve login sayfasındaysa dashboard'a yönlendir
    if (isAuthenticated && currentLocation.currentPage === 'login.html') {
        console.log('User is authenticated but on login page, redirecting to dashboard');
        safeRedirect('dashboard.html');
        return;
    }
    
    // Eğer kullanıcı giriş yapmamış ve korumalı sayfadaysa login'e yönlendir
    const protectedPages = ['dashboard.html', 'aractakip.html'];
    if (!isAuthenticated && protectedPages.includes(currentLocation.currentPage)) {
        console.log('User is not authenticated but on protected page, redirecting to login');
        safeRedirect('login.html');
        return;
    }
}

/**
 * URL path'ini normalize et - fazladan slashları kaldır
 */
function normalizePath(path) {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

/**
 * Relative path'i absolute path'e çevir
 */
function resolveRelativePath(basePath, relativePath) {
    const baseSegments = basePath.split('/').filter(s => s);
    const relativeSegments = relativePath.split('/').filter(s => s);
    
    for (const segment of relativeSegments) {
        if (segment === '..') {
            baseSegments.pop();
        } else if (segment !== '.') {
            baseSegments.push(segment);
        }
    }
    
    return '/' + baseSegments.join('/');
}

/**
 * Sayfa yüklendiğinde otomatik kontroller
 */
function initializePageNavigation() {
    console.log('Initializing page navigation...');
    
    // Mevcut lokasyonu logla
    const location = getCurrentPageLocation();
    console.log('Current page location:', location);
    
    // Auth durumunu kontrol et (config yüklenmesini bekle)
    setTimeout(() => {
        autoRedirectBasedOnAuth();
    }, 200);
}

/**
 * Navigation event listener'ları ekle
 */
function setupNavigationEventListeners() {
    // Browser back/forward butonları için
    window.addEventListener('popstate', function(event) {
        console.log('Page navigation detected via popstate');
        setTimeout(() => {
            autoRedirectBasedOnAuth();
        }, 100);
    });
    
    // Sayfa görünürlüğü değiştiğinde auth kontrolü
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            console.log('Page became visible, checking auth status');
            setTimeout(() => {
                autoRedirectBasedOnAuth();
            }, 100);
        }
    });
    
    // Page focus event
    window.addEventListener('focus', function() {
        console.log('Window focused, checking auth status');
        setTimeout(() => {
            autoRedirectBasedOnAuth();
        }, 100);
    });
}

/**
 * Debug bilgileri göster
 */
function debugNavigationInfo() {
    const location = getCurrentPageLocation();
    console.group('🧭 Navigation Debug Info');
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
    console.log('Location info:', location);
    console.log('Is authenticated:', window.authService ? window.authService.isAuthenticated() : 'AuthService not available');
    console.groupEnd();
}

// Global fonksiyonları window objesine ekle
window.NavigationUtils = {
    getCorrectRedirectPath,
    redirectToDashboard,
    redirectToLogin,
    getCurrentPageLocation,
    navigateToPage,
    safeRedirect,
    autoRedirectBasedOnAuth,
    normalizePath,
    resolveRelativePath,
    initializePageNavigation,
    setupNavigationEventListeners,
    debugNavigationInfo
};

// Global shortcuts
window.redirectToDashboard = redirectToDashboard;
window.redirectToLogin = redirectToLogin;
window.navigateToPage = navigateToPage;

// Sayfa yüklendiğinde otomatik olarak initialize et
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧭 NavigationUtils: DOM Content Loaded');
    initializePageNavigation();
    setupNavigationEventListeners();
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.NavigationUtils;
}