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

export interface Post {
    id: number;
    title: string;
    description: string;
    public: boolean;
    suggestions: boolean;
    created_at: string;
    updated_at: string;
    user: User;
    code: Code[];
}

export interface Code {
    id: number;
    filename: string;
    language: string;
    path: string;
    created_at: string;
    updated_at: string;
    user: User;
}
