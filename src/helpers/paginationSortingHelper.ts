type IOptions = {
    page?: number | string;
    limit?: number | string;
    sortOrder?: string;
    sortBy?: string;
}

type IOptionsResult = {
    page: number;
    limit: number;
    skip: number;
    sortOrder: string;
    sortBy: string;
}

const paginationSortingHelper = (options: IOptions): IOptionsResult => {
    const page: number = Number(options.page) || 1;
    const limit: number = Number(options.limit) || 10;
    const skip: number = (page - 1) * limit;
    const sortOrder: string = options.sortOrder || "desc";
    const sortBy: string = options.sortBy || "createdAt";
    return {
        page,
        limit,
        skip,
        sortOrder,
        sortBy
    }
}
export default paginationSortingHelper;