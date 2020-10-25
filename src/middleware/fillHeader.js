const fillHeader = (req, res, next) => {
    if (req.cookies['current_user']) {
        res.locals.user = req.cookies['current_user'];
        res.locals.hasAvatar = req.cookies['hasAvatar'];
        return next();
    }
    next();
};

module.exports = fillHeader;