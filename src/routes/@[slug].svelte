<script lang="ts" context="module">
    export async function preload(
        { params: { slug } },
        { apiUrl, accessToken }
    ) {
        try {
            const { data } = await axios.get<
                Resp<{ user: User; posts: Post[] }>
            >(apiUrl + "/api/users/" + slug + "/posts");
            if (data.success) {
                return {
                    user: data.data.user,
                    posts: data.data.posts,
                    apiUrl,
                    accessToken,
                };
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
    import { onMount } from "svelte";
    import { user as userStore } from "../util/stores";

    export let user: User;
    export let posts: Post[];
    export let apiUrl: string;
    export let accessToken: string;

    let privatePosts: Post[] | null = null;

    async function getPrivatePosts() {
        try {
            const { data } = await axios.get<Resp<{ posts: Post[] }>>(
                apiUrl + "/api/posts/private",
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            if (data.success) {
                privatePosts = data.data.posts;
            }
        } catch (e) {
            if ([401, 403, 422].includes(e?.response?.status))
                window.location.href = "/login";
            else alert(handleAxiosError(e));
        }
    }

    onMount(() => {
        if ($userStore) getPrivatePosts();
    });
</script>

<svelte:head>
    <title>
        {user ? `@${user.username}'s posts - CodeReviewers.gq` : 'Loading'}
    </title>
</svelte:head>

{#if user}
    <h1 class="display-5 text-center">{user.username}'s posts</h1>
    {#if $userStore}
        <h3 class="text-center">Private posts</h3>
        {#if privatePosts === null}
            <Loading />
        {:else if privatePosts.length === 0}
            <p class="text-center">You haven't made a private post yet!</p>
        {:else}
            <Posts posts={privatePosts} />
        {/if}
    {/if}
    {#if posts && posts.length > 0}
        {#if $userStore}
            <h3 class="text-center">Public posts</h3>
        {/if}
        <Posts {posts} />
    {:else}
        <p class="text-center">
            {$userStore ? "You haven't" : `${user.username} hasn't`}
            made a post yet!
        </p>
    {/if}
{:else}
    <Loading message="Loading" />
{/if}
