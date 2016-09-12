var request = require('supertest');

describe('UserController', function() {

  describe('#Userlogin()', function() {
    it('should redirect to /user/view/+id', function (done) {
      request(sails.hooks.http.app)
        .post('/session/create')
        .send({ email: 'noreply.visualmail@gmail.com', password: 'prueba' })
        .expect(302)
        .expect('location','/user/view/577ade5cd48d11590b311db8', done);// cambiar id segun usuario de prueba creado
    });
    
    it('getallemail',function (done){
       request(sails.hooks.http.app)
        .post('/user/getAllEmail')
        
        .end(function(err,res){
          if(err) throw err;
          console.log(res.text);
          done();
        })
    });

     it('findOneUser',function (done){
       request(sails.hooks.http.app)
        .post('/user/findOneUser')
         .send({id: '577ade5cd48d11590b311db8'})
        .end(function(err,res){
          if(err) throw err;
          console.log(res.text);
          done();
        })


    });


        it('actualizardatos',function (done){
       request(sails.hooks.http.app)
        .post('/user/actualizardatos')
         .send({id: '577ade5cd48d11590b311db8', firstname:'prueba',lastname:'prueba',imgurl:'null',initials:'PAS'})
        .end(function(err,res){
          if(err) throw err;
          console.log(res.text);
          done();
        })
        });

 });




})


