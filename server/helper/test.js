import fs from 'fs'
import path from 'path'
import { pool } from './db.js'
import { expect } from "chai"
import { compare, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'


const __dirname = import.meta.dirname

const initializeTestDb = () => {
    const sql = fs.readFileSync(path.resolve(__dirname, '../db.sql'), 'utf8')
    console.log(sql)
    pool.query(sql, (err) => {
        if (err) {
            console.error('Error initializing test database', err)
        } else {
            console.log('Test database initialized succesfully')
        }
    })
}

describe("Testing basic database functionality", () => {
    let token = null
    const testUser = { email: "foo@foo.com", password: "password123" }
    
    before(() => {
        initializeTestDb()
        token = getToken(testUser.email)
    })
    it("should get all tasks", async () =>{
        const response = await fetch("http://localhost:3001/")
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.be.an("array").that.is.not.empty
        expect(data[0]).to.include.all.keys(["id", "description"])
    })

    it("should create a new task", async () => {
        const newTask = { description: "Test task" }
        const response = await fetch("http://localhost:3001/create", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify({ task: newTask })
        })
    })

    it("should delete a task", async () => {
        const response = await fetch("http://localhost:3001/delete/1", {
            method: "delete",
            headers: { 
                "Content-Type": "application/json",
                Authorization: token 
            }
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.include.all.keys("id")
    })
})

const insertTestUser = (user) => {
    hash(user.password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password', err)
            return
        }
        pool.query(
            'INSERT INTO account (email, password) VALUES ($1, $2)',
            [user.email, hashedPassword],
            (err, result) => {
              if (err) {
                console.error('Error inserting test user', err)
              } else {
                console.log('Test user inserted successfully')
              }
            }
        )
          
    })
}

describe("Testing user management", () => {
    const user = { email: "foo2@test.com", password: "password123"}
    before(() => {
        insertTestUser(user)
    })
    it("should sign up", async () => {
        const newUser = { email: "foo@test.com" ,password: "password123" }
        const response = await fetch("http://localhost:3001/user/signup", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: newUser })
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data).to.include.all.keys(["id", "email"])
        expect(data.email).to.equal(newUser.email)
    })

    it('should log in', async () =>{
        const response = await fetch("http://localhost:3001/user/signin", {
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ user })
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.include.all.keys(["id", "email", "token"])
        expect(data.email).to.equal(user.email)
    })
})


const getToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET_KEY)
}

export { initializeTestDb, insertTestUser, getToken }
