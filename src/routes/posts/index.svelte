<script lang="ts">
    import axios from "axios";
    import { handleAxiosError } from "../../util";
    import type { Post, Resp } from "../../util/types";
    import { stores } from "@sapper/app";
    import Loading from "../../components/Loading.svelte";
    import Posts from "../../components/Posts.svelte";
    import { user } from "../../util/stores";
    import { onMount } from "svelte";

    const { session } = stores();
    const { apiUrl } = $session;

    let posts: Post[] | null = null;
    let page = 0;
    let isMore = true;

    async function getPosts(page: number): Promise<[Post[], boolean]> {
        try {
            const { data } = await axios.get<Resp<{ posts: Post[] }>>(
                apiUrl + "/api/posts?page=" + page
            );
            if (data.success) {
                if (posts === null) return [data.data.posts, true];
                else return [[...posts, ...data.data.posts], true];
            }
        } catch (e) {
            if (e?.response?.status === 404) return [posts, false];
            else {
                alert(handleAxiosError(e));
                return [posts, false];
            }
        }
    }

    async function loadMorePosts() {
        [posts, isMore] = await getPosts(++page);
    }

    onMount(loadMorePosts);
</script>

<h1 class="display-5 text-center">Posts</h1>

{#if posts === null}
    <Loading />
{:else if posts.length === 0}
    <p class="text-center">
        There are no posts yet.
        <a
            href={$user ? '/new' : '/login'}>{$user ? 'Create one' : 'Login to create one'}</a>
    </p>
{:else}
    <Posts {posts} />
    <p class="text-center mt-2">
        {#if isMore}
            <button class="btn btn-outline-dark" on:click={loadMorePosts}>Load
                more</button>
        {:else}No more posts{/if}
    </p>
{/if}
