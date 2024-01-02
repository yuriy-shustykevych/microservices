import {Publisher, Subjects, TicketCreatedEvent} from "@yustickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
