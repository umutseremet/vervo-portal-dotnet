// src/frontend/assets/js/login.js
// Login Page JavaScript - COMPLETE WITH REAL API INTEGRATION

$(document).ready(function() {
    console.log('🔐 Login script loaded');
    
    // Initialize login page
    initializeLoginPage();
    
    // Check for URL messages
    checkForUrlMessages();
    
    // Setup form handlers
    setupFormHandlers();
    
    // Setup input effects
    setupInputFocusEffects();
});

/**
 * Initialize login page
 */
function initializeLoginPage() {
    console.log('Initializing login page...');
    
    // Update UI from config
    updateLoginPageFromConfig();
    
    // Focus on username field
    $('#username').focus();
    
    // Load remembered username
    loadRememberedUsername();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
}

/**
 * Update login page elements from config
 */
function updateLoginPageFromConfig() {
    const checkConfig = () => {
        if (window.APP_CONFIG) {
            // Update page title
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = `${window.APP_CONFIG.PORTAL_TITLE} - Giriş`;
            }
            
            // Update login title
            const loginTitle = document.getElementById('loginTitle');
            if (loginTitle) {
                loginTitle.textContent = window.APP_CONFIG.PORTAL_TITLE;
            }
            
            // Update login subtitle
            const loginSubtitle = document.getElementById('loginSubtitle');
            if (loginSubtitle) {
                loginSubtitle.textContent = `${window.APP_CONFIG.PORTAL_TITLE} sistemine giriş yapmak için bilgilerinizi girin`;
            }
            
            // Update document title
            document.title = `${window.APP_CONFIG.PORTAL_TITLE} - Giriş`;
            
            console.log('✅ Login page updated with config:', window.APP_CONFIG.PORTAL_TITLE);
        } else {
            console.log('⏳ Config not ready, retrying...');
            setTimeout(checkConfig, 100);
        }
    };
    
    checkConfig();
}

/**
 * Setup form event handlers
 */
function setupFormHandlers() {
    // Login form submission
    $('#loginForm').on('submit', handleLogin);
    
    // Enter key handling
    $('.form-control').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            handleLogin(e);
        }
    });
    
    // Show/hide password toggle
    $('#togglePassword').on('click', function() {
        const passwordField = $('#password');
        const passwordFieldType = passwordField.attr('type');
        
        if (passwordFieldType === 'password') {
            passwordField.attr('type', 'text');
            $(this).html('<i class="fas fa-eye-slash"></i>');
        } else {
            passwordField.attr('type', 'password');
            $(this).html('<i class="fas fa-eye"></i>');
        }
    });
}

/**
 * Setup input focus effects
 */
function setupInputFocusEffects() {
    $('.form-floating input').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        if (!$(this).val()) {
            $(this).parent().removeClass('focused');
        }
    });
}

/**
 * Check for URL messages (logout, session expired, etc.)
 */
