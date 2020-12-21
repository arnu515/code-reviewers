<script lang="ts" context="module">
    export async function preload({ params: { slug } }, { apiUrl }) {
        try {
            const { data } = await axios.get<
                Resp<{ user: User; posts: Post[] }>
            >(apiUrl + "/api/users/" + slug + "/posts");
            if (data.success) {
                return { user: data.data.user, posts: data.data.posts };
            }
        } catch (e) {
            if (e?.response?.status === 404) this.error(404, "User not found");
            else alert(handleAxiosError(e));
        }
    }
</script>

<script lang="ts">
    import { handleAxiosError } from "../util";
    import type { Post, Resp, User } from "../util/types";
    import axios from "axios";
    import Loading from "../components/Loading.svelte";
    import Posts from "../components/Posts.svelte";

    export let user: User;
    export let posts: Post[];
</script>

<svelte:head>
    <title>
        {user ? `@${user.username}'s posts - CodeReviewers.gq` : 'Loading'}
    </title>
</svelte:head>

{#if user}
    <h1 class="display-5 text-center">{user.username}'s posts</h1>
    {#if posts && posts.length > 0}
        <Posts {posts} />
    {:else}
        <p class="text-center">{user.username} hasn't made a post yet!</p>
    {/if}
{:else}
    <Loading message="Loading" />
{/if}
