import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
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
        // for search
        const { search } = req.query;
        const searchStr = typeof search === "string" ? search : undefined;
        // tags
        const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
        // isFeatured (true or false)
        const isFeatured = req.query.isFeatured
            ? (req.query.isFeatured as string) === "true"
                ? true
                : (req.query.isFeatured as string) === "false"
                    ? false
                    : undefined
            : undefined;
        // status
        const status = req.query.status as PostStatus | undefined;
        // authorId
        const authorId = req.query.authorId as string | undefined;

        // ❌  ======== manual code
        // page and limit
        /*  const page = Number(req.query.page ?? 1);
         const limit = Number(req.query.limit ?? 10);
         const skip = (page - 1) * limit; */
        // sort
        /*  const sortBy = req.query.sortBy as string | undefined;
         const sortOrder = req.query.sortOrder as string | undefined; */

        // ✅  using helper function ===========
        const options = paginationSortingHelper(req.query);
        const { page, limit, skip, sortBy, sortOrder } = options;




        // service call
        const result = await postService.getAllPosts({ search: searchStr, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder });
        res.status(200).json({
            success: true,
            message: "Posts fetched successfully",
            data: result.data,
            meta: result.meta
        })
    } catch (error) {
        res.status(400).json({
            error: "Posts fetching failed",
            details: error
        })
    }

}

const getPostById = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        if (!postId) {
            throw new Error("Post id is required");
        }
        const result = await postService.getPostById(postId as string);
        res.status(200).json({
            success: true,
            message: "Post fetched successfully",
            data: result
        })
    } catch (error) {
        res.status(400).json({
            error: "Post fetching failed",
            details: error
        })
    }
}

export const postController = {
    createPost,
    getAllPosts,
    getPostById
}