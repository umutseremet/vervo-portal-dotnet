// Authentication Service - Fixed Version
class AuthService {
    constructor() {
        this.apiBaseUrl = 'https://localhost:7443/api'; // Redmine API URL
        this.tokenKey = 'vervo_token';
        this.userKey = 'vervo_user';
        this.refreshKey = 'vervo_refresh_token';
        this.loginTimeKey = 'vervo_login_time';
        this.refreshTimer = null;
    }

    /**
     * Login method
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
                    username: username,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || this.getErrorMessage(response.status));
            }

            const data = await response.json();
            
            // Store authentication data
            this.storeAuthData(data);
            
            return data;
            
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Sunucuya bağlanılamıyor. Lütfen ağ bağlantınızı kontrol edin.');
            }
            
            throw error;
        }
    }

    /**
     * Logout method - FIXED VERSION
     */
    logout() {
        console.log('Logout başlatılıyor...');
        
        try {
            // Clear local authentication data
            this.clearAuthData();
            
            // Clear token refresh timer
            this.clearTokenRefresh();
            
            console.log('Auth data temizlendi, login sayfasına yönlendiriliyor...');
            
            // Redirect to login page
            this.redirectToLogin();
            
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even if there's an error
            this.forceRedirectToLogin();
        }
    }

    /**
     * Clear authentication data
     */
    clearAuthData() {
        console.log('Clearing auth data...');
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.refreshKey);
        localStorage.removeItem(this.loginTimeKey);
        localStorage.removeItem('vervo_remember_username');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getToken();
        console.log('isAuthenticated check - token:', token ? 'exists' : 'not found');
        
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
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Get stored user information
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
     * Store authentication data
     */
    storeAuthData(data) {
        if (data.token) {
            localStorage.setItem(this.tokenKey, data.token);
        }
        
        if (data.user) {
            localStorage.setItem(this.userKey, JSON.stringify(data.user));
        }
        
        if (data.refreshToken) {
            localStorage.setItem(this.refreshKey, data.refreshToken);
        }
        
        // Store login time
        localStorage.setItem(this.loginTimeKey, Date.now().toString());
        
        // Setup token refresh
        this.setupTokenRefresh();
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
     * Redirect after successful login
     */
    redirectAfterLogin() {
        console.log('redirectAfterLogin called');
        
        // Check if we're on login page
        const currentPath = window.location.pathname;
        const isOnLogin = currentPath.includes('index.html') || 
                         currentPath === '/' || 
                         currentPath.endsWith('/');
        
        if (!isOnLogin) {
            console.log('Not on login page, not redirecting');
            return;
        }
        
        // Redirect to dashboard
        let dashboardPath;
        if (currentPath.includes('/frontend/')) {
            dashboardPath = './pages/dashboard.html';
        } else {
            dashboardPath = './pages/dashboard.html';
        }
        
        console.log('Redirecting to dashboard:', dashboardPath);
        window.location.href = dashboardPath;
    }

    /**
     * Setup token refresh
     */
    setupTokenRefresh() {
        const token = this.getToken();
        if (!token) return;
        
        try {
            const payload = this.parseJwtPayload(token);
            if (payload.exp) {
                const expirationTime = payload.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();
                const timeUntilExpiry = expirationTime - currentTime;
                
                // Refresh token 5 minutes before expiry
                const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0);
                
                if (refreshTime > 0) {
                    this.refreshTimer = setTimeout(() => {
                        this.refreshToken();
                    }, refreshTime);
                }
            }
        } catch (error) {
            console.error('Token refresh setup failed:', error);
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
     * Remember user functionality
     */
    rememberUser(username) {
        localStorage.setItem('vervo_remember_username', username);
    }

    /**
     * Clear remembered user
     */
    clearRememberedUser() {
        localStorage.removeItem('vervo_remember_username');
    }

    /**
     * Get remembered username
     */
    getRememberedUsername() {
        return localStorage.getItem('vervo_remember_username');
    }

    /**
     * Get error message by status code
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

// REMOVED auto-redirect logic that was causing loops
// Each page now handles its own auth check

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}