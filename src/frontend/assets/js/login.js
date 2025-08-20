// Login Page JavaScript - COMPLETE WITH JWT TOKEN FIX
// src/frontend/assets/js/login.js

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
 * Handle login form submission - COMPLETE WITH REDIRECT FIX
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
        
        // API call - önce gerçek API dene, başarısız olursa mock kullan
        let response;
        try {
            if (window.authService) {
                response = await window.authService.login(username, password, rememberMe);
            } else {
                throw new Error('AuthService not available');
            }
        } catch (apiError) {
            console.log('API login failed, using mock login:', apiError.message);
            response = await mockLogin(username, password);
            
            // Mock login başarılıysa manuel olarak store et
            if (response.success) {
                const tokenKey = window.APP_CONFIG?.SECURITY?.TOKEN_STORAGE_KEY || 'vervo_auth_token';
                const userKey = window.APP_CONFIG?.SECURITY?.USER_STORAGE_KEY || 'vervo_user_data';
                const loginTimeKey = window.APP_CONFIG?.SECURITY?.LOGIN_TIME_KEY || 'vervo_login_time';
                
                localStorage.setItem(tokenKey, response.token);
                localStorage.setItem(userKey, JSON.stringify(response.user));
                localStorage.setItem(loginTimeKey, Date.now().toString());
            }
        }
        
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
        const successMessage = window.APP_CONFIG?.MESSAGES?.LOGIN_SUCCESS || 'Giriş başarılı! Portal\'a yönlendiriliyorsunez...';
        showSuccessMessage(successMessage);
        
        // Store login analytics
        storeLoginAnalytics(response.user || {});
        
        // FIXED REDIRECT - URL yönlendirme sorunu çözümü
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
 * Mock login function - JWT FORMAT TOKEN
 */
async function mockLogin(username, password) {
    console.log('🔄 Mock login for:', username);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock validation
    const validCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'test', password: 'test123' },
        { username: 'user', password: 'user123' }
    ];
    
    const isValid = validCredentials.some(cred => 
        cred.username === username && cred.password === password
    );
    
    if (!isValid) {
        throw new Error('Kullanıcı adı veya şifre hatalı.');
    }
    
    // JWT benzeri token oluştur (header.payload.signature formatında)
    const header = btoa(JSON.stringify({ typ: "JWT", alg: "HS256" }));
    const payload = btoa(JSON.stringify({
        sub: username,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 saat
        username: username,
        role: username === 'admin' ? 'admin' : 'user'
    }));
    const signature = btoa('mock-signature-' + Date.now());
    
    const jwtToken = `${header}.${payload}.${signature}`;
    
    console.log('✅ Mock login successful, JWT token created');
    
    // Return mock response
    return {
        success: true,
        token: jwtToken,
        user: {
            id: 1,
            username: username,
            fullName: username === 'admin' ? 'Admin User' : 'Test User',
            firstName: username === 'admin' ? 'Admin' : 'Test',
            lastName: 'User',
            email: `${username}@example.com`,
            role: username === 'admin' ? 'Admin' : 'User'
        }
    };
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
 * Add form shake effect for errors
 */
function addFormShakeEffect() {
    const form = $('#loginForm');
    form.addClass('shake');
    
    setTimeout(() => {
        form.removeClass('shake');
    }, 600);
}

/**
 * Setup input focus effects
 */
function setupInputFocusEffects() {
    $('.form-control').on('focus', function() {
        $(this).closest('.form-floating').addClass('focused');
    }).on('blur', function() {
        if (!$(this).val()) {
            $(this).closest('.form-floating').removeClass('focused');
        }
    });
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    hideAllMessages();
    
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <strong>✅ Başarılı:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
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
            <strong>❌ Hata:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    $('#alertContainer').html(alertHtml);
}

/**
 * Show info message
 */
function showInfoMessage(message) {
    hideAllMessages();
    
    const alertHtml = `
        <div class="alert alert-info alert-dismissible fade show" role="alert">
            <strong>ℹ️ Bilgi:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    $('#alertContainer').html(alertHtml);
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        hideAllMessages();
    }, 4000);
}

/**
 * Hide all messages
 */
function hideAllMessages() {
    $('#alertContainer').empty();
}

/**
 * Check for URL parameters with messages
 */
function checkForUrlMessages() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    
    if (error) {
        showErrorMessage(decodeURIComponent(error));
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (message) {
        showInfoMessage(decodeURIComponent(message));
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

/**
 * Store login analytics (optional)
 */
function storeLoginAnalytics(user) {
    try {
        const analytics = {
            loginTime: new Date().toISOString(),
            userId: user.id || 'unknown',
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
        };
        
        // Store in sessionStorage for this session
        sessionStorage.setItem('vervo_login_analytics', JSON.stringify(analytics));
        
        console.log('📊 Login analytics stored');
    } catch (error) {
        console.warn('Could not store login analytics:', error);
    }
}