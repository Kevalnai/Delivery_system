const request = require('supertest');
const app = require('../server');

describe('Payment API', () => {
    it('should process a payment', (done) => {
        request(app)
            .post('/api/payments')
            .send({ userId: 'testuser', amount: 100 })
            .expect(200)
            .expect(res => {
                if (!res.body.success) throw new Error('Payment not processed');
            })
            .end(done);
    });
});
