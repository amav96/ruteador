export interface PaginationModel<T> {
    current_page: number;
    data: T[];
    per_page: number;
    total: number;
    last_page: number,
    next_page_url: string
    prev_page_url: string
}

export interface ErrorModel {
    data: {
        code: string;
        message: string;
    }
}