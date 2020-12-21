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
    import { user } from "../../../util/stores";
    import { onMount, tick } from "svelte";
    import Loading from "../../../components/Loading.svelte";
    import type { Code } from "../../../util/types";
    import { handleAxiosError } from "../../../util";
    import hljs from "highlight.js";

    export let post: Post;
    export let apiUrl: string;

    onMount(() => {
        document.querySelectorAll(".code").forEach(async (el) => {
            try {
                const CODE_ID: number = parseInt(el.id.split("-")[1]);
                const {
                    data: {
                        data: { code, content },
                    },
                } = await axios.get<Resp<{ code: Code; content: string }>>(
                    apiUrl + "/api/code/" + CODE_ID
                );
                document.querySelector(
                    `.code#code-${CODE_ID} .card-body`
                ).innerHTML =
                    '<pre><code class="language-' +
                    code.language +
                    '">' +
                    content +
                    "</code></pre>";
                await tick();
                hljs.highlightBlock(
                    document.querySelector(`.code#code-${CODE_ID} pre code`)
                );
            } catch (e) {
                console.error(e);
                alert(handleAxiosError(e));
            }
        });
    });
</script>

<style>
    .card.card-action {
        transition: all 500ms ease;
    }

    .card.card-action:hover {
        cursor: pointer;
        box-shadow: 2px 5px 15px 3px rgba(0, 0, 0, 0.23);
        -webkit-box-shadow: 2px 5px 15px 3px rgba(0, 0, 0, 0.23);
        -moz-box-shadow: 2px 5px 15px 3px rgba(0, 0, 0, 0.23);
    }
</style>

<svelte:head>
    <title>{post.title} - CodeReviewers</title>
    <link rel="stylesheet" href="/lightfair.css" />
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

{#if !post.code || post.code.length === 0}
    {#if $user && $user.id === post.user.id}
        <p>
            You've not added any code yet.
            <a href="/posts/{post.id}/edit">Add some</a>
        </p>
    {:else}
        <p>
            Looks like the author of this post has not added any code to this
            post. Ask them to add some, or come back later
        </p>
    {/if}
{:else}
    {#each post.code as c}
        <div
            class="card mt-3 card-action code"
            id="code-{c.id}"
            role="link"
            on:click={() => (window.location.href = '/code/' + c.id)}>
            <div class="card-header d-flex align-items-center">
                <span><strong>{c.filename}</strong></span>
                <small
                    class="text-muted ms-3">{c.language.toUpperCase()}</small>
                <div class="ms-auto text-muted">
                    {new Date(post.created_at).toDateString()}
                    ({new Date(Date.now() - new Date(post.created_at).getTime()).getDate()}
                    day{new Date(Date.now() - new Date(post.created_at).getTime()).getDate() === 1 ? '' : 's'}
                    ago)
                </div>
            </div>
            <div class="card-body">
                <Loading />
            </div>
        </div>
    {/each}
{/if}

<hr />

<h3 id="reviews">Reviews</h3>
