// middleware.js - MIME type düzeltmeleri için
module.exports = function(req, res, next) {
    // JavaScript dosyaları için doğru MIME type
    if (req.url.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    
    // CSS dosyaları için doğru MIME type
    if (req.url.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
    
    // HTML dosyaları için doğru MIME type
    if (req.url.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    next();
};