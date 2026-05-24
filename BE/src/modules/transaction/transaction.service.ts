import { NextFunction, Request, Response } from "express";
import { TransactionRepository } from "../../models/transaction/transaction.repository";
import { TransactionDTO } from "./transaction.dto";
import { BadRequestError } from "../../utils/common/Error";
import { ProductRepository } from "../../models/product/product.repository"; // import your product repo
import { devConfig } from "../../config/dev.env";
import { sendEmail } from "../../utils/email";
import axios from "axios";
import { sendTelegramMessage } from "../../utils/telegram";





class TransactionService {
    private transactionRepository = new TransactionRepository();
    private productRepository = new ProductRepository();

    public getTransaction = async (req: Request, res: Response, next: NextFunction) => {
        res.json({ message: "done successfully", success: true });
    }

    public createTransaction = async (req: Request, res: Response, next: NextFunction) => {
        const newTransaction: TransactionDTO = req.body;
        console.log('Received payload:', req.body);

        newTransaction.status = newTransaction.status ?? false;

        const transaction = await this.transactionRepository.create(newTransaction);

        const productEntries = await Promise.all(
            Object.entries(newTransaction.products).map(async ([productId, qty]) => {
                const product = await this.productRepository.findById(productId);
                if (!product) return null;
                return `<li>${product.name} × ${qty}</li>`;
            })
        );

        const productListHtml = productEntries.filter(Boolean).join("");

        await sendEmail({
            from: `'Apple Store' <${devConfig.SMTP_EMAIL}>`,
            to: newTransaction.email as string,
            subject: "Order Confirmation - Apple Store",
            html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #000; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 24px;">Order Confirmed</h1>
            </div>
            <div style="padding: 30px; color: #333;">
                <h2 style="margin-top: 0;">Hi ${newTransaction.name},</h2>
                <p style="font-size: 16px; line-height: 1.5;">Thank you for shopping with us! Your order has been successfully placed and is now being prepared for shipment.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background-color: #f8f8f8;">
                            <th style="text-align: left; padding: 10px;">Item</th>
                            <th style="text-align: center; padding: 10px;">Qty</th>
                            <th style="text-align: right; padding: 10px;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productListHtml}
                    </tbody>
                </table>

                <div style="text-align: right; font-size: 18px; margin-top: 10px;">
                    <strong>Total Amount: <span style="color: #28a745;">${newTransaction.totalPrice.toFixed(2)}LE</span></strong>
                </div>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">

                <h3 style="font-size: 16px; margin-bottom: 10px;">Shipping & Contact Details</h3>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6;">
                    <p style="margin: 0;"><strong>Address:</strong> ${newTransaction.address}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Phone:</strong> ${newTransaction.phoneNumber}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Payment Method:</strong> ${newTransaction.paymentMethod.toUpperCase()}</p>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #777; text-align: center;">
                    If you have any questions, reply to this email or visit our support page.
                </p>
            </div>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                &copy; 2026 Apple Store. All rights reserved.
            </div>
        </div>
    `,
        });


        for (const productId in newTransaction.products) {
            const quantity = newTransaction.products[productId] as number;
            const product = await this.productRepository.findById(productId);

            if (!product) {
                throw new BadRequestError(`Product with ID ${productId} not found`);
            }

            if (product.stock < quantity) {
                throw new BadRequestError(`Not enough stock for ${product.name}`);
            }

            product.stock -= quantity;
            await this.productRepository.update(productId, { stock: product.stock });
        }
        const telegramProducts = await Promise.all(
            Object.entries(newTransaction.products).map(async ([productId, qty]) => {
                const product = await this.productRepository.findById(productId);
                if (!product) return null;
                return `• ${product.name} × ${qty}`;
            })
        );

        const productsText = telegramProducts
            .filter(Boolean)
            .join("\n");




        await sendTelegramMessage(`
🛒 <b>New Order Received</b>

👤 <b>Name:</b> ${newTransaction.name}
📧 <b>Email:</b> ${newTransaction.email}
📞 <b>Phone:</b> ${newTransaction.phoneNumber}
🏙 <b>City:</b> ${newTransaction.city}
📍 <b>Address:</b> ${newTransaction.address}

📦 <b>Products:</b>
${productsText}

💳 <b>Payment:</b> ${newTransaction.paymentMethod.toUpperCase()}
💰 <b>Total:</b> ${newTransaction.totalPrice} LE
`);




        return res.status(201).json({
            success: true,
            message: "Transaction created successfully.",
        });


    };
}

export default new TransactionService();
