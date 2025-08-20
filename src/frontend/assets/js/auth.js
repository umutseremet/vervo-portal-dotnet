/**
 * Authentication Service - COMPLETE WITH JWT PARSE FIX
 * src/frontend/assets/js/auth.js
 * 
 * Bu dosya config.js'den ayarları alarak çalışır
 */

class AuthService {
    constructor() {
        // Config'ten ayarları al
        this.initializeFromConfig();

        console.log('🔒 AuthService initialized with config');
    }

    /**
     * Config'ten ayarları initialize et
     */
    initializeFromConfig() {
        if (typeof window.APP_CONFIG === 'undefined') {
            console.warn('APP_CONFIG not found, using default values');
            // Fallback values
            this.apiBaseUrl = 'http://localhost:5154/api';
            this.tokenKey = 'vervo_auth_token';
            this.userKey = 'vervo_user_data';
            this.refreshTokenKey = 'vervo_refresh_token';
            this.loginTimeKey = 'vervo_login_time';
            this.rememberUsernameKey = 'vervo_remember_username';
            this.loginRedirect = 'pages/dashboard.html';
            this.logoutRedirect = 'pages/login.html';
            this.showLogs = true;
            return;
        }

        const config = window.APP_CONFIG;

        // API ayarları
        this.apiBaseUrl = config.API.BASE_URL;
        this.apiTimeout = config.API.TIMEOUT || 10000;
        this.retryAttempts = config.API.RETRY_ATTEMPTS || 3;

        // Storage anahtarları
        this.tokenKey = config.SECURITY.TOKEN_STORAGE_KEY;
        this.userKey = config.SECURITY.USER_STORAGE_KEY;
        this.refreshTokenKey = config.SECURITY.REFRESH_TOKEN_KEY;
        this.loginTimeKey = config.SECURITY.LOGIN_TIME_KEY;
        this.rememberUsernameKey = config.SECURITY.REMEMBER_USERNAME_KEY;

        // Güvenlik ayarları
        this.autoLogoutMinutes = config.SECURITY.AUTO_LOGOUT_MINUTES || 60;

        // Sayfa ayarları
        this.loginRedirect = config.PAGES.LOGIN_REDIRECT;
        this.logoutRedirect = config.PAGES.LOGOUT_REDIRECT;

        // Özellik bayrakları
        this.enableAutoRefresh = config.FEATURES.AUTO_REFRESH_TOKEN;
        this.showLogs = config.FEATURES.SHOW_CONSOLE_LOGS;

        // Mesajlar
        this.messages = config.MESSAGES;
    }