function checkForUrlMessages() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message) {
        switch (message) {
            case 'logout':
                showSuccessMessage('Güvenli çıkış yapıldı.');
                break;
            case 'session_expired':
                showWarningMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
                break;
            case 'unauthorized':
                showErrorMessage('Bu sayfaya erişim yetkiniz yok.');
                break;
            default:
                console.log('Unknown URL message:', message);
        }
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

/**
 * Handle login form submission - COMPLETE WITH REAL API
 */
async function handleLogin(event) {
    event.preventDefault();
    console.log('=== LOGIN ATTEMPT ===');
    
    // Form verilerini al
    const username = $('#username').val()?.trim();
    const password = $('#password').val();
    const rememberMe = $('#rememberMe').is(':checked');
    
    // Validation
    if (!username || !password) {
        showErrorMessage('Kullanıcı adı ve şifre gereklidir.');
        return;
    }
    
    try {
        // Loading state
        setLoadingState(true);
        hideAllMessages();
        
        console.log('Attempting login with username:', username);
        
        // GERÇEK API CALL - REDMINE BACKEND
        const response = await loginWithAPI(username, password);
        
        console.log('Login successful:', response);
        
        // Handle remember me
        if (rememberMe) {
            const rememberKey = window.APP_CONFIG?.SECURITY?.REMEMBER_USERNAME_KEY || 'vervo_remember_username';
            localStorage.setItem(rememberKey, username);
        } else {
            const rememberKey = window.APP_CONFIG?.SECURITY?.REMEMBER_USERNAME_KEY || 'vervo_remember_username';
            localStorage.removeItem(rememberKey);
        }
        
        // Success message
        const successMessage = window.APP_CONFIG?.MESSAGES?.LOGIN_SUCCESS || 'Giriş başarılı! Portal\'a yönlendiriliyorsunuz...';
        showSuccessMessage(successMessage);
        
        // Store login analytics
        storeLoginAnalytics(response.user || {});
        
        // Redirect to dashboard
        setTimeout(() => {
            console.log('=== LOGIN SUCCESS REDIRECT ===');
            console.log('Current location:', window.location.href);
            console.log('Current pathname:', window.location.pathname);
            
            // Mevcut konumu analiz et
            const currentPath = window.location.pathname;
            
            // Doğru yönlendirme path'ini belirle
            let redirectPath;
            
            if (currentPath.includes('/pages/')) {
                // Pages klasöründeyiz, aynı klasördeki dashboard'a git
                redirectPath = 'dashboard.html';
                console.log('In pages folder, redirecting to:', redirectPath);
            } else {
                // Root klasördeyiz, pages klasörüne git
                redirectPath = 'pages/dashboard.html';
                console.log('In root folder, redirecting to:', redirectPath);
            }
            
            console.log('Final redirect path:', redirectPath);
            window.location.href = redirectPath;
            
        }, 1500); // 1.5 saniye bekle
        
    } catch (error) {
        console.error('Login failed:', error);
        
        // Show error message
        const errorMessage = error.message || window.APP_CONFIG?.MESSAGES?.LOGIN_ERROR || 'Giriş işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.';
        showErrorMessage(errorMessage);
        
        // Add visual feedback
        addFormShakeEffect();
        
        // Focus back to username field for retry
        setTimeout(() => {
            $('#username').focus().select();
        }, 500);
        
    } finally {
        // Reset loading state after delay
        setTimeout(() => {
            setLoadingState(false);
        }, 1000);
    }
}

/**
 * Login with real API - REDMINE BACKEND BAĞLANTISI
 */
async function loginWithAPI(username, password) {
    console.log('🔄 Real API login for:', username);
    
    // API URL'ini config'den al
    const apiBaseUrl = window.APP_CONFIG?.API?.BASE_URL || 'http://localhost:5154/api';
    const loginUrl = `${apiBaseUrl}/auth/login`;
    
    console.log('API URL:', loginUrl);
    
    try {
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = 'Giriş işlemi başarısız oldu.';
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.Message || errorMessage;
            } catch (e) {
                // JSON parse edilemezse default mesaj kullan
                if (response.status === 401) {
                    errorMessage = 'Kullanıcı adı veya şifre hatalı.';
                } else if (response.status === 500) {
                    errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
                } else if (response.status === 404) {
                    errorMessage = 'API endpoint\'i bulunamadı. Sistem yöneticisi ile iletişime geçin.';
                }
            }
            
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        // Response'ta token ve user var mı kontrol et
        if (!data.token) {
            throw new Error('Sunucudan geçersiz yanıt alındı. Token bulunamadı.');
        }
        
        if (!data.user) {
            throw new Error('Sunucudan geçersiz yanıt alındı. Kullanıcı bilgileri bulunamadı.');
        }
        
        // Token'ı ve user'ı localStorage'a kaydet
        const tokenKey = window.APP_CONFIG?.SECURITY?.TOKEN_STORAGE_KEY || 'authToken';
        const userKey = window.APP_CONFIG?.SECURITY?.USER_STORAGE_KEY || 'user';
        const loginTimeKey = window.APP_CONFIG?.SECURITY?.LOGIN_TIME_KEY || 'vervo_login_time';
        
        localStorage.setItem(tokenKey, data.token);
        localStorage.setItem(userKey, JSON.stringify(data.user));
        localStorage.setItem(loginTimeKey, Date.now().toString());
        
        // Expiration time varsa kaydet
        if (data.expiresAt) {
            localStorage.setItem('tokenExpires', new Date(data.expiresAt).getTime().toString());
        }
        
        console.log('✅ Real API login successful, data stored');
        
        return {
            success: true,
            token: data.token,
            user: data.user,
            expiresAt: data.expiresAt
        };
        
    } catch (error) {
        console.error('API Login error:', error);
        
        // Network error handling
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
        }
        
        // API error'ları aynen fırlat
        throw error;
    }
}

/**
 * Load remembered username
 */
function loadRememberedUsername() {
    const rememberKey = window.APP_CONFIG?.SECURITY?.REMEMBER_USERNAME_KEY || 'vervo_remember_username';
    const rememberedUsername = localStorage.getItem(rememberKey);
    
    if (rememberedUsername) {
        $('#username').val(rememberedUsername);
        $('#rememberMe').prop('checked', true);
        $('#password').focus();
    }
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    $(document).on('keydown', function(e) {
        // Ctrl+L or Cmd+L to focus username
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            $('#username').focus().select();
        }
        
        // Escape to clear form
        if (e.key === 'Escape') {
            clearForm();
        }
    });
}

/**
 * Clear login form
 */
function clearForm() {
    $('#username, #password').val('');
    $('#rememberMe').prop('checked', false);
    hideAllMessages();
    $('#username').focus();
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
    const loginBtn = $('#loginBtn');
    const form = $('#loginForm');
    
    if (loading) {
        loginBtn.prop('disabled', true)
               .html('<span class="spinner-border spinner-border-sm me-2" role="status"></span>Giriş yapılıyor...');
        form.addClass('loading');
    } else {
        loginBtn.prop('disabled', false)
               .html('<i class="fas fa-sign-in-alt me-2"></i>Giriş Yap');
        form.removeClass('loading');
    }
}

/**
 * Add form shake effect for error
 */
function addFormShakeEffect() {
    const form = $('#loginForm');
    form.addClass('shake');
    setTimeout(() => form.removeClass('shake'), 500);
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    hideAllMessages();
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    $('#alertContainer').html(alertHtml);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    hideAllMessages();
    const alertHtml = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    $('#alertContainer').html(alertHtml);
}

/**
 * Show warning message
 */
function showWarningMessage(message) {
    hideAllMessages();
    const alertHtml = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    $('#alertContainer').html(alertHtml);
}

/**
 * Hide all messages
 */
function hideAllMessages() {
    $('#alertContainer').empty();
}

/**
 * Store login analytics
 */
function storeLoginAnalytics(user) {
    try {
        const analytics = {
            loginTime: new Date().toISOString(),
            username: user.username || 'unknown',
            userAgent: navigator.userAgent,
            ip: 'client-side' // Gerçek IP server'dan gelir
        };
        
        // Analytics localStorage'da sakla (optional)
        localStorage.setItem('loginAnalytics', JSON.stringify(analytics));
        
        console.log('Login analytics stored:', analytics);
    } catch (error) {
        console.warn('Analytics store error:', error);
    }
}

/**
 * Global functions for external access
 */
window.handleLogin = handleLogin;
window.clearForm = clearForm;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;
window.showWarningMessage = showWarningMessage;