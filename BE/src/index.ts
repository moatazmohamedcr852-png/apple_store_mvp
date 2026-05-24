import express from "express";
// import { config } from "dotenv"
import { log } from "console";
import { bootstrap } from "./app.controller";
import { devConfig } from "./config/dev.env";
import { scheduleOfferExpiry } from "./modules/admin/offer.cron";

const app = express();
bootstrap(app, express);

// Start background jobs
scheduleOfferExpiry();

if (!process.env.VERCEL) {
    const port = devConfig.PORT || 3000;
    app.listen(port, () => {
        log("application is running on port", port);
    });
}

export default app;
