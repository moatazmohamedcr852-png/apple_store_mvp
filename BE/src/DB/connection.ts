import mongoose from "mongoose"
import { env } from "process";
import { devConfig } from "../config/dev.env";
import { log } from "console";
export async function connectDB() {
    // console.log(devConfig.MONGODB_URI);
    log("MONGODB_URI",devConfig.MONGODB_URI);
    await mongoose.connect(devConfig.MONGODB_URI).then(() => {
        console.log("DB connected successfully");
    }).catch(() => {
        console.log("failed to connect to DB");
    });
}