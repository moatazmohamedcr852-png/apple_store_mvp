import { ObjectId } from "mongoose";
import { PAYMENT_METHID } from "../enum";

export interface ITransaction{
    name:string,
    email:string,
    city:string,
    address:string,
    products:Record<string, number>,
    totalPrice:number,
    paymentMethod:PAYMENT_METHID,
    status:boolean,
    phoneNumber:string,

}