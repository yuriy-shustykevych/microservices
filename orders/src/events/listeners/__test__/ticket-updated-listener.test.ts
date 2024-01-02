import {natsWrapper} from "../../../nats-wrapper";
import { TicketUpdatedEventEvent} from "@yustickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";
import {TicketUpdatedListener} from "../ticket-updated-listener";

const setup = async () =>{
    const listener = new TicketUpdatedListener(natsWrapper.client)

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
    })
    await ticket.save()

    const data: TicketUpdatedEventEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert',
        price: 99,
        userId: 'user id',
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, ticket, msg }
}

it('finds, updates, and saves a ticket', async ()=>{
    const {data, listener, msg, ticket} = await setup()

     await listener.onMessage(data, msg)

    const updatedTicket =  await Ticket.findById(ticket.id)

    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.version).toEqual(data.version)
})

it('acts the message', async ()=>{
    const {data, listener, msg} = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if event has skipped version number', async ()=>{
    const {data, listener, msg} = await setup()

    data.version = 10

    try {
        await listener.onMessage(data, msg)
    } catch (err) {}

    expect(msg.ack).not.toHaveBeenCalled()
})
