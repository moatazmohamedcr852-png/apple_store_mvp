import { Router } from "express";
import adminService from "./admin.service";
import { adminAuth } from "./admin.middleware";

const router = Router();

// Public route — no auth needed
router.post("/login", adminService.login);

// Protected routes — require admin JWT
router.put("/product/:id", adminAuth, adminService.updateProduct);
router.delete("/product/:id", adminAuth, adminService.deleteProduct);
router.get("/orders", adminAuth, adminService.getOrders);
router.get("/offers", adminAuth, adminService.getOffers);
router.post("/offer", adminAuth, adminService.createOffer);
router.delete("/offer/:id", adminAuth, adminService.deleteOffer);

export default router;
