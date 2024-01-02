import {PaymentCreatedEvent, Publisher, Subjects} from "@yustickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;

}
