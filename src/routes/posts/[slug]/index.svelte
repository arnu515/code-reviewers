<script lang="ts" context="module">
    import axios from "axios";
    import type { Post, Resp } from "../../../util/types";

    export async function preload({ params: { slug } }, { apiUrl }) {
        try {
            const { data } = await axios.get<Resp<{ post: Post }>>(
                apiUrl + "/api/posts/" + slug
            );
            return { post: data.data.post, apiUrl };
        } catch (e) {
            if (e?.response?.status === 404) this.error(404, "Post not found");
        }
    }
</script>

<script lang="ts">
    export let post: Post;
    export let apiUrl: string;
</script>

<svelte:head>
    <title>{post.title} - CodeReviewers</title>
</svelte:head>

<h1>{post.title}</h1>
<p class="lead text-muted">{post.description}</p>
<p>
    <small class="text-muted">By @{post.user.username}
        at
        {new Date(post.created_at).toDateString()}</small>
</p>
<hr />

<h3>
    Code Uploaded
    <small style="font-size: 16px"><a href="#reviews">Jump to reviews</a></small>
</h3>
