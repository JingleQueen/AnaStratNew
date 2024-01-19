export const handlSubRouteParams=(req, res, next)=>{
    req._params = req._params || {};
    for (var key in req.params) {
        if (req.params.hasOwnProperty(key)) {
            req._params[key] = req.params[key];
        }
    }
    next();
}
