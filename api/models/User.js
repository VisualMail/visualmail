/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
schema:true,autoCreatedAt: false,autoUpdatedAt: false,
attributes: {
	//id:{ type: 'integer', required: true, unique:true,autoIncrement: true,primaryKey: true,},
	firstname:{ type: 'string', required:false },
	lastname:{ type: 'string', required:false},
	email:{ type: 'string', email:true, required:true, unique:true},
	pmo:{ type: 'boolean'//,required:true
	},
	initials:{ type: 'string',required:false},
	password:{ type: 'string',required:true},
	imgurl:{ type:'string'},
	rut:{type:'string'},
	projects:{
		dominant: true,
		collection: 'project',
		via:'participants'
	}

},
	//callback llamado antes de crear el usuario, el password se encripta
 beforeCreate: function(values,next){
  require('bcryptjs').hash(values.password,10, function passwordEncrypted(err,password){ 
    if(err) return next(err);
    values.password = password;
    next();
  });
 },
};

