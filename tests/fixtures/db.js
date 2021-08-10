const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'McGillicutty',
    email: 'Clem@example.com',
    password: '453Were!@1',
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Carl Sagan',
    email: 'csagan@example.com',
    password: 'C0sm0$1!1',
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
}

const userNew = {
    name: 'therealrogden',
    email: 'ron@example.com',
    password: 'P@ssW0rd!1'
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second',
    completed: true,
    owner: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third',
    completed: false,
    owner: userTwo._id
}

const taskFour = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Fourth',
    completed: false,
    owner: userOne._id
}

const setupDb = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
    await new Task(taskFour).save()
}

module.exports = {
    userOneId,
    userOne,
    userNew,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    taskFour,
    setupDb
}