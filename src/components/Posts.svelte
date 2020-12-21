<script lang="ts">
    import type { Post } from "../util/types";

    export let posts: Post[];
</script>

<style>
    a {
        text-decoration: none;
    }
</style>

{#each posts as post}
    <div class="card mb-2">
        <div class="card-header d-flex w-100 align-items-center">
            <a href="/@{post.user.username}">@{post.user.username}</a>
            <span class="ms-auto"><small
                    class="text-muted">{new Date(post.created_at).toDateString()}</small></span>
        </div>
        <div class="card-body">
            <h4><a href="/posts/{post.id}">{post.title}</a></h4>
            <hr />
            <p>
                <small class="text-muted"><em>{post.code.length}
                        code snippet{post.code.length === 1 ? '' : 's'}</em>
                    |
                    <em>Last edited on:
                        {new Date(post.updated_at).toDateString()}</em></small>
            </p>
        </div>
    </div>
{/each}
