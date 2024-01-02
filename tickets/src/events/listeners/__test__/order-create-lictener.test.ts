import {OrderCreatedListener} from '../order-created-listener'
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import {OrderCreatedEvent, OrderStatus} from "@yustickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import e from "express";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client)

    const ticket = Ticket.build({
        title: 'concert',
        price: 10,
        userId: 'id of user'
    })

    await ticket.save()

    const data: OrderCreatedEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'long time',
        ticket: {
            id: ticket.id,
            price: ticket.price,
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, msg, data}
}

it('sets the userId of the ticket', async ()=>{
    const { listener, msg, data, ticket } = await setup()

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async ()=>{
    const { listener, msg, data } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('published a ticket updated event', async ()=>{
    const { listener, msg, data } = await setup()

    await listener.onMessage(data, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

    expect(data.id).toEqual(ticketUpdatedData.orderId)
})
