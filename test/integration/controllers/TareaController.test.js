var request = require('supertest');

describe('TareaController', function() {

  describe('#login()', function() {
    it('should redirect to /user/view/+id', function (done) {
      request(sails.hooks.http.app)
        .post('/session/create')
        .send({ email: 'noreply.visualmail@gmail.com', password: 'prueba' })
        .expect(302)
        .expect('location','/user/view/577ade5cd48d11590b311db8', done);// cambiar id segun usuario de prueba creado
    });


 });})


