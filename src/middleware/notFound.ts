import { NextFunction, Request, Response } from "express";

export function notFound(req: Request, res: Response, next: NextFunction) {
    res.status(404).json({ message: "Route Not Found", path: req.originalUrl, date: Date() });
}