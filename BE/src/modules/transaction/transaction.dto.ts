import { ObjectId } from "mongoose";
import { PAYMENT_METHID } from "../../utils/common/enum";


export interface TransactionDTO {
    name: string;
    email: string;
    city:string;
    address: string;
    phoneNumber: string;
    products: {
        [productId: string]: number; // productId -> quantity
    };
    totalPrice: number;
    paymentMethod: PAYMENT_METHID;
    status: boolean; // optional: default false
}
