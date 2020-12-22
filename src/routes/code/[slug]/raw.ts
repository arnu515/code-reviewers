import axios from "axios";
import type { ClientRequest, ServerResponse } from "http";
import { handleAxiosError } from "../../../util";
import type { Code, Resp } from "../../../util/types";

export async function get(req: ClientRequest, res: ServerResponse) {
    const apiUrl = process.env.API_URL || "http://localhost:5000";
    try {
        const { data } = await axios.get<Resp<{ code: Code; content: string }>>(
            apiUrl + "/api/code/" + req["params"].slug
        );
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end(data.data.content);
    } catch (e) {
        if (e?.response?.data) {
            res.statusCode = e.response.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(e.response.data));
        } else {
            res.statusCode = e?.response?.status || 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
                JSON.stringify({
                    success: false,
                    message: handleAxiosError(e) || "Internal server error",
                    data: {},
                })
            );
        }
    }
}
