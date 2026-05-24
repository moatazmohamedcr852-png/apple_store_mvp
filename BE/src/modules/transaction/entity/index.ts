import { Double, ObjectId } from "mongoose";
import { PAYMENT_METHID } from "../../../utils/common/enum";

export class Transaction {
    name!: string;
    email!: string;
    city!:string;
    address!: string;
    products!: Record<string, number>;
    totalPrice!: number;
    paymentMethod!: PAYMENT_METHID;
    _id!: ObjectId;
    status!: boolean;
    phoneNumber!: string;
}