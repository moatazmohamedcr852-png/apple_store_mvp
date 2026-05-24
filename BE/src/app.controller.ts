import type { Express, NextFunction, Request, Response } from 'express';
import { connectDB } from './DB/connection';
import userController from './modules/user/user.controller';
import cors from 'cors';
import transactionController from './modules/transaction/transaction.controller';
import productController from './modules/product/product.controller';
import adminController from './modules/admin/admin.controller';
import { AppError } from './utils/common/Error';
import path from 'path';

export function bootstrap(app: Express, express: any) {
    app.use(express.json());
    app.use(cors());
    // Serve the uploads directory statically
    app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

    app.use('/user', userController);
    app.use('/transaction', transactionController);
    app.use('/product', productController);
    app.use('/admin', adminController);
    app.use((error: AppError, req: Request, res: Response, next: NextFunction) => {
        if (!error) {
            next();
        }
        const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
        res.status(error.statusCode || 500).json({
            message: error.message,
            errorDetails: error.errorDetails,
            ...(isProduction ? {} : { stack: error.stack })
        });
    })
    app.use("/:dummy", (req: Request, res: Response, next: NextFunction) => {
        res.status(404).json({ message: "invalid url" })
    })

    connectDB();
}