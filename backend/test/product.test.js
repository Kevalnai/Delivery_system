const request = require('supertest');
const app = require('../server');

describe('Product API', () => {
    it('should add a new product', (done) => {
        request(app)
            .post('/api/products')
            .send({ name: 'Test Product', price: 100 })
            .expect(201)
            .expect(res => {
                if (!res.body.product) throw new Error('Product not created');
            })
            .end(done);
    });
});
