import {Publisher, OrderCancelledEvent, Subjects} from "@yustickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}
