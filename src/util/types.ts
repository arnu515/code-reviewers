export interface Resp<D> {
    success: boolean;
    data: D;
    message: string;
}

export interface User {
    id: number;
    email: string;
    username: string;
    role: "member" | "admin";
    created_at: string;
    updated_at: string;
}
