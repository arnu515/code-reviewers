import axios from "axios";
import type { ClientRequest, ServerResponse } from "http";
import type { Resp, User } from "../../util/types";

export async function post(req: ClientRequest, res: ServerResponse) {
    res.setHeader("Content-Type", "application/json");
    const apiUrl = process.env.API_URL || "http://localhost:5000";

    let { email, password, username } = (req as any).body;
    if (!email || !password || !username) {
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
            apiUrl + "/api/auth/register",
            {
                email,
                password,
                username,
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
