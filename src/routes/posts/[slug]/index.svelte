<script lang="ts" context="module">
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
            return { post: data.data.post, apiUrl, accessToken };
        } catch (e) {
            if (e?.response?.status === 404) this.error(404, "Post not found");
        }
    }
</script>

<script lang="ts">
    import { user } from "../../../util/stores";
    import { onMount, tick } from "svelte";
    import Loading from "../../../components/Loading.svelte";
    import type { Code, Review, Suggestion } from "../../../util/types";
    import { handleAxiosError } from "../../../util";
    import hljs from "highlight.js";
    import { fade } from "svelte/transition";
    import { stringify } from "qs";

    export let post: Post;
    export let apiUrl: string;
    export let accessToken: string;

    // false = reviews, true = suggestions
    let reviewsSuggestions = false;

    let reviewTitle: string = "",
        reviewContent: string = "",
        reviewStars = 0,
        reviewError: string = "";

    let sugTitle: string = "",
        sugContent: string = "",
        sugCode: Code,
        sugErr: string = "",
        codeErr: string = "",
        modalActive = false;

    async function getReviews() {
        try {
            const { data } = await axios.get<Resp<{ reviews: Review[] }>>(
                apiUrl + "/api/reviews/" + post.id
            );
            return data.data.reviews;
        } catch (e) {
            console.error(e);
            alert(handleAxiosError(e));
        }
    }

    async function getSuggestions() {
        try {
            const { data } = await axios.get<
                Resp<{ suggestions: Suggestion[] }>
            >(apiUrl + "/api/suggestions/" + post.id);
            return data.data.suggestions;
        } catch (e) {
            console.error(e);
            alert(handleAxiosError(e));
        }
    }

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

    async function addReview() {
        if (!reviewTitle.trim() || !reviewContent.trim() || !reviewStars)
            reviewError = "Fill out all fields!";
        else reviewError = "";

        if (reviewError) return;

        try {
            const { data } = await axios.post<Resp<{ review: Review }>>(
                apiUrl + "/api/reviews/" + post.id,
                {
                    title: reviewTitle.trim(),
                    content: reviewContent.trim(),
                    stars: reviewStars,
                },
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            if (data.success) window.location.reload();
        } catch (e) {
            if ([401, 403, 422].includes(e?.response?.status))
                window.location.href = "/logout";
            else reviewError = handleAxiosError(e);
        }
    }

    async function getCode() {
        try {
            const { data } = await axios.get<Resp<{ code: Code[] }>>(
                apiUrl + "/api/code",
                {
                    headers: { Authorization: "Bearer " + accessToken },
                }
            );
            if (data.success) return data.data.code;
            else return [];
        } catch (e) {
            if ([403, 401, 422].includes(e?.response?.status))
                window.location.href = "/logout";
            else codeErr = handleAxiosError(e);
            return [];
        }
    }

    async function addSuggestion() {
        console.error(!sugContent);
        if (!sugTitle.trim() || !sugContent.trim()) {
            sugErr = "Fill out all fields!";
            return;
        }

        if (!sugCode) {
            sugErr = "Choose your code";
            return;
        }

        sugErr = "";

        try {
            const { data } = await axios.post<Resp<{ suggestion: {} }>>(
                apiUrl + "/api/suggestions/" + post.id,
                {
                    title: sugTitle.trim(),
                    content: sugContent.trim(),
                    code: sugCode.id,
                },
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            if (data.success) window.location.reload();
        } catch (e) {
            if ([403, 401, 422].includes(e?.response?.status))
                window.location.href = "/logout";
            else sugErr = handleAxiosError(e);
        }
    }
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

    .nav-link:hover {
        cursor: pointer;
    }

    .stars-selector {
        display: flex;
        gap: 1ch;
        color: rgb(255, 193, 7);
        color: rgb(255, 193, 7, 0.4);
    }

    .stars-selector i {
        transition: 200ms color ease;
    }

    .stars-selector i:hover {
        color: rgb(255, 193, 7);
        color: rgb(255, 193, 7, 0.8);
        cursor: pointer;
    }

    .stars-selector i.active {
        color: #ffc107;
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
{#if $user?.id === post.user.id}
    <a href="/posts/{post.id}/edit" class="btn btn-outline-dark">Edit post</a>
{/if}
<hr />

<h3>
    Code Uploaded
    <small style="font-size: 16px"><a href="/posts/{post.id}/#reviews">Jump to
            reviews</a></small>
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

<div class="mt-3" id="reviews">
    <ul class="nav nav-tabs">
        <li class="nav-item">
            <a
                class="nav-link"
                href="#reviews"
                class:active={!reviewsSuggestions}
                role="link"
                on:click|preventDefault={() => (reviewsSuggestions = false)}>Reviews</a>
        </li>
        <li class="nav-item">
            <a
                class="nav-link"
                href="#suggestions"
                class:active={reviewsSuggestions}
                role="link"
                on:click|preventDefault={() => (reviewsSuggestions = true)}>Suggestions</a>
        </li>
    </ul>
</div>

{#if !reviewsSuggestions}
    <div class="m-2" in:fade>
        {#if reviewError}
            <div class="alert alert-danger">{reviewError}</div>
        {/if}
        <h3 class="d-flex w-100 align-items-center">
            Reviews
            {#if $user}
                <button
                    class="btn btn-outline-dark ms-auto"
                    data-bs-toggle="collapse"
                    data-bs-target="#new-review">New review</button>
            {/if}
        </h3>
        <div class="collapse" id="new-review">
            <div class="card my-3">
                <div class="card-header">New review</div>
                <div class="card-body">
                    <form on:submit|preventDefault={addReview}>
                        <p>
                            <label for="title">Title</label>
                            <input
                                type="text"
                                class="form-control"
                                bind:value={reviewTitle}
                                id="title" />
                        </p>
                        <div class="mt-1 mb-2">
                            <label for="stars">Stars
                                <span class="ms-2">({reviewStars} / 5)</span>
                            </label>
                            <div class="stars-selector">
                                <i
                                    class="fas fa-star"
                                    class:active={reviewStars > 0}
                                    on:click={() => {
                                        reviewStars = 1;
                                    }} />
                                <i
                                    class="fas fa-star"
                                    class:active={reviewStars > 1}
                                    on:click={() => {
                                        reviewStars = 2;
                                    }} />
                                <i
                                    class="fas fa-star"
                                    class:active={reviewStars > 2}
                                    on:click={() => {
                                        reviewStars = 3;
                                    }} />
                                <i
                                    class="fas fa-star"
                                    class:active={reviewStars > 3}
                                    on:click={() => {
                                        reviewStars = 4;
                                    }} />
                                <i
                                    class="fas fa-star"
                                    class:active={reviewStars > 4}
                                    on:click={() => {
                                        reviewStars = 5;
                                    }} />
                            </div>
                        </div>
                        <p>
                            <label for="content">Review content</label>
                            <textarea
                                id="content"
                                class="form-control"
                                bind:value={reviewContent}
                                rows="4" />
                        </p>
                        <p>
                            <button class="btn btn-success" type="submit">Create
                                review</button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
        {#await getReviews()}
            <Loading message="Loading reviews" />
        {:then reviews}
            {#if reviews && reviews.length > 0}
                {#each reviews as r}
                    <div class="card mt-2">
                        <div class="card-header d-flex align-items-center">
                            @{r.user.username}
                            <span
                                class="ms-auto text-muted">{new Date(r.created_at)}</span>
                        </div>
                        <div class="card-body">
                            <div
                                class="d-flex w-100 align-items-center justify-content-between">
                                <h4>{r.title}</h4>
                                <div>
                                    <span>{@html new Array(5)
                                            .fill(0)
                                            .map((_, y) => {
                                                if (y <= r.stars - 1) return `<i class="fas fa-star text-warning"></i>`;
                                                else return `<i class="far fa-star text-warning"></i>`;
                                            })
                                            .join(' ')}</span>
                                </div>
                            </div>
                            <div class="mt-2">{r.content}</div>
                        </div>
                    </div>
                {/each}
            {:else}
                <p>No reviews yet!</p>
            {/if}
        {/await}
    </div>
{:else}
    <div class="m-2" in:fade>
        <h3 class="d-flex w-100 align-items-center">
            Suggestions
            {#if $user}
                <button
                    class="btn btn-outline-dark ms-auto"
                    data-bs-toggle="collapse"
                    data-bs-target="#new-suggestion">New suggestion</button>
            {/if}
        </h3>
        <div class="collapse" id="new-suggestion">
            <div class="card">
                <div class="card-header">New suggestion</div>
                <div class="card-body">
                    {#if sugErr}
                        <div class="alert alert-danger">{sugErr}</div>
                    {/if}
                    <form on:submit|preventDefault={addSuggestion}>
                        <p>
                            <label for="title">Title</label>
                            <input
                                type="text"
                                class="form-control"
                                id="title"
                                bind:value={sugTitle} />
                        </p>
                        <p>
                            <label for="content">Content</label>
                            <textarea
                                id="content"
                                class="form-control"
                                bind:value={sugContent}
                                rows="4" />
                        </p>
                        <p>
                            Code
                            <button
                                class="btn btn-outline-dark w-100"
                                data-bs-toggle="modal"
                                data-bs-target="#add-code-modal"
                                on:click={() => (modalActive = true)}
                                type="button">{sugCode?.filename || 'Add code'}
                            </button>
                        </p>
                        <p>
                            <button class="btn btn-success" type="submit">Add
                                suggestion</button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
        {#await getSuggestions()}
            <Loading message="Loading reviews" />
        {:then suggestions}
            {#if suggestions && suggestions.length > 0}
                {#each suggestions as s}
                    <div class="card mt-2">
                        <div class="card-header d-flex align-items-center">
                            @{s.user.username}
                            <span
                                class="ms-auto text-muted">{new Date(s.created_at)}</span>
                        </div>
                        <div class="card-body">
                            <h4>{s.title}</h4>
                            <p>{s.content}</p>
                            <div class="mt-2">
                                <a
                                    href="/code/{s.code.id}"
                                    class="btn btn-outline-dark w-100">{s.code.filename}</a>
                            </div>
                        </div>
                    </div>
                {/each}
            {/if}
        {/await}
    </div>
{/if}

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

                {#if modalActive}
                    {#await getCode()}
                        <Loading message="Fetching your code" />
                    {:then code}
                        <div class="list-group">
                            {#each code as c}
                                <div
                                    class="list-group-item list-group-item-action{sugCode?.id === c.id ? ' active disabled' : ''}"
                                    id="code-{c.id}"
                                    on:click={() => (sugCode = c)}
                                    style="cursor: pointer;">
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
                                on:click={() => (window.location.href = '/code?' + stringify(
                                            {
                                                next:
                                                    '/posts/' +
                                                    post.id +
                                                    '/#reviews',
                                            }
                                        ))}
                                class="btn btn-outline-dark mt-2">Upload code</button>
                        </div>
                    {/await}
                {/if}
            </div>
            <div class="modal-footer">
                <button
                    class="btn btn-success"
                    type="button"
                    on:click={() => (modalActive = false)}
                    data-bs-dismiss="modal">Save</button>
            </div>
        </div>
    </div>
</div>
