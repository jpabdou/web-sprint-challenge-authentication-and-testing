const request = require('supertest'); // calling it "request" is a common practice

const server = require('./server.js'); // this is our first red, file doesn't exist yet

const db = require("../data/dbConfig")

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db('users').truncate();
  await db.seed.run()
})
afterAll(async () => {
  await db.destroy()
})

const joke1 = {
  "id": "0189hNRf2g",
  "joke": "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."
}

// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
})

describe("auth-router.js; testing auth route endpoints", ()=>{
  describe("[POST] api/auth/register", ()=>{
    it('[1] tests for successful registration', async ()=>{
      let res = await request(server).post('/api/auth/register').send({ username: 'john', password: '1234' })
      expect(res.body.username).toMatch(/john/i)
      expect(res.status).toEqual(201)
    }, 750)

    it('[2] tests for failed registration due to no username and/or password', async ()=>{
      let res = await request(server).post('/api/auth/register').send({ username: '', password: '1234' })
      expect(res.body.message).toMatch(/password required/i)
      expect(res.status).toEqual(401)
      res = await request(server).post('/api/auth/register').send({ username: 'john', password: '' })
      expect(res.body.message).toMatch(/password required/i)
      expect(res.status).toEqual(401)
      res = await request(server).post('/api/auth/register').send({ username: '', password: '' })
      expect(res.body.message).toMatch(/password required/i)
      expect(res.status).toEqual(401)
    }, 750)

    it('[3] tests for failed registration due to previously used username', async ()=>{
      let res = await request(server).post('/api/auth/register').send({ username: 'brian', password: '1234' })
      expect(res.body.message).toMatch(/username taken/i)
      expect(res.status).toEqual(401)
      res = await request(server).post('/api/auth/register').send({ username: 'john', password: '1234' })
      expect(res.body.username).toMatch(/john/i)
      expect(res.status).toEqual(201)
      res = await request(server).post('/api/auth/register').send({ username: 'john', password: '1234' })
      expect(res.body.message).toMatch(/username taken/i)
      expect(res.status).toEqual(401)
    }, 750)
  })

  describe("[POST] api/auth/login", ()=>{
    it('[4] tests for successful login', async ()=>{
      let res = await request(server).post('/api/auth/login').send({ username: 'brian', password: '1234' })
      expect(res.body.message).toMatch(/welcome, brian/i)
      expect(res.body.token).toBeTruthy()
      expect(res.status).toEqual(200)
    }, 750)

    it('[5] tests for failed login due to no username and/or password', async ()=>{
      let res = await request(server).post('/api/auth/login').send({ username: '', password: '1234' })
      expect(res.body.message).toMatch(/password required/i)
      expect(res.status).toEqual(401)
      res = await request(server).post('/api/auth/login').send({ username: 'john', password: '' })
      expect(res.body.message).toMatch(/password required/i)
      expect(res.status).toEqual(401)
      res = await request(server).post('/api/auth/login').send({ username: '', password: '' })
      expect(res.body.message).toMatch(/password required/i)
      expect(res.status).toEqual(401)
    }, 750)

    it('[6] tests for failed login due to non-existant username', async ()=>{
      let res = await request(server).post('/api/auth/login').send({ username: 'gabriel', password: '1234' })
      expect(res.body.message).toMatch(/username not found/i)
      expect(res.status).toEqual(401)
    }, 750)
  })
})

describe("jokes-router.js; testing jokes route endpoint", ()=>{
  describe("[GET] api/jokes", ()=>{
    it('[7] requests without a token are bounced with proper status and message', async () => {
      const res = await request(server).get('/api/jokes')
      expect(res.body.message).toMatch(/token required/i)
    }, 750)

    it('[8] requests with an invalid token are bounced with proper status and message', async () => {
      const res = await request(server).get('/api/jokes').set('Authorization', 'foobar')
      expect(res.body.message).toMatch(/token invalid/i)
    }, 750)

    it('[9] requests with a valid token obtain a list of jokes', async () => {
      let res = await request(server).post('/api/auth/login').send({ username: 'brian', password: '1234' })
      res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
      expect(res.body).toHaveLength(3)
      expect(res.body[0]).toMatchObject(joke1)
    }, 750)
  })


})
