// Authentication Service
// src/frontend/assets/js/auth.js

class AuthService {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5154/api';
        this.tokenKey = 'vervo_token';
        this.userKey = 'vervo_user';
        this.refreshTokenKey = 'vervo_refresh_token';
        this.loginTimeKey = 'vervo_login_time';
        this.rememberUsernameKey = 'vervo_remember_username';
        
        console.log('AuthService initialized');
        
        // Setup token refresh if authenticated
        if (this.isAuthenticated()) {
            this.setupTokenRefresh();
        }
    }

    /**
     * Login user
     */
    async login(username, password, rememberMe = false) {
        console.log('AuthService.login called');
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    rememberMe: rememberMe
                })
            });

            console.log('Login response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Login error response:', errorText);
                throw new Error(this.getErrorMessage(response.status));
            }

            const data = await response.json();
            console.log('Login response data:', data);

            // Store authentication data
            this.storeAuthData(data);

            return data;

        } catch (error) {
            console.error('Login error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Sunucu bağlantısı kurulamadı. Lütfen sunucunun çalıştığından emin olun.');
            }
            
            throw error;
        }
    }

    /**
     * Store authentication data
     */
    storeAuthData(data) {
        console.log('Storing auth data:', data);
        
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
        
        console.log('Auth data stored successfully');
    }

    /**
     * Logout user
     */
    logout() {
        console.log('Logging out user...');
        
        // Clear all auth data
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.loginTimeKey);
        
        // Optionally clear remember me
        // localStorage.removeItem(this.rememberUsernameKey);
        
        console.log('User logged out, redirecting to login...');
        
        // Redirect to login
        this.redirectToLogin();
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
                console.log('Token expired');
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
                console.log('Unauthorized request, logging out...');
                this.logout();
                throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
            }
            
            return response;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
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
            throw new Error('Invalid token format');
        }
    }

    /**
     * Redirect to login page - FIXED VERSION
     */
    redirectToLogin() {
        console.log('redirectToLogin called, current path:', window.location.pathname);
        
        // Check if we're already on login page to prevent loops
        const currentPath = window.location.pathname;
        const isAlreadyOnLogin = currentPath.includes('index.html') || 
                               currentPath === '/' || 
                               currentPath.endsWith('/');
        
        if (isAlreadyOnLogin) {
            console.log('Already on login page, not redirecting');
            return;
        }
        
        // Determine the correct path to index.html
        let redirectPath;
        if (currentPath.includes('/pages/')) {
            redirectPath = '../index.html';
        } else {
            redirectPath = './index.html';
        }
        
        console.log('Redirecting to:', redirectPath);
        window.location.href = redirectPath;
    }

    /**
     * Redirect after successful login - FIXED VERSION
     */
    redirectAfterLogin() {
        console.log('redirectAfterLogin called');
        console.log('Current path:', window.location.pathname);
        console.log('Current href:', window.location.href);
        
        // Path'e göre doğru dashboard yolunu belirle
        const currentPath = window.location.pathname;
        let dashboardPath;
        
        // login.html'den dashboard.html'e yönlendirme
        if (currentPath.includes('/pages/') || currentPath.includes('login.html')) {
            // pages klasöründen pages klasörüne
            dashboardPath = './dashboard.html';
        } else if (currentPath.includes('/frontend/')) {
            // frontend ana dizininden pages klasörüne
            dashboardPath = './pages/dashboard.html';
        } else {
            // Ana dizinden pages klasörüne
            dashboardPath = './pages/dashboard.html';
        }
        
        console.log('Calculated dashboard path:', dashboardPath);
        
        try {
            // Doğrudan yönlendirme yap
            window.location.href = dashboardPath;
            
        } catch (error) {
            console.error('Redirect error:', error);
            
            // Fallback yöntemleri dene
            try {
                window.location.assign(dashboardPath);
            } catch (e) {
                console.error('Assign failed, trying replace:', e);
                window.location.replace(dashboardPath);
            }
        }
    }

    /**
     * Force redirect to login (fallback)
     */
    forceRedirectToLogin() {
        console.log('Force redirecting to login...');
        
        // Try multiple possible paths
        const possiblePaths = [
            '../index.html',
            './index.html',
            '/index.html',
            '/'
        ];
        
        // Use the first one that makes sense based on current location
        const currentPath = window.location.pathname;
        let redirectPath = '/';
        
        if (currentPath.includes('/pages/')) {
            redirectPath = '../index.html';
        } else if (currentPath.includes('/frontend/')) {
            redirectPath = './index.html';
        }
        
        console.log('Force redirect to:', redirectPath);
        window.location.replace(redirectPath); // Use replace to prevent back button issues
    }

    /**
     * Setup token refresh
     */
    setupTokenRefresh() {
        const token = this.getToken();
        if (!token) return;
        
        try {
            const payload = this.parseJwtPayload(token);
            const now = Math.floor(Date.now() / 1000);
            const timeToExpire = (payload.exp - now) * 1000; // Convert to milliseconds
            
            // Refresh token 5 minutes before expiration
            const refreshTime = timeToExpire - (5 * 60 * 1000);
            
            if (refreshTime > 0) {
                setTimeout(() => {
                    this.refreshToken();
                }, refreshTime);
                
                console.log(`Token refresh scheduled in ${refreshTime / 1000} seconds`);
            }
        } catch (error) {
            console.error('Token refresh setup error:', error);
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshToken() {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if (!refreshToken) {
            console.log('No refresh token available');
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
            
            console.log('Token refreshed successfully');
            
            // Setup next refresh
            this.setupTokenRefresh();
            
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
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
}

// Create global auth service instance
window.authService = new AuthService();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}