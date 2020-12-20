<script context="module" lang="ts">
    import axios from "axios";
    import { handleAxiosError } from "../../../util";
    import type { Post, Resp, Code } from "../../../util/types";

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
            else this.error(e?.response?.status || 500, handleAxiosError(e));
        }
    }
</script>

<script lang="ts">
    import { goto } from "@sapper/app";
    import { writable } from "svelte/store";
    import Loading from "../../../components/Loading.svelte";
    import { onMount } from "svelte";
    import { stringify } from "qs";

    export let post: Post;
    export let apiUrl: string;
    export let accessToken: string;

    let { public: pub, suggestions: sug } = post;
    let title = writable(post.title);
    let description = writable(post.description);
    let code: Code[] | null = null;
    let selectedCode: Code[] = [];

    let updateErr: string,
        otherSettingsErr: string,
        delErr: string,
        codeErr: string;
    let updateLoading = false,
        pubLoading = false,
        sugLoading = false,
        delLoading = false;

    async function updatePost() {
        updateLoading = true;

        if (!$title.trim()) updateErr = "Enter a title for the post!";
        else updateErr = "";

        if (!$description.trim())
            updateErr = "Enter a description for the post!";
        else updateErr = "";

        if (updateErr) return;

        try {
            const { data } = await axios.put<Resp<{ post: Post }>>(
                apiUrl + "/api/posts/" + post.id + "/edit",
                { title: $title.trim(), description: $description.trim() },
                {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                    },
                }
            );
            updateLoading = false;
            if (data.success) post = data.data.post;
        } catch (e) {
            updateLoading = false;
            if ([403, 401, 422].includes(e?.response?.status)) goto("/logout");
            else updateErr = handleAxiosError(e);
        }
    }

    async function togglePub() {
        pubLoading = true;
        try {
            const { data } = await axios.patch<Resp<{ post: Post }>>(
                apiUrl + "/api/posts/" + post.id + "/edit/public",
                {
                    public: !pub,
                },
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            pubLoading = false;
            if (data.success) post = data.data.post;
        } catch (e) {
            pubLoading = false;
            if ([403, 401, 422].includes(e?.response?.status)) goto("/logout");
            else updateErr = handleAxiosError(e);
        }
    }

    async function toggleSug() {
        sugLoading = true;
        try {
            const { data } = await axios.patch<Resp<{ post: Post }>>(
                apiUrl + "/api/posts/" + post.id + "/edit/suggestions",
                {
                    suggestions: !sug,
                },
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            sugLoading = false;
            if (data.success) post = data.data.post;
        } catch (e) {
            sugLoading = false;
            if ([403, 401, 422].includes(e?.response?.status)) goto("/logout");
            else updateErr = handleAxiosError(e);
        }
    }

    async function deletePost() {
        delLoading = true;
        try {
            const {
                data: { success },
            } = await axios.delete<Resp<{ post: Post }>>(
                apiUrl + "/api/posts/" + post.id,
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            if (success) goto("/posts");
        } catch (e) {
            delLoading = false;
            if ([403, 401, 422].includes(e?.response?.status)) goto("/logout");
            else delErr = handleAxiosError(e);
        }
    }

    async function fetchCode() {
        try {
            const { data } = await axios.get<Resp<{ code: Code[] }>>(
                apiUrl + "/api/code",
                {
                    headers: { Authorization: "Bearer " + accessToken },
                }
            );
            if (data.success) code = data.data.code;
        } catch (e) {
            if ([403, 401, 422].includes(e?.response?.status)) goto("/logout");
            else codeErr = handleAxiosError(e);
        }
    }

    $: {
        $title = post.title;
        $description = post.description;
        pub = post.public;
        sug = post.suggestions;
    }

    onMount(() => {
        document.addEventListener("shown.bs.modal", fetchCode);
    });
</script>

<style>
    .list-group-item.active #lang.text-muted {
        color: white !important;
    }
</style>

<svelte:head>
    <title>Edit post - CodeReviewers</title>
</svelte:head>
<h1 class="display-5 text-center">Edit your post</h1>

<h3 class="text-center">Code</h3>

{#if selectedCode}
    {#each selectedCode as c}
        <div class="accordion mb-2" id="accordion-{c.id.toString()}">
            <div class="accordion-item">
                <h2 class="accordion-header" id="{c.id.toString()}-heading">
                    <button
                        class="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#accordion-body-{c.id.toString()}"
                        aria-expanded="true"
                        aria-controls={c.id.toString()}>
                        {c.filename}
                    </button>
                </h2>
                <div
                    id="accordion-body-{c.id.toString()}"
                    class="accordion-collapse collapse"
                    aria-labelledby="{c.id.toString()}-heading"
                    data-bs-parent="#accordion-{c.id.toString()}">
                    <div class="accordion-body">
                        <div
                            class="d-flex w-100 justify-content-between align-items-center">
                            <span>Language: {c.language.toUpperCase()}</span>
                            <small
                                class="text-muted">{new Date(c.created_at).toDateString()}</small>
                            <button
                                class="btn btn-danger"
                                on:click={() => (selectedCode = selectedCode.filter((x) => x.id !== c.id))}>Remove</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/each}
{/if}

<p class="text-center">
    <button
        class="btn-outline-dark btn-lg"
        data-bs-toggle="modal"
        data-bs-target="#add-code-modal">{selectedCode?.length === 0 ? 'Add' : 'Add/Remove'}
        code</button>
</p>

<h3 class="text-center">Metadata</h3>
<form on:submit|preventDefault={updatePost}>
    {#if updateErr}
        <div class="alert alert-danger">{updateErr}</div>
    {/if}
    <p>
        <label for="title">Title</label>
        <input
            type="text"
            id="title"
            class="form-control"
            bind:value={$title} />
    </p>
    <p>
        <label for="desc">Description</label>
        <textarea
            id="desc"
            rows="3"
            class="form-control"
            bind:value={$description} />
    </p>
    <p>
        <button
            type="submit"
            disabled={updateLoading}
            class="btn btn-success">Update
            {#if updateLoading}
                <span class="spinner-border spinner-border-sm" />
            {/if}
        </button>
        <button
            type="reset"
            on:click|preventDefault={() => {
                $title = post.title;
                $description = post.description;
            }}
            class="btn btn-outline-dark">Reset
        </button>
    </p>
</form>

<h3 class="text-center">Other settings</h3>

{#if otherSettingsErr}
    <div class="alert alert-danger">{otherSettingsErr}</div>
{/if}
<p class="text-center">
    <button
        class="btn btn-{pub ? 'success' : 'warning'} mr-2 btn-lg"
        disabled={pubLoading}
        on:click={togglePub}>Public
        {#if pubLoading}
            <span class="spinner-border spinner-border-sm" />
        {:else}{pub ? 'ON' : 'OFF'}{/if}
    </button>
    <button
        class="btn btn-{sug ? 'success' : 'warning'} mr-2 btn-lg"
        disabled={sugLoading}
        on:click={toggleSug}>Suggestions
        {#if sugLoading}
            <span class="spinner-border spinner-border-sm" />
        {:else}{sug ? 'ON' : 'OFF'}{/if}
    </button>
</p>

<h3 class="text-center">Danger zone</h3>
{#if delErr}
    <div class="alert alert-danger">{updateErr}</div>
{/if}
<p class="text-center">
    <button
        class="btn btn-danger btn-lg"
        on:click={deletePost}
        disabled={delLoading}>Delete post
        {#if delLoading}<span class="spinner-border spinner-border-sm" />{/if}
    </button>
</p>

<!-- Add code modal -->
<div
    class="modal fade"
    id="add-code-modal"
    tabindex="-1"
    aria-labelledby="title">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="title">Add code</h5>
                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close" />
            </div>
            <div class="modal-body">
                {#if codeErr}
                    <div class="alert alert-danger">{codeErr}</div>
                {/if}
                {#if !code}
                    <Loading message="Fetching your code" />
                {:else}
                    <div class="list-group">
                        {#each code as c}
                            <div
                                id={c.id.toString()}
                                style="cursor: pointer"
                                class="list-group-item list-group-item-action {selectedCode.find((x) => x.id === c.id) ? 'active' : ''}"
                                on:click={() => {
                                    if (selectedCode.find((x) => x.id === c.id)) {
                                        selectedCode = selectedCode.filter((x) => x.id !== c.id);
                                    } else {
                                        selectedCode = [...selectedCode, c];
                                    }
                                }}>
                                <div
                                    class="d-flex w-100 justify-content-between">
                                    <strong>{c.filename}</strong>
                                    <small
                                        id="lang"
                                        class="text-muted">{c.language.toUpperCase()}</small>
                                </div>
                            </div>
                        {/each}
                    </div>
                    <div class="mt-5">
                        <button
                            href="/code"
                            data-bs-dismiss="modal"
                            on:click={() => goto('/code?' + stringify({
                                            next: '/posts/' + post.id + '/edit',
                                        }))}
                            class="btn btn-outline-dark mt-2">Upload code</button>
                    </div>
                {/if}
            </div>
            <div class="modal-footer">
                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    on:click={() => (selectedCode = [])}
                    data-bs-dismiss="modal">Clear items</button>
                <button
                    type="button"
                    class="btn btn-success"
                    data-bs-dismiss="modal">Add</button>
            </div>
        </div>
    </div>
</div>
