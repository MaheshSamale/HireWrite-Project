const jwt = require('jsonwebtoken');
const result = require('../utils/results'); 
const config = require('../utils/config');

function authorizeUser(req, res, next) {
    const url = req.url;
    
    // Public routes (add candidates too)
    if (url.includes('/api/candidates/register') || 
        url.includes('/api/candidates/login') || 
        url.includes('/api/organizations/register') || 
        url.includes('/api/organizations/login') ||
        url.includes('/api/organizations/recruiters/login') ||
        url.includes('/api/admin/register') ||
        url.includes('/api/admin/login')) {
        console.log("Public route:", url);
        return next();
    }
    
    const token = req.headers.token;
    console.log("Token received:", token ? "Yes" : "No");
    
    if (token) {
        try {
            const payload = jwt.verify(token, config.SECRET);
            console.log("Payload:", payload);
            
            // Handle BOTH user_id AND organization_id tokens
            if (payload.user_id) {
                req.headers.user_id = payload.user_id;
                console.log("User ID set:", req.headers.user_id);
            }
            if (payload.organization_id) {
                req.headers.organization_id = payload.organization_id;
                console.log("Organization ID set:", req.headers.organization_id);
            }
            if (payload.role) {
                req.headers.role = payload.role;
                console.log("Role set:", req.headers.role);
            }
            
            next();
        } catch (ex) {
            console.log("Token verification failed:", ex.message);
            res.send(result.createResult('Invalid Token', null));
        }
    } else {
        console.log("No token provided");
        res.send(result.createResult('Token is Missing', null));
    }
}

module.exports = authorizeUser;
