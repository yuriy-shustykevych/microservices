import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import {natsWrapper} from "../../nats-wrapper";
import {Ticket} from "../../models/ticket";

it("returns 404 is provided id does not exists", async ()=>{
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app).put(`/api/tickets/${id}`).set("Cookie", global.signin()).send({title: "title", price: 10}).expect(404)
})

it("returns 401 if user is not logged", async ()=>{
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app).put(`/api/tickets/${id}`).send({title: "title", price: 10}).expect(401)
})

it("returns 401 if user does not own the ticket", async ()=>{
   const response = await request(app).post("/api/tickets").set("Cookie", global.signin()).send({title:"title", price: 10})
    await request(app).put(`/api/tickets/${response.body.id}`).set("Cookie", global.signin()).send({title: "title2", price: 11}).expect(401)
})

it("returns 400 if user provides an invalid title or price", async ()=>{
    const cookie = global.signin()
    const response = await request(app).post("/api/tickets").set("Cookie", cookie).send({title:"title", price: 10})
    await request(app).put(`/api/tickets/${response.body.id}`).set("Cookie", cookie).send({title: "", price: 20,}).expect(400)
    await request(app).put(`/api/tickets/${response.body.id}`).set("Cookie", cookie).send({title: "title", price: -20}).expect(400)
})

it("updates the ticket provided valid inputs", async ()=>{
    const cookie = global.signin()
    const response = await request(app).post("/api/tickets").set("Cookie", cookie).send({title:"title", price: 10})

    await request(app).put(`/api/tickets/${response.body.id}`).set("Cookie", cookie).send({title: "new title", price: 100}).expect(200)

    const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send()

    expect(ticketResponse.body.title).toEqual("new title");
    expect(ticketResponse.body.price).toEqual(100);
})

it("publishes an event", async ()=>{
    const cookie = global.signin()
    const response = await request(app).post("/api/tickets").set("Cookie", cookie).send({title:"title", price: 10})

    await request(app).put(`/api/tickets/${response.body.id}`).set("Cookie", cookie).send({title: "new title", price: 100}).expect(200)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects update is ticket is reserved', async () =>{
    const cookie = global.signin()
    const response = await request(app).post("/api/tickets").set("Cookie", cookie).send({title:"title", price: 10})

    const ticket = await Ticket.findById(response.body.id)
    ticket!.set({
        orderId: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket!.save();

    await request(app).put(`/api/tickets/${response.body.id}`).set("Cookie", cookie).send({title: "new title", price: 100}).expect(400)
})
