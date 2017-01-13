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


 });
    it('should get message', function (done) {
      request(sails.hooks.http.app)
        .post('/mennsaje/getMessages')
        .send({ id: '57d5fb947a91d6b12adef4ac'})
         .end(function(err,res){
          if(err) throw err;
          console.log(res.text);
          done();
        })
    });

})

