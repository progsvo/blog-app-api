import { Request, Response, NextFunction } from "express";
import { auth as betterAuth } from "../lib/auth";

export enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER",
}
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
                emailVerified: boolean;
            };
        }
    }
}
const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get user session
            const session = await betterAuth.api.getSession({
                headers: req.headers as any,
            })
            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                })
            }
            if (!session.user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Email not verified"
                })
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                emailVerified: session.user.emailVerified,
            }

            if (roles.length > 0 && !roles.includes(session.user.role as UserRole)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden! You don't have permission to access this resource"
                })
            }

            next();

        } catch (error) {
            next(error);
        }
    }
}

export default auth;