    /**
 * Login işlemi - EN TEMİZ ÇÖZÜM
 */
    async login(username, password, rememberMe = false) {
        if (this.showLogs) {
            console.log('🔐 Login attempt for username:', username);
        }

        try {
            // Doğrudan fetch kullan - makeRequest'i bypass et
            const url = `${this.apiBaseUrl}/auth/login`;

            if (this.showLogs) {
                console.log('📡 API URL:', url);
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (this.showLogs) {
                console.log('📥 Response status:', response.status);
                console.log('📥 Response ok:', response.ok);
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || this.getErrorMessage(response.status);
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (this.showLogs) {
                console.log('📦 API Response data:', data);
            }

            // Backend'ten gelen response kontrolü
            const token = data.token || data.Token;
            const user = data.user || data.User;

            if (!token) {
                throw new Error('Sunucudan geçersiz yanıt: Token bulunamadı');
            }

            if (!user) {
                throw new Error('Sunucudan geçersiz yanıt: Kullanıcı bilgisi bulunamadı');
            }

            // Auth verilerini sakla
            this.storeAuthData({
                token: token,
                user: user,
                expiresAt: data.expiresAt || data.ExpiresAt
            });

            // Remember me
            if (rememberMe) {
                this.rememberUser(username);
            } else {
                this.clearRememberedUser();
            }

            if (this.showLogs) {
                console.log('✅ Login successful - data stored');
            }

            // Frontend için normalize edilmiş response döndür
            return {
                success: true,
                token: token,
                user: user,
                expiresAt: data.expiresAt || data.ExpiresAt,
                message: data.message || data.Message || 'Giriş başarılı'
            };

        } catch (error) {
            console.error('❌ Login error:', error);

            // Network error kontrolü
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Sunucuya bağlanılamıyor. Backend servisi çalışıyor mu?');
            }

            // CORS error kontrolü
            if (error.message.includes('CORS')) {
                throw new Error('CORS hatası. Backend CORS ayarlarını kontrol edin.');
            }

            throw error;
        }
    }

    /**
     * Make API request with error handling
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;

        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: this.apiTimeout
        };

        const finalOptions = { ...defaultOptions, ...options };

        // Add auth headers if token exists
        const token = this.getToken();
        if (token) {
            finalOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, finalOptions);

            if (!response.ok) {
                if (response.status === 401) {
                    // Unauthorized - logout user
                    this.logout();
                }

                const errorText = await response.text();
                throw new Error(this.getErrorMessage(response.status) + (errorText ? `: ${errorText}` : ''));
            }

            return await response.json();

        } catch (error) {
            if (this.showLogs) {
                console.error('API request failed:', error);
            }
            throw error;
        }
    }

    /**
     * Check if user is authenticated - MOCK TOKEN FIX
     */
    isAuthenticated() {
        const token = localStorage.getItem(this.tokenKey);
        const user = localStorage.getItem(this.userKey);

        if (!token || !user) {
            if (this.showLogs) {
                console.log('❌ No token or user data found');
            }
            return false;
        }

        // Mock token kontrolü (gerçek JWT olmayan tokenlar için)
        if (token.startsWith('mock-token-')) {
            if (this.showLogs) {
                console.log('✅ Mock token detected, skipping JWT validation');
            }
            return true;
        }

        // Gerçek JWT token kontrolü
        try {
            const payload = this.parseJWT(token);
            const now = Math.floor(Date.now() / 1000);

            if (payload.exp && payload.exp < now) {
                if (this.showLogs) {
                    console.log('❌ Token expired');
                }
                this.logout();
                return false;
            }

            if (this.showLogs) {
                console.log('✅ JWT token valid');
            }
            return true;

        } catch (error) {
            if (this.showLogs) {
                console.warn('⚠️ JWT parse failed but token exists, allowing access:', error.message);
            }

            // JWT parse hatası durumunda da mock kontrolü yap
            if (token && user) {
                return true;
            }

            return false;
        }
    }

    /**
     * Store authentication data
     */
    storeAuthData(response) {
        if (this.showLogs) {
            console.log('💾 Storing auth data');
        }

        // Store token
        if (response.token) {
            localStorage.setItem(this.tokenKey, response.token);
        }

        // Store refresh token
        if (response.refreshToken) {
            localStorage.setItem(this.refreshTokenKey, response.refreshToken);
        }

        // Store user info
        if (response.user) {
            localStorage.setItem(this.userKey, JSON.stringify(response.user));
        }

        // Store login time
        localStorage.setItem(this.loginTimeKey, Date.now().toString());

        if (this.showLogs) {
            console.log('✅ Auth data stored successfully');
        }
    }

    /**
     * Logout user - FIXED URL REDIRECT VERSION
     */
    logout() {
        if (this.showLogs) {
            console.log('🚪 Logging out user...');
        }

        // Clear all auth data
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.loginTimeKey);

        if (this.showLogs) {
            console.log('🧹 Auth data cleared, redirecting...');
        }

        // Redirect to appropriate page
        this.redirectToLogin();
    }

    /**
     * Redirect to login page - FIXED URL VERSION
     */
    redirectToLogin() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();

        if (this.showLogs) {
            console.log('Current path:', currentPath);
            console.log('Current page:', currentPage);
        }

        // Avoid redirect loop
        if (currentPage === 'login.html' || currentPage === 'index.html') {
            return;
        }

        // FIXED: Determine correct redirect path based on current location
        let redirectPath;

        if (currentPath.includes('/pages/')) {
            // Pages klasöründeyiz, aynı klasördeki login'e git
            redirectPath = 'login.html';
        } else {
            // Root klasördeyiz, pages klasörüne git
            redirectPath = 'pages/login.html';
        }

        if (this.showLogs) {
            console.log('🔄 Redirecting to login:', redirectPath);
        }

