import { NextFunction, Request, Response } from "express"
import { Prisma } from "../../generated/prisma/client";

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    let statusCode = 500;
    let message = "Internal Server Error";
    let error = err;

    if (error instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Your request parameters are invalid";
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
            statusCode = 400;
            message = "An operation failed because it depends on one or more records that were required but not found";
        } else if (err.code === "P2002") {
            statusCode = 400;
            message = "Dulicate key error";
        } else if (err.code === "P2003") {
            statusCode = 400;
            message = "Foreign key constraint failed on the field";
        }
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 500,
            message = "Unknown request error"
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
        if (error.errorCode === "P1000") {
            statusCode = 401,
                message = "Authentication failed"
        } else if (error.errorCode === "P1001") {
            statusCode = 400,
                message = "Can't reach database server"
        }
    }

    res.status(statusCode)
    res.json({ message: message, error: error })
}

export default errorHandler
