import {Listener, Subjects, TicketUpdatedEventEvent} from "@yustickets/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from './queue-group-names'
import {Ticket} from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEventEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEventEvent["data"], msg: Message){
        const ticket = await Ticket.findByEvent(data)

        if(!ticket){
            throw new Error("Ticket not found")
        }
        const {title, price, version} = data

        ticket.set({title, price, version})

        await ticket.save()

        msg.ack()
    }
}
