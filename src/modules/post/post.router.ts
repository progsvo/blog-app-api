import express from "express";
import { postController } from "./post.controller";

const router = express.Router();

router.post("/", postController.createPost).get("/", postController.getAllPosts);

export const postRouter = router;