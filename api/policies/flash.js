module.exports = function(req, res,next){
	//res locals dura por el tiempo de la vista
	//Aqui se maneja el valor de flash de acuerdo a tutorial de Sailscast
	res.locals.flash={};

	if(!req.session.flash) return next();
		res.locals.flash = _.clone(req.session.flash);
	
	req.session.flash={};
	next();


};