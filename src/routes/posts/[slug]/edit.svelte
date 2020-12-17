<script context="module" lang="ts">
    import axios from "axios";
    import type { Post, Resp } from "../../../util/types";

    export async function preload(
        { params: { slug } },
        { apiUrl, accessToken }
    ) {
        try {
            const { data } = await axios.get<Resp<{ post: Post }>>(
                apiUrl + "/api/posts/" + slug
            );
            try {
                const {
                    data: { data: isAuthor },
                } = await axios.get<Resp<boolean>>(
                    apiUrl + "/api/posts/" + slug + "/author",
                    { headers: { Authorization: "Bearer " + accessToken } }
                );
                if (!isAuthor)
                    this.error(403, "You don't have permission to do that!");
            } catch (e) {
                if ([401, 403, 422].includes(e?.response?.status))
                    this.error(403, "You don't have permission to do that!");
            }
            return { post: data.data.post, apiUrl, accessToken };
        } catch (e) {
            if (e?.response?.status === 404) this.error(404, "Post not found");
        }
    }
</script>

<svelte:head>
    <title>Edit post - CodeReviewers</title>
</svelte:head>
