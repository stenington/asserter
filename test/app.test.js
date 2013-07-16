const path = require('path');
const request = require('supertest');
const should = require('should');
const validator = require('openbadges-validator');

var app = require('../').app.build({
  dataDir: path.join(__dirname, '/data'),
  staticDir: path.join(__dirname, '/static')
});

describe('Asserter', function() {

  it('should serve assertions from data directory', function(done) {
    request(app)
      .get('/demo/1.0/assertion.json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('should 404 on unknown files', function(done) {
    request(app)
      .get('/NOTTHERE/1.0/assertion.json')
      .expect('Content-Type', /json/)
      .expect(404, done);
  });

  it('should host pngs in static directory', function(done) {
    request(app)
      .get('/baked.png')
      .expect('Content-Type', 'image/png')
      .expect(200, done);
  });

  describe('1.0 assertions', function() {

    it('should be valid', function(done) {
      request(app)
        .get('/demo/1.0/assertion.json')
        .expect(200, function(err, res) {
          validator(res.body, function(err, info){
            if (err)
              return done(err);
            info.version.should.equal('1.0.0');
            done();
          });
        });
    });

    ['assertion', 'badge', 'issuer'].forEach(function(part) {
      describe(part + '.json', function() {

        /* test/data/demo.json has several fields with value <APP WILL SET THIS> 
           These should all get clobbered. */
        it('should clobber some fields', function(done) {
          request(app)
            .get('/demo/1.0/' + part + '.json')
            .expect(200)
            .end(function(err, res) {
              if (err)
                return done(err);
              try {
                JSON.stringify(res.body).should.not.match(/APP WILL SET THIS/);
                done();
              } catch (e) {
                done(e);
              }
            });
        });

      });
    });

  });
});
