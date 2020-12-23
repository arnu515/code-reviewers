<script lang="ts">
    import axios from "axios";
    import { goto, stores } from "@sapper/app";
    import { onMount } from "svelte";
    import { user } from "../util/stores";
    import type { Resp, Post } from "../util/types";
    import { handleAxiosError } from "../util";

    const { session } = stores();
    const { apiUrl, accessToken } = $session;

    onMount(() => {
        if (!$user) goto("/login");
    });

    let title: string,
        desc: string,
        sug: boolean = true,
        error: string,
        loading = false;

    function submit() {
        if (!title) {
            error = "Enter a title";
            return;
        }

        error = "";
        loading = true;

        axios
            .post<Resp<{ post: Post }>>(
                apiUrl + "/api/posts",
                {
                    title,
                    description: desc,
                    suggestions: sug || false,
                },
                {
                    headers: { Authorization: "Bearer " + accessToken },
                }
            )
            .then(({ data }) => {
                loading = false;
                if (data.success) goto("/posts/" + data.data.post.id + "/edit");
            })
            .catch((e) => {
                loading = false;
                if ([401, 422, 403].includes(e?.response?.status)) {
                    error = "Session expired";
                    goto("/logout");
                } else error = handleAxiosError(e);
            });
    }
</script>

<svelte:head>
    <title>New Post - CodeReviewers</title>
</svelte:head>

<h1 class="text-center display-5">Create new post</h1>

<form
    style="width: 100%; max-width: 440px; margin: 1rem auto"
    on:submit|preventDefault={submit}>
    {#if error}
        <div class="alert alert-danger">{error}</div>
    {/if}
    <p>
        <label for="title">Title</label>
        <input type="text" id="title" class="form-control" bind:value={title} />
        <small class="text-muted">Give a title to your code</small>
    </p>
    <p>
        <label for="description">Description (Optional)</label>
        <textarea
            id="description"
            rows="6"
            class="form-control"
            bind:value={desc} />
        <small class="text-muted">Say what your code is supposed to do, and
            anything else that is helpful
        </small>
    </p>
    <div class="mt-1">
        Suggestions
        <div class="form-check form-switch">
            <input
                class="form-check-input"
                type="checkbox"
                id="suggestions"
                bind:checked={sug} />
            <label class="form-check-label" for="suggestions">Enable Suggestions</label>
        </div>
        <small class="d-block text-muted">Enable other users to suggest edits to
            your code</small>
    </div>
    {#if error}
        <div class="alert alert-danger">{error}</div>
    {/if}
    <div class="mt-3">
        <button type="submit" class="btn btn-success" disabled={loading}>Create
            post
            {#if loading}<span class="spinner-border spinner-border-sm" />{/if}
        </button>
        <small class="text-muted">You can add your code later</small>
    </div>
</form>
