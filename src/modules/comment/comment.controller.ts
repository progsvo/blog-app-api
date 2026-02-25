import { Request, Response } from "express";
import { commentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.authorId = user?.id;

        const result = await commentService.createComment(req.body);
        res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            error: "Comment creation failed",
            details: error
        })
    }
}
const getCommentById = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        if (!commentId) {
            throw new Error("Comment id is required");
        }
        const result = await commentService.getCommentById(commentId as string);
        res.status(200).json({
            success: true,
            message: "Comment fetched successfully",
            data: result
        });

    } catch (error) {
        res.status(400).json({
            error: "Comment fetching failed",
            details: error
        })
    }
}
const getCommentByAuthor = async (req: Request, res: Response) => {
    try {
        const { authorId } = req.params;
        if (!authorId) {
            throw new Error("Author id is required");
        }
        const result = await commentService.getCommentsByAuthor(authorId as string);
        res.status(200).json({
            success: true,
            message: "Comment fetched successfully",
            data: result
        });

    } catch (error) {
        res.status(400).json({
            error: "Comment fetching failed",
            details: error
        })
    }
}

/* 
1. delete only own commnets
2. user should be logged in
3. check own comment or not
*/
const deleteComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { commentId } = req.params;

        const result = await commentService.deleteComment(commentId as string, user?.id as string);
        res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
            data: result
        });

    } catch (error) {
        res.status(400).json({
            error: "Comment delete failed",
            details: error
        })
    }
}
const updateComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { commentId } = req.params;

        const result = await commentService.updateComment(commentId as string, req.body, user?.id as string);
        res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: result
        });

    } catch (error) {
        res.status(400).json({
            error: "Comment update failed",
            details: error
        })
    }
}

const moderateComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const result = await commentService.moderateComment(commentId as string, req.body);
        res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: result
        });

    } catch (error) {
        console.log(error)
        res.status(400).json({
            error: "Comment update failed",
            details: error
        })
    }
}


export const commentController = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteComment,
    updateComment,
    moderateComment
}