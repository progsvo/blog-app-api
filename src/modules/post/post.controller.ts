import { Request, Response } from "express";
import { postService } from "./post.service";
const createPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "Unauthorized!"
            });

        }
        const result = await postService.createPost(req.body, user.id as string);
        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            error: "Post creation failed",
            details: error
        })
    }
}

const getAllPosts = async (req: Request, res: Response) => {
    try {
        const result = await postService.getAllPosts();
        res.status(200).json({
            success: true,
            message: "Posts fetched successfully",
            data: result
        })
    } catch (error) {
        res.status(400).json({
            error: "Posts fetching failed",
            details: error
        })
    }

}

export const postController = {
    createPost,
    getAllPosts
}