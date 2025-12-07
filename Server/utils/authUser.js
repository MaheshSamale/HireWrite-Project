const jwt = require('jsonwebtoken');
const result = require('../utils/results'); 
const config = require('../utils/config');

function authorizeUser(req, res, next) {
    const url = req.url;
    
 
    if (url == '/api/user/register' || url == '/api/user/login' || url == '/api/organizations/login' || url == '/api/organizations/register') {
        console.log("Public route:", url);
        return next();
    }
    
    const token = req.headers.token;
    console.log("Token received:", token ? "Yes" : "No");
    
    if (token) {
        try {
            const payload = jwt.verify(token, config.SECRET);
            console.log("Payload:", payload);
            

            req.headers.user_id = payload.user_id;
            console.log("User ID set:", req.headers.user_id);
            
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
