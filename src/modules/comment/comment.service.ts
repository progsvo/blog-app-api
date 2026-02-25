import { CommentStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"

const createComment = async (payload: {
    content: string,
    authodId: string,
    postId: string,
    parentId?: string
}) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    })

    if (payload.parentId) {
        await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId
            }
        })
    }

    return await prisma.comment.create({
        data: payload as any
    })
}

const getCommentById = async (commentId: string) => {
    return await prisma.comment.findUnique({
        where: {
            id: commentId
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true
                }
            }
        }
    })
}

const getCommentsByAuthor = async (authorId: string) => {
    return await prisma.comment.findMany({
        where: {
            authorId: authorId
        },
        orderBy: { createdAt: 'desc' },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    })
}

const deleteComment = async (commentId: string, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId: authorId
        },
        select: {
            id: true
        }
    })
    if (!commentData) {
        throw new Error("Your provide input is invalid")
    }
    const result = await prisma.comment.delete({
        where: {
            id: commentData.id
        }
    })
    return result;

}


// authorid, commnetId, updateData
const updateComment = async (commentId: string, data: { content?: string, status?: CommentStatus }, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId: authorId
        },
        select: {
            id: true
        }
    })
    if (!commentData) {
        throw new Error("Your provide input is invalid")
    }
    return await prisma.comment.update({
        where: {
            id: commentData.id,
            authorId: authorId
        },
        data: data
    })
}

const moderateComment = async (id: string, data: { status: CommentStatus }) => {
    console.log({ id, data })
    const commentData = await prisma.comment.findUnique({
        where: {
            id: id
        }
    })
    if (!commentData) {
        throw new Error("Your provide input is invalid")
    }
    return await prisma.comment.update({
        where: {
            id: id
        },
        data
    })
}

export const commentService = {
    createComment,
    getCommentById,
    getCommentsByAuthor,
    deleteComment,
    updateComment,
    moderateComment
}
