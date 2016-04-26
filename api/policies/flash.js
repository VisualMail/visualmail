module.exports = function(req, res,next){
//res locals dura por el tiempo de la vista
res.locals.flash={};
if(!req.session.flash) return next();
res.locals.flash = _.clone(req.session.flash);
req.session.flash={};
next();


};