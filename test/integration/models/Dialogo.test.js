describe('DialogoModel', function() {

  describe('#find()', function() {
    it('should check find function', function (done) {
      User.find()
      .then(function(results) {
        // some tests
        done();
      })
      .catch(done);
    });
  });
  
  describe('#findall()', function() {
    it('should check find function', function (done) {
      User.find()
      .then(function(results) {
        // some tests
        done();
      })
      .catch(done);
    });
  });
});