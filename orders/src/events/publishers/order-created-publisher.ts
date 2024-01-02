import {Publisher, OrderCreatedEvent, Subjects} from "@yustickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated
}
