import {Publisher, Subjects, TicketUpdatedEventEvent} from "@yustickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEventEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;

}
