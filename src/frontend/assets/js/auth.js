// Authentication utilities for Vervo Portal
class AuthService {
    constructor() {
        // API Configuration - Update this URL to match your backend
        this.apiBaseUrl = 'http://localhost:5154/api'; // Change this to your actual API URL
        
        // Local storage keys
        this.tokenKey = 'vervo_token';
        this.userKey = 'vervo_user';
        this.rememberKey = 'vervo_remember_user';
        
        // Token refresh settings
        this.refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry
        this.refreshTimer = null;
        
        // Initialize token refresh on page load
        this.initializeTokenRefresh();
    }

    /**
     * Login method - authenticate with backend
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @returns {Promise<Object>} Login response with token and user info
     */
    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password
                })
            });

            // Handle HTTP errors
            if (!response.ok) {
                const errorData = await this.safeJsonParse(response);
                const errorMessage = errorData?.message || this.getHttpErrorMessage(response.status);
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            // Validate response structure
            if (!data.token || !data.user) {
                throw new Error('Geçersiz sunucu yanıtı');
            }
            
            // Store authentication data
            this.storeAuthData(data);
            
            // Set up token refresh
            this.scheduleTokenRefresh(data.expiresAt);
            
            console.log('Login successful for user:', data.user.login);
            return data;
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Provide user-friendly error messages
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Sunucuya bağlanılamıyor. Lütfen ağ bağlantınızı kontrol edin.');
            }
            
            throw error;
        }
    }

    /**
     * Logout method - clear authentication data
     */
    async logout() {
        try {
            // Attempt to notify server (optional)
            const token = this.getToken();
            if (token) {
                await fetch(`${this.apiBaseUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }).catch(() => {
                    // Ignore logout API errors - we'll clear local data anyway
                    console.warn('Logout API call failed, proceeding with local cleanup');
                });
            }
        } catch (error) {
            console.warn('Logout API error:', error);
        } finally {
            // Clear local authentication data
            this.clearAuthData();
            
            // Clear token refresh timer
            this.clearTokenRefresh();
            
            // Redirect to login page
            this.redirectToLogin();
        }
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        const token = this.getToken();
        if (!token) {
            return false;
        }

        try {
            // Parse and validate JWT token
            const payload = this.parseJwtPayload(token);
            const currentTime = Math.floor(Date.now() / 1000);
            
            // Check if token is expired
            if (payload.exp && payload.exp < currentTime) {
                console.warn('Token expired');
                this.clearAuthData();
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('Token validation error:', error);
            this.clearAuthData();
            return false;
        }
    }

    /**
     * Get stored authentication token
     * @returns {string|null} JWT token
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Get stored user information
     * @returns {Object|null} User data
     */
    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        if (!userStr) return null;
        
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Make authenticated API requests
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} API response
     */
    async apiCall(endpoint, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('No authentication token found');
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, mergedOptions);
            
            // Handle authentication errors
            if (response.status === 401) {
                console.warn('Authentication failed - token may be expired');
                this.clearAuthData();
                this.redirectToLogin();
                throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
            }

            if (!response.ok) {
                const errorData = await this.safeJsonParse(response);
                const errorMessage = errorData?.message || this.getHttpErrorMessage(response.status);
                throw new Error(errorMessage);
            }

            return await response.json();
            
        } catch (error) {
            console.error('API call error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Sunucuya bağlanılamıyor');
            }
            
            throw error;
        }
    }

    /**
     * Validate token with server
     * @returns {Promise<Object>} Validation response
     */
    async validateToken() {
        return await this.apiCall('/auth/validate', {
            method: 'POST'
        });
    }

    /**
     * Store authentication data in localStorage
     * @param {Object} data - Authentication data
     */
    storeAuthData(data) {
        localStorage.setItem(this.tokenKey, data.token);
        localStorage.setItem(this.userKey, JSON.stringify(data.user));
        
        // Store timestamp for tracking
        localStorage.setItem('vervo_login_time', Date.now().toString());
    }

    /**
     * Clear all authentication data
     */
    clearAuthData() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem('vervo_login_time');
        
        // Don't clear remember me data on logout
        // localStorage.removeItem(this.rememberKey);
    }

    /**
     * Remember user for future logins
     * @param {string} username - Username to remember
     */
    rememberUser(username) {
        if (username && username.trim()) {
            localStorage.setItem(this.rememberKey, username.trim());
        }
    }

    /**
     * Get remembered username
     * @returns {string|null} Remembered username
     */
    getRememberedUser() {
        return localStorage.getItem(this.rememberKey);
    }

    /**
     * Clear remembered user
     */
    clearRememberedUser() {
        localStorage.removeItem(this.rememberKey);
    }

    /**
     * Parse JWT token payload
     * @param {string} token - JWT token
     * @returns {Object} Token payload
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
            throw new Error('Invalid token format');
        }
    }

    /**
     * Initialize automatic token refresh
     */
    initializeTokenRefresh() {
        if (this.isAuthenticated()) {
            const token = this.getToken();
            try {
                const payload = this.parseJwtPayload(token);
                if (payload.exp) {
                    const expiresAt = new Date(payload.exp * 1000);
                    this.scheduleTokenRefresh(expiresAt);
                }
            } catch (error) {
                console.warn('Could not schedule token refresh:', error);
            }
        }
    }

    /**
     * Schedule automatic token refresh
     * @param {Date|string} expiresAt - Token expiration time
     */
    scheduleTokenRefresh(expiresAt) {
        this.clearTokenRefresh();
        
        const expiry = new Date(expiresAt);
        const now = new Date();
        const timeUntilRefresh = expiry.getTime() - now.getTime() - this.refreshThreshold;
        
        if (timeUntilRefresh > 0) {
            this.refreshTimer = setTimeout(() => {
                this.refreshToken();
            }, timeUntilRefresh);
            
            console.log(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 60000)} minutes`);
        }
    }

    /**
     * Clear token refresh timer
     */
    clearTokenRefresh() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshToken() {
        try {
            const response = await this.validateToken();
            if (response && response.user) {
                console.log('Token refreshed successfully');
                // Update user data if returned
                localStorage.setItem(this.userKey, JSON.stringify(response.user));
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, logout user
            this.logout();
        }
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('login.html') || 
                           currentPath === '/' || 
                           currentPath.endsWith('/');
        
        if (!isLoginPage) {
            // Store current page for redirect after login
            sessionStorage.setItem('vervo_redirect_after_login', window.location.href);
            
            // Determine correct login page path
            const loginPath = currentPath.includes('/pages/') ? 'login.html' : 'pages/login.html';
            window.location.href = loginPath;
        }
    }

    /**
     * Redirect after successful login
     */
    redirectAfterLogin() {
        const redirectUrl = sessionStorage.getItem('vervo_redirect_after_login');
        sessionStorage.removeItem('vervo_redirect_after_login');
        
        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else {
            // Default redirect
            const currentPath = window.location.pathname;
            const dashboardPath = currentPath.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
            window.location.href = dashboardPath;
        }
    }

    /**
     * Safe JSON parsing
     * @param {Response} response - Fetch response
     * @returns {Object|null} Parsed JSON or null
     */
    async safeJsonParse(response) {
        try {
            return await response.json();
        } catch (error) {
            return null;
        }
    }

    /**
     * Get user-friendly HTTP error messages
     * @param {number} status - HTTP status code
     * @returns {string} Error message
     */
    getHttpErrorMessage(status) {
        const messages = {
            400: 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.',
            401: 'Kullanıcı adı veya şifre hatalı.',
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
     * @returns {Object} Login time details
     */
    getLoginTimeInfo() {
        const loginTime = localStorage.getItem('vervo_login_time');
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
}

// Create global auth service instance
window.authService = new AuthService();

// Auto-redirect logic on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('login.html') || 
                       currentPath === '/' || 
                       currentPath.endsWith('/');
    const isIndexPage = currentPath === '/' || currentPath.endsWith('index.html');

    if (!isLoginPage && !isIndexPage && !authService.isAuthenticated()) {
        // Not authenticated and not on login/index page - redirect to login
        authService.redirectToLogin();
    } else if ((isLoginPage || isIndexPage) && authService.isAuthenticated()) {
        // Already authenticated and on login/index page - redirect to dashboard
        authService.redirectAfterLogin();
    }
});

// Handle page visibility changes for security
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !authService.isAuthenticated()) {
        // Page became visible but user is not authenticated
        const isLoginPage = window.location.pathname.includes('login.html') || 
                           window.location.pathname === '/' || 
                           window.location.pathname.endsWith('/');
        
        if (!isLoginPage) {
            authService.redirectToLogin();
        }
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}