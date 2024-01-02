import mongoose from "mongoose"
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import {OrderStatus} from "@yustickets/common"
import {TicketDoc} from "./ticket"

export {OrderStatus}

interface OrderAttrs {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

interface OrderDocs extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDocs> {
    build(attrs: OrderAttrs): OrderDocs
}

const orderSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    expiresAt: {type: mongoose.Schema.Types.Date},
    ticket: {type: mongoose.Schema.Types.ObjectId, ref: 'Ticket'}
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
})

orderSchema.set('versionKey', 'version')

orderSchema.plugin(updateIfCurrentPlugin);

// DOES NOT WORK
// orderSchema.pre('save', function (done) {
//     this.$where = {
//         version: this.get('version') - 1
//     }
//
//     done()
// })

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs)
}

const Order = mongoose.model<OrderDocs, OrderModel>('Order', orderSchema)

export {Order}