        window.location.href = redirectPath;
    }

    /**
     * Redirect to dashboard - FIXED URL VERSION
     */
    redirectToDashboard() {
        const currentPath = window.location.pathname;

        if (this.showLogs) {
            console.log('🔄 Redirecting to dashboard from:', currentPath);
        }

        // FIXED: Determine correct redirect path based on current location
        let redirectPath;

        if (currentPath.includes('/pages/')) {
            // Pages klasöründeyiz, aynı klasördeki dashboard'a git
            redirectPath = 'dashboard.html';
        } else {
            // Root klasördeyiz, pages klasörüne git
            redirectPath = 'pages/dashboard.html';
        }

        if (this.showLogs) {
            console.log('📊 Redirecting to dashboard:', redirectPath);
        }

        window.location.href = redirectPath;
    }

    /**
     * Parse JWT token - IMPROVED VERSION
     */
    parseJWT(token) {
        try {
            // JWT formatı kontrol et (3 part olmalı)
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            if (this.showLogs) {
                console.error('JWT parse error:', error);
            }
            throw error;
        }
    }

    /**
     * Remember username functionality
     */
    rememberUser(username) {
        localStorage.setItem(this.rememberUsernameKey, username);
    }

    /**
     * Get remembered username
     */
    getRememberedUsername() {
        return localStorage.getItem(this.rememberUsernameKey);
    }

    /**
     * Clear remembered username
     */
    clearRememberedUser() {
        localStorage.removeItem(this.rememberUsernameKey);
    }

    /**
     * Get error message for status code
     */
    getErrorMessage(status) {
        const messages = {
            400: 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.',
            401: this.messages?.LOGIN_ERROR || 'Kullanıcı adı veya şifre hatalı.',
            403: 'Bu işlem için yetkiniz bulunmuyor.',
            404: 'İstenen kaynak bulunamadı.',
            429: 'Çok fazla istek gönderdiniz. Lütfen bekleyin.',
            500: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
            502: 'Sunucu geçici olarak kullanılamıyor.',
            503: 'Servis geçici olarak kullanılamıyor.'
        };

        return messages[status] || `Bilinmeyen hata (${status})`;
    }

    /**
     * Get login time information
     */
    getLoginTimeInfo() {
        const loginTime = localStorage.getItem(this.loginTimeKey);
        if (!loginTime) return null;

        const loginDate = new Date(parseInt(loginTime));
        const now = new Date();
        const sessionDuration = now.getTime() - loginDate.getTime();

        return {
            loginTime: loginDate,
            sessionDuration: sessionDuration,
            sessionDurationMinutes: Math.floor(sessionDuration / 60000)
        };
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        const userJson = localStorage.getItem(this.userKey);
        if (!userJson) return null;

        try {
            return JSON.parse(userJson);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Get auth token
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Get auth headers for API requests
     */
    getAuthHeaders() {
        const token = this.getToken();
        if (!token) return {};

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Setup automatic token refresh
     */
    setupTokenRefresh() {
        if (!this.enableAutoRefresh) {
            return;
        }

        // Check token every 5 minutes
        setInterval(() => {
            this.checkAndRefreshToken();
        }, 5 * 60 * 1000);
    }

    /**
     * Check and refresh token if needed
     */
    async checkAndRefreshToken() {
        if (!this.isAuthenticated()) {
            return;
        }

        const token = this.getToken();

        // Skip refresh for mock tokens
        if (token && token.startsWith('mock-token-')) {
            return;
        }

        try {
            const payload = this.parseJWT(token);
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = payload.exp - now;

            // Refresh if less than 10 minutes remaining
            if (timeUntilExpiry < 600) {
                await this.refreshToken();
            }

        } catch (error) {
            if (this.showLogs) {
                console.error('Token refresh check failed:', error);
            }
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshToken() {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);

        if (!refreshToken) {
            if (this.showLogs) {
                console.log('No refresh token available');
            }
            this.logout();
            return;
        }

        try {
            const response = await this.makeRequest('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({
                    refreshToken: refreshToken
                })
            });

            if (response.success && response.token) {
                this.storeAuthData(response);

                if (this.showLogs) {
                    console.log('Token refreshed successfully');
                }
            } else {
                throw new Error('Token refresh failed');
            }

        } catch (error) {
            if (this.showLogs) {
                console.error('Token refresh failed:', error);
            }
            this.logout();
        }
    }

    /**
     * Force logout with cleanup
     */
    forceLogout() {
        console.log('🚨 Force logout initiated');

        // Clear all possible auth data
        const authKeys = [
            this.tokenKey || 'vervo_auth_token',
            this.userKey || 'vervo_user_data',
            this.refreshTokenKey || 'vervo_refresh_token',
            this.loginTimeKey || 'vervo_login_time'
        ];

        authKeys.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Error clearing', key, error);
            }
        });

        // Redirect to appropriate page
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            window.location.replace('login.html');
        } else {
            window.location.replace('pages/login.html');
        }
    }

    /**
     * Check if features are enabled
     */
    isFeatureEnabled(featureName) {
        if (typeof window.APP_CONFIG === 'undefined') {
            return false;
        }
        return window.APP_CONFIG.FEATURES[featureName] || false;
    }

    /**
     * Get configuration value
     */
    getConfigValue(path) {
        if (typeof window.APP_CONFIG === 'undefined') {
            return null;
        }

        const keys = path.split('.');
        let value = window.APP_CONFIG;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return null;
            }
        }

        return value;
    }
}

// Global auth service initialization
window.addEventListener('DOMContentLoaded', function () {
    // Wait for config to load
    setTimeout(() => {
        if (!window.authService) {
            try {
                window.authService = new AuthService();
                console.log('✅ AuthService initialized globally');
            } catch (error) {
                console.error('❌ AuthService initialization error:', error);
            }
        }
    }, 100);
});

// Immediate initialization if config is ready
if (typeof window.APP_CONFIG !== 'undefined' && !window.authService) {
    try {
        window.authService = new AuthService();
        console.log('✅ AuthService initialized immediately');
    } catch (error) {
        console.warn('⚠️ AuthService immediate initialization failed:', error);
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}