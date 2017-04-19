var request = require('supertest');

describe('KanbanController', function() {

  describe('#Userlogin()', function() {
    it('should redirect to /user/view/+id', function (done) {
      request(sails.hooks.http.app)
        .post('/session/create')
        .send({ email: 'noreply.visualmail@gmail.com', password: 'prueba' })
        .expect(302)
        .expect('location','/user/view/577ade5cd48d11590b311db8', done);// cambiar id segun usuario de prueba creado
    });
    

 });

  describe('#Userlogin()', function() { 

   it('getKanban',function (done){
       request(sails.hooks.http.app)
        .post('/kanban/getKanban')
        .send({id: '577ade68d48d11590b311dbd'})
        .end(function(err,res){
          if(err) throw err;
          console.log(res.text);
          done();
        })

    });

  });


})

