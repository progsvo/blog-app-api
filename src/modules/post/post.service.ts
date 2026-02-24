import { PostWhereInput } from './../../../generated/prisma/internal/prismaNamespace';
import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })
    return result;
}

const getAllPosts = async ({
    search,
    tags,
    isFeatured,
    status,
    authorId,
    page,
    limit,
    skip,
    sortBy,
    sortOrder
}: {
    search: string | undefined,
    tags: string[] | []
    isFeatured: boolean | undefined,
    status: PostStatus | undefined,
    authorId: string | undefined,
    page: number,
    limit: number,
    skip: number,
    sortBy: string,
    sortOrder: string
}) => {
    const andCondition: PostWhereInput[] = [];
    if (search) {
        andCondition.push({
            OR: [
                {
                    title: {
                        contains: search as string,
                        mode: "insensitive"
                    },

                },
                {
                    content: {
                        contains: search as string,
                        mode: "insensitive"
                    }
                },
                {
                    tags: {
                        has: search as string
                    }
                }
            ],
        })
    }

    if (tags?.length) {
        andCondition.push({
            tags: {
                hasEvery: tags as string[]
            }
        })
    }

    if (typeof isFeatured === 'boolean') {
        andCondition.push({
            isFeatured
        })
    }

    if (status) {
        andCondition.push({
            status
        })
    }

    if (authorId) {
        andCondition.push({
            authorId
        })
    }

    const result = await prisma.post.findMany({
        take: limit,
        skip,
        where: {
            AND: andCondition
        },
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            _count: {
                select: {
                    comments: true
                }
            }
        }
    });
    const count = await prisma.post.count({
        where: {
            AND: andCondition
        }
    })
    return {
        data: result,
        meta: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
}

const getPostById = async (postId: string) => {
    const result = await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            }
        })
        const postData = await tx.post.findUnique({
            where: {
                id: postId
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: CommentStatus.APPROVED
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    include: {
                        replies: {
                            where: {
                                status: CommentStatus.APPROVED
                            },
                            orderBy: {
                                createdAt: "asc"
                            },
                            include: {
                                replies: {
                                    where: {
                                        status: CommentStatus.APPROVED
                                    },
                                    orderBy: {
                                        createdAt: "asc"
                                    },
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        comments: true
                    }
                }
            }
        })
        return postData;
    })
    return result;
}

export const postService = {
    createPost,
    getAllPosts,
    getPostById
}