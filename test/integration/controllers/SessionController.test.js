var request = require('supertest');

describe('SessionController', function() {

  describe('#login()', function() {
    it('should redirect to /user/view/+id', function (done) {
      request(sails.hooks.http.app)
        .post('/session/create')
        .send({ email: 'noreply.visualmail@gmail.com', password: 'prueba' })
        .expect(302)
        .expect('location','/user/view/577ade5cd48d11590b311db8', done);// cambiar id segun usuario de prueba creado
    });


 });

  describe('#logout()', function() {
    it('should redirect to /', function (done) {
      request(sails.hooks.http.app)
        .post('/session/logout')
        .expect(302)
        .expect('location','/', done);// cambiar id segun usuario de prueba creado
    });
 });

  describe('#verificarclave()', function() {
    it('should expect json', function (done) {
      request(sails.hooks.http.app)
        .post('/session/verficar_clave')
        .send({clave: '577ade5cd48d11590b311db8'})
        .end(function(err,res){
          if(err) throw err;
          console.log(res.text);
          done();
        })

    });
 });
  


})