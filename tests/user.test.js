const req = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { 
    userOneId, 
    userOne, 
    userNew, 
    setupDb } = require('./fixtures/db')

beforeEach(setupDb)

test('CAN signup a new user', async () => {
    const res = await req(app)
        .post('/users')
        .send(userNew)
        .expect(201)
    //assert that the db was updated
    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull()

    //asserts about the res
    expect(res.body).toMatchObject({
        user: {
            name: userNew.name,
            email: userNew.email
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe(userNew.password)
})

test('CAN login as an existing user', async () => {
    await req(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)
})

test('CAN login as an existing user again', async () => {
    const res = await req(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)
    
    const user = await User.findById(userOne)

    expect(user.tokens[1].token).toBe(res.body.token)
})

test('DANNOT login as a nonexistent user', async () => {
    await req(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: 'n0T3x!$t@n7'
        })
        .expect(400)
})

test('CAN get profile for a user', async () => {
    await req(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('CANNOT get profile for an unauthorized user', async () => {
    await req(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('CAN delete an account for a user', async () => {
    const res = await req(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    const user = await User.findById(userOneId)

    expect(user).toBeNull()
})

test('CANNOT delete an account for an unauthorized user', async () => {
    await req(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('CAN upload an avatar photo', async () => {
    await req(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('CAN update valid user fields', async () => {
    const newName = 'Clem McGillicutty'
    await req(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: newName
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe(newName)
})

test('CANNOT update nonexistent user fields', async () => {
    await req(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Somewhere'
        })
        .expect(400)
})

test('CANNOT update valid user fields when an unauthenticated user', async () => {
    const newName = 'Clem McGillicutty'
    await req(app)
        .patch('/users/me')
        .send({
            name: newName
        })
        .expect(401)
})

test('CANNOT signup user with invalid name', async () => {
    await req(app)
        .post('/users')
        .send({
            name: '',
            email: userNew.email,
            password: userNew.password
        })
        .expect(400)
})

test('CANNOT signup user with invalid email', async () => {
    await req(app)
        .post('/users')
        .send({
            name: userNew.name,
            email: '',
            password: userNew.password
        })
        .expect(400)

    await req(app)
        .post('/users')
        .send({
            name: userNew.name,
            email: 'example.com',
            password: userNew.password
        })
        .expect(400)
})

test('CANNOT signup user with invalid password', async () => {
    await req(app)
        .post('/users')
        .send({
            name: userNew.name,
            email: userNew.email,
            password: ''
        })
        .expect(400)

    await req(app)
        .post('/users')
        .send({
            name: userNew.name,
            email: userNew.email,
            password: 'password'
        })
        .expect(400)

    await req(app)
        .post('/users')
        .send({
            name: userNew.name,
            email: userNew.email,
            password: 'P@s!'
        })
        .expect(400)
})

test('CANNOT update invalid user field: name', async () => {
    await req(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: ''
        })
        .expect(400)
})

test('CANNOT update invalid user field: email', async () => {
    await req(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: ''
        })
        .expect(400)
    
    await req(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'example.com'
        })
        .expect(400)
})

test('CANNOT update invalid user field: name', async () => {
    await req(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: ''
        })
        .expect(400)
    
    await req(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: 'password'
        })
        .expect(400)

    await req(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: 'P@s!1'
        })
        .expect(400)
})