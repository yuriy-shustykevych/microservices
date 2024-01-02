import {natsWrapper} from "../../../nats-wrapper";
import {OrderCancelledEvent, OrderStatus} from "@yustickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {OrderCancelledListener} from "../order-cancelled-listener";
import {Order} from "../../../models/order";

const setup = async ()=> {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 10,
        userId: 'user id',
        status: OrderStatus.Cancelled
    })

    await order.save();

    const data: OrderCancelledEvent["data"] = {
        id: order.id,
        version: 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { msg, data, listener, order }
}

it('updates status of the order', async ()=>{
    const { msg, data, listener, order } = await setup()

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async ()=>{
    const { msg, data, listener, order } = await setup()

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled()
})
