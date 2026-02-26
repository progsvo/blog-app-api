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
const getMyPosts = async (authorId: string) => {
    await prisma.user.findUniqueOrThrow({
        where: {
            id: authorId,
            status: 'ACTIVE'
        },
        select: {
            id: true,
            status: true
        }
    })

    const result = await prisma.post.findMany({
        where: {
            authorId: authorId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select: {
                    comments: true
                }
            }
        }
    })
    // const total = await prisma.post.aggregate({
    //     _count: {
    //         id: true
    //     },
    //     where: {
    //         authorId: authorId
    //     },
    // })
    return result;
}


const updatePost = async (postId: string, data: Partial<Post>, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId,
        },
        select: {
            id: true,
            authorId: true
        }
    })
    // admin jodi na hoy ebong athorId jodi match na kore (admin update korte parbe she jodi post er author nao hoye thake)
    if (!isAdmin && (postData.authorId !== authorId)) {
        throw new Error("You are not authorized to update this post");
    }
    // user isFeature update korte parbe na
    if (!isAdmin) {
        delete data.isFeatured
    }
    const result = await prisma.post.update({
        where: {
            id: postId
        },
        data: data
    })
    return result;
}

/* 
1. user nijer post delete korte parbe
2. admin jekono post delete korte parbe
*/
const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId,
        },
        select: {
            id: true,
            authorId: true
        }
    })
    // admin jodi na hoy ebong athorId jodi match na kore (admin delete korte parbe she jodi post er author nao hoye thake)
    if (!isAdmin && (postData.authorId !== authorId)) {
        throw new Error("You are not authorized to delete this post");
    }
    const result = await prisma.post.delete({
        where: {
            id: postId
        }
    })
    return result;
}

const getStats = async () => {
    /*
    1. post count
    2. published post
    3. draft posts
    4. totat comments
    5. totalViews 
    6. totalUsers
    7. adminCount
    8. userCount
    */
    return await prisma.$transaction(async (tx) => {

        // ❌ old style ========
        // const totalPosts = await tx.post.count();
        // const publishedPosts = await tx.post.count({
        //     where: {
        //         status: PostStatus.PUBLISHED
        //     }
        // })
        // const draftPosts = await tx.post.count({
        //     where: {
        //         status: PostStatus.DRAFT
        //     }
        // })
        // const archivedPosts = await tx.post.count({
        //     where: {
        //         status: PostStatus.ARCHIVED
        //     }
        // })
        // const totalComments = await tx.comment.count();
        // const totalViews = await tx.post.aggregate({
        //     _sum: {
        //         views: true
        //     }
        // })

        // ✅ new style ==========
        const [totalPosts, publishedPosts, draftPosts, archivedPosts, totalComments, totalViews, totalUsers, adminCount, userCount] = await Promise.all([
            await tx.post.count(),
            await tx.post.count({
                where: {
                    status: PostStatus.PUBLISHED
                }
            }),
            await tx.post.count({
                where: {
                    status: PostStatus.DRAFT
                }
            }),
            await tx.post.count({
                where: {
                    status: PostStatus.ARCHIVED
                }
            }),
            await tx.comment.count(),
            await tx.post.aggregate({
                _sum: {
                    views: true
                }
            }),
            await tx.user.count(),
            await tx.user.count({
                where: {
                    role: "ADMIN"
                }
            }),
            await tx.user.count({
                where: {
                    role: "USER"
                }
            })
        ])

        return {
            totalPosts,
            publishedPosts,
            draftPosts,
            archivedPosts,
            totalComments,
            totalViews: totalViews._sum.views,
            totalUsers,
            adminCount,
            userCount
        }
    })

}

export const postService = {
    createPost,
    getAllPosts,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost,
    getStats
}