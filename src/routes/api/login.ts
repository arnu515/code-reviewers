import axios from "axios";
import type { ClientRequest, ServerResponse } from "http";
import type { Resp, User } from "../../util/types";

export async function post(req: ClientRequest, res: ServerResponse) {
    res.setHeader("Content-Type", "application/json");
    const apiUrl = process.env.API_URL || "http://localhost:5000";

    let { email, password } = (req as any).body;
    if (!email || !password) {
        res.statusCode = 400;
        return res.end(
            JSON.stringify({
                success: false,
                data: {},
                message: "Fill out all fields!",
            })
        );
    }

    try {
        const r = await axios.post<Resp<{ user: User; token: string }>>(
            apiUrl + "/api/auth/login",
            {
                email,
                password,
            }
        );
        if (r.data.success) {
            res.statusCode = 200;
            (req as any).session.accessToken = r.data.data.token;
            return res.end(JSON.stringify(r.data));
        } else {
            res.statusCode = r.status;
            return res.end(JSON.stringify(r.data));
        }
    } catch (error) {
        if (error.response) {
            const r = error.response;
            res.statusCode = r.status;
            return res.end(JSON.stringify(r.data));
        } else {
            res.statusCode = 500;
            return res.end(
                JSON.stringify({
                    data: {},
                    message: error,
                    success: false,
                })
            );
        }
    }
}

export async function del(req: ClientRequest, res: ServerResponse) {
    res.setHeader("Content-Type", "application/json");
    const apiUrl = process.env.API_URL || "http://localhost:5000";

    if (!(req as any).session.accessToken) {
        res.statusCode = 401;
        return res.end(
            JSON.stringify({
                data: {},
                success: false,
                message: "Not logged in",
            })
        );
    }

    try {
        const r = await axios.delete<Resp<{}>>(apiUrl + "/api/auth/logout", {
            headers: {
                Authorization: "Bearer " + (req as any).session.accessToken,
            },
        });
        res.statusCode = r.status;
        delete (req as any).session.accessToken;
        return res.end(JSON.stringify(r.data));
    } catch (error) {
        if (error.response) {
            const r = error.response;
            res.statusCode = r.status;
            return res.end(JSON.stringify(r.data));
        } else {
            res.statusCode = 500;
            return res.end(
                JSON.stringify({
                    data: {},
                    message: error,
                    success: false,
                })
            );
        }
    }
}

export async function get(req: ClientRequest, res: ServerResponse) {
    res.setHeader("Content-Type", "application/json");
    const apiUrl = process.env.API_URL || "http://localhost:5000";

    try {
        const r = await axios.get(apiUrl + "/api/auth/user", {
            headers: {
                Authorization: "Bearer " + (req as any).session.accessToken,
            },
        });
        if (res.statusCode === 401) delete (req as any).session.accessToken;
        res.statusCode = r.status;
        return res.end(JSON.stringify(r.data));
    } catch (error) {
        if (error.response) {
            delete (req as any).session.accessToken;
            const r = error.response;
            res.statusCode = r.status;
            return res.end(JSON.stringify(r.data));
        } else {
            res.statusCode = 500;
            return res.end(
                JSON.stringify({
                    data: {},
                    message: error,
                    success: false,
                })
            );
        }
    }
}
