const request = require('supertest');
const app = require('../server'); // Your main app file

describe('Auth API', () => {
    it('should register a new user', (done) => {
        request(server)
            .post('/register')
            .send({ username: 'testuser', password: 'password123' })
            .expect(201)
            .expect(res => {
                if (!res.body.user) throw new Error('User not created');
            })
            .end(done);
    });

    it('should login an existing user', (done) => {
        request(server)
            .post('/login')
            .send({ username: 'testuser', password: 'password123' })
            .expect(200)
            .expect(res => {
                if (!res.body.token) throw new Error('Token not returned');
            })
            .end(done);
    });
});
