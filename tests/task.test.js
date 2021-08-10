const req = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { 
    userOneId, 
    userOne, 
    userTwoId, 
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    taskFour,
    setupDb,
    mongoose
} = require('./fixtures/db')

beforeEach(setupDb)

test('CAN create a task for a user', async () => {
    const res = await req(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201)

    const task = await Task.findById(res.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
});

test('CAN get all tasks for a user', async () => {
    const res = await req(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(3)
});

test('CANNOT delete another users tasks', async () => {
    await req(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
});

test('CANNOT create task with invalid desc/completed ', async () => {
    await req(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400)

    await req(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'This will fail',
            completed: 'Complete'
        })
        .expect(400)
});

test('CANNOT update task with invalid desc/completed ', async () => {
    await req(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400)

    await req(app)
    .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'This will fail',
            completed: 'Complete'
        })
        .expect(400)
});

test('CAN delete a users task', async () => {
    await req(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
});

test('CANNOT delete a task if unauthenticated', async () => {
    await req(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
});

test('CANNOT update another users task', async () => {
    await req(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            description: 'Forget everything',
            completed: false
        })
        .expect(404)
});

test('CAN get a users task by id', async () => {
    const res = await req(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.description).toBe(taskOne.description)
});

test('CANNOT get a unauthenticated users task by id', async () => {
    const res = await req(app)
        .get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
});

test('CAN get a users completed tasks', async () => {
    const res = await req(app)
        .get(`/tasks`)
        .query({
            completed: 'true'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(1)  
});

test('CAN get a users incomplete tasks', async () => {
    const res = await req(app)
        .get(`/tasks`)
        .query({
            completed: 'false'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(2)  
});

test('CAN get a users tasks sorted by description: asc/desc', async () => {
    const expectedTasks = [
        taskOne, /* 'First' */
        taskFour, /* 'Fourth' */
        taskTwo, /* 'Second */
    ]

    const resAsc = await req(app)
        .get(`/tasks`)
        .query({
            sortBy: 'description'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    resAsc.body.forEach((aTask, index) => {
        expect(aTask.description).toBe(expectedTasks[index].description)
    })
    
    expectedTasks.reverse()

    const resDesc = await req(app)
        .get(`/tasks`)
        .query({
            sortBy: 'description:desc'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    resDesc.body.forEach((aTask, index) => {
        expect(aTask.description).toBe(expectedTasks[index].description)
    })
});

test('CAN get a users tasks sorted by completed: asc/desc', async () => {
    const expectedTasksAsc = [
        taskOne, /* false */
        taskFour, /* false */
        taskTwo, /* true */
    ]

    const resAsc = await req(app)
        .get(`/tasks`)
        .query({
            sortBy: 'completed'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    resAsc.body.forEach((aTask, index) => {
        expect(aTask._id).toEqual(expectedTasksAsc[index]._id.toString())
        expect(aTask.description).toBe(expectedTasksAsc[index].description)
    })

    const expectedTasksDesc = [
        taskTwo, /* true */
        taskOne, /* false */
        taskFour, /* false */
    ]

    const resDesc = await req(app)
        .get(`/tasks`)
        .query({
            sortBy: 'completed:desc'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    resDesc.body.forEach((aTask, index) => {
        expect(aTask._id).toEqual(expectedTasksDesc[index]._id.toString())
        expect(aTask.description).toBe(expectedTasksDesc[index].description)
    })
});

test('CAN get a users tasks sorted by createdAt: asc/desc', async () => {
    const expectedTasks = [
        taskOne, /* 1st */
        taskTwo, /* 2nd */
        taskFour, /* 3rd */
    ]

    const resAsc = await req(app)
        .get(`/tasks`)
        .query({
            sortBy: 'createdAt'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    resAsc.body.forEach((aTask, index) => {
        expect(aTask._id).toEqual(expectedTasks[index]._id.toString())
        expect(aTask.description).toBe(expectedTasks[index].description)
    })

    expectedTasks.reverse()

    const resDesc = await req(app)
        .get(`/tasks`)
        .query({
            sortBy: 'createdAt:desc'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    resDesc.body.forEach((aTask, index) => {
        expect(aTask._id).toEqual(expectedTasks[index]._id.toString())
        expect(aTask.description).toBe(expectedTasks[index].description)
    })
});

test('CAN get a users tasks sorted by updatedAt: asc/desc', async () => {
    const expectedTasks = [
        taskOne, /* updated = created */
        taskFour, /* updated first */
        taskTwo, /* updated second */
    ]

    const resUpdateOne = await req(app)
        .patch(`/tasks/${taskFour._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: true
        })
        .expect(200).then(async () => {
            const resUpdateTwo = await req(app)
                .patch(`/tasks/${taskTwo._id}`)
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send({
                    completed: false
                })
            .expect(200)
        })
    
    const resAsc = await req(app)
        .get(`/tasks`)
        .query({
            sortBy: 'updatedAt'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    resAsc.body.forEach((aTask, index) => {
        expect(aTask._id).toEqual(expectedTasks[index]._id.toString())
        expect(aTask.description).toBe(expectedTasks[index].description)
    })

    expectedTasks.reverse()

    const resDesc = await req(app)
        .get(`/tasks`)
        .query({
            sortBy: 'updatedAt:desc'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    resDesc.body.forEach((aTask, index) => {
        expect(aTask._id).toEqual(expectedTasks[index]._id.toString())
        expect(aTask.description).toBe(expectedTasks[index].description)
    })
});

test('CAN get a page of a users tasks', async () => {
    const expectedPage1Tasks = [
        taskOne, /* 'First' */
        taskFour, /* 'Fourth' */
    ]

    const expectedPage2Tasks = [
        taskTwo, /* 'Second */
    ]
    
    const resPage1 = await req(app)
        .get(`/tasks`)
        .query({
            sortBy: 'description',
            limit:2,
            skip: 0
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    resPage1.body.forEach((aTask, index) => {
        expect(aTask._id).toEqual(expectedPage1Tasks[index]._id.toString())
        expect(aTask.description).toBe(expectedPage1Tasks[index].description)
    })

    const resPage2 = await req(app)
        .get(`/tasks`)
        .query({
            sortBy: 'description',
            limit: 2,
            skip: 2
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    resPage2.body.forEach((aTask, index) => {
        expect(aTask._id).toEqual(expectedPage2Tasks[index]._id.toString())
        expect(aTask.description).toBe(expectedPage2Tasks[index].description)
    })
});