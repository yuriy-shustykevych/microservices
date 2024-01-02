import request from "supertest"
import { app } from "../../app"

it("fails when email that supplied is not used", async ()=>{
    return request(app).post('/api/users/signin').send({email: "test@test.com", password: 'password'}).expect(400)
})

it("fails when wrong password is supplied", async ()=>{
    await request(app).post('/api/users/signup').send({email: "test@test.com", password: 'password'}).expect(201)
    await request(app).post('/api/users/signin').send({email: "test@test.com", password: 'password2'}).expect(400)
})

it("fails when wrong password is supplied", async ()=>{
    await request(app).post('/api/users/signup').send({email: "test@test.com", password: 'password'}).expect(201)
    const response =  await request(app).post('/api/users/signin').send({email: "test@test.com", password: 'password'}).expect(200)

    expect(response.get('Set-Cookie')).toBeDefined()
})
