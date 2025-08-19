/**
 * Authentication Service - LOGOUT DÜZELTİLDİ
 * src/frontend/assets/js/auth.js
 * 
 * Bu dosya config.js'den ayarları alarak çalışır
 */

class AuthService {
    constructor() {
        // Config'ten ayarları al
        this.initializeFromConfig();
        
        // Setup token refresh
        this.setupTokenRefresh();
        
        console.log('AuthService initialized with config');
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
     * Login işlemi
     */
    async login(username, password, rememberMe = false) {
        if (this.showLogs) {
            console.log('Login attempt for username:', username);
        }
        
        try {
            const response = await this.makeRequest('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || this.getErrorMessage(response.status));
            }
            
            const data = await response.json();
            
            // Auth verilerini sakla
            this.storeAuthData(data);
            
            // Remember me
            if (rememberMe) {
                this.rememberUser(username);
            } else {
                this.clearRememberedUser();
            }
            
            if (this.showLogs) {
                console.log('Login successful');
            }
            
            return data;
            
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Sunucuya bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.');
            }
            
            throw error;
        }
    }

    /**
     * HTTP request wrapper with retry logic
     */
    async makeRequest(endpoint, options = {}, retryCount = 0) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        
        const requestOptions = {
            timeout: this.apiTimeout,
            ...options
        };
        
        try {
            const response = await fetch(url, requestOptions);
            return response;
        } catch (error) {
            if (retryCount < this.retryAttempts) {
                console.log(`Request failed, retrying... (${retryCount + 1}/${this.retryAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return this.makeRequest(endpoint, options, retryCount + 1);
            }
            throw error;
        }
    }

    /**
     * Store authentication data
     */
    storeAuthData(data) {
        if (this.showLogs) {
            console.log('Storing auth data');
        }
        
        // Store token
        if (data.token) {
            localStorage.setItem(this.tokenKey, data.token);
        }
        
        // Store refresh token
        if (data.refreshToken) {
            localStorage.setItem(this.refreshTokenKey, data.refreshToken);
        }
        
        // Store user info
        if (data.user) {
            localStorage.setItem(this.userKey, JSON.stringify(data.user));
        }
        
        // Store login time
        localStorage.setItem(this.loginTimeKey, Date.now().toString());
        
        if (this.showLogs) {
            console.log('Auth data stored successfully');
        }
    }

    /**
     * Logout user - YÖNLENDIRME DÜZELTİLDİ
     */
    logout() {
        if (this.showLogs) {
            console.log('Logging out user...');
        }
        
        // Clear all auth data
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.loginTimeKey);
        
        if (this.showLogs) {
            console.log('User logged out, redirecting...');
        }
        
        // Redirect to appropriate page
        this.redirectToLogin();
    }

    /**
     * Redirect to login page - YÖNLENDIRME DÜZELTİLDİ
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
        
        // Determine correct redirect path based on current location
        let redirectPath;
        
        if (currentPath.includes('/pages/')) {
            // We're in a pages subfolder, go to login
            redirectPath = 'login.html';
        } else {
            // We're in root or other location, go to index
            redirectPath = 'index.html';
        }
        
        if (this.showLogs) {
            console.log('Redirecting to:', redirectPath);
        }
        
        // Use replace to prevent back button issues
        window.location.replace(redirectPath);
    }

    /**
     * Redirect to dashboard
     */
    redirectToDashboard() {
        const currentPath = window.location.pathname;
        
        let redirectPath;
        if (currentPath.includes('/pages/')) {
            // Already in pages folder
            redirectPath = 'dashboard.html';
        } else {
            // In root folder
            redirectPath = this.loginRedirect || 'pages/dashboard.html';
        }
        
        window.location.href = redirectPath;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = localStorage.getItem(this.tokenKey);
        const user = localStorage.getItem(this.userKey);
        
        if (!token || !user) {
            return false;
        }
        
        // Check token expiration
        try {
            const payload = this.parseJwtPayload(token);
            const now = Math.floor(Date.now() / 1000);
            
            if (payload.exp && payload.exp < now) {
                if (this.showLogs) {
                    console.log('Token expired');
                }
                this.logout();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
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
     * Make authenticated API request
     */
    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const authHeaders = this.getAuthHeaders();
        
        const requestOptions = {
            ...options,
            headers: {
                ...authHeaders,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, requestOptions);
            
            if (response.status === 401) {
                if (this.showLogs) {
                    console.log('Unauthorized request, logging out...');
                }
                this.logout();
                throw new Error(this.messages?.SESSION_EXPIRED || 'Oturum süresi doldu. Lütfen tekrar giriş yapın.');
            }
            
            return response;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Setup automatic token refresh
     */
    setupTokenRefresh() {
        if (!this.enableAutoRefresh) {
            return;
        }
        
        const token = this.getToken();
        if (!token) return;
        
        try {
            const payload = this.parseJwtPayload(token);
            const now = Math.floor(Date.now() / 1000);
            const refreshTime = payload.exp - (5 * 60); // 5 minutes before expiry
            
            if (refreshTime > now) {
                const timeoutMs = (refreshTime - now) * 1000;
                setTimeout(() => {
                    this.refreshToken();
                }, timeoutMs);
                
                if (this.showLogs) {
                    console.log(`Token refresh scheduled in ${Math.floor(timeoutMs / 60000)} minutes`);
                }
            }
        } catch (error) {
            console.error('Error setting up token refresh:', error);
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
            const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: refreshToken
                })
            });
            
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            
            const data = await response.json();
            this.storeAuthData(data);
            
            if (this.showLogs) {
                console.log('Token refreshed successfully');
            }
            
            // Setup next refresh
            this.setupTokenRefresh();
            
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
        }
    }

    /**
     * Parse JWT payload
     */
    parseJwtPayload(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error parsing JWT:', error);
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

    /**
     * Force logout with cleanup - EMERGENCY LOGOUT
     */
    forceLogout() {
        console.log('Force logout initiated');
        
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
            window.location.replace('../index.html');
        } else {
            window.location.replace('index.html');
        }
    }
}

// Global auth service instance - wait for config to load
window.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for config to be processed
    setTimeout(() => {
        if (!window.authService) {
            try {
                window.authService = new AuthService();
            } catch (error) {
                console.error('Error creating AuthService:', error);
            }
        }
    }, 100);
});

// Fallback for immediate access
if (typeof window.APP_CONFIG !== 'undefined') {
    try {
        window.authService = new AuthService();
    } catch (error) {
        console.error('Error creating AuthService immediately:', error);
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}