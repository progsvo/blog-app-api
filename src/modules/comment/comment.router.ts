import express, { Router } from "express";
import { commentController } from "./comment.controller";
import auth, { UserRole } from "../../middleware/auth";
const router = express.Router();

router.get('/author/:authorId', auth(UserRole.USER, UserRole.ADMIN), commentController.getCommentByAuthor)
router.post('/', auth(UserRole.USER, UserRole.ADMIN), commentController.createComment)
router.get('/:commentId', auth(UserRole.USER, UserRole.ADMIN), commentController.getCommentById)
router.delete('/:commentId', auth(UserRole.USER, UserRole.ADMIN), commentController.deleteComment)
router.patch('/:commentId', auth(UserRole.USER, UserRole.ADMIN), commentController.updateComment)
router.patch('/:commentId/moderate', auth(UserRole.ADMIN), commentController.moderateComment)



export const commentRouter: Router = router;