<script context="module">
    export function preload({ query: { next } }) {
        return { next };
    }
</script>

<script lang="ts">
    import { stores, goto } from "@sapper/app";
    import { onMount } from "svelte";
    import { user } from "../../util/stores";
    import axios from "axios";
    import type { Code, Resp } from "../../util/types";

    export let next: string;

    const { session } = stores();
    const { apiUrl, accessToken } = $session;

    let name: string, lang: string, files: FileList, error: string;

    onMount(() => {
        if (!$user) goto("/login");
    });

    function submit() {
        if (!lang || !files || files.length === 0) {
            error = "Fill out all fields!";
            return;
        }
        error = "";

        if (files[0].size > 1024 * 1024 * 2) {
            error = "File too large! Please select files under 2MB";
            return;
        }

        let fd = new FormData();

        fd.append("filename", name.trim());
        fd.append("language", lang.trim().toLowerCase());
        fd.append("file", files[0]);

        axios
            .post<Resp<{ code: Code }>>(apiUrl + "/api/code/fromfile", fd, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + accessToken,
                },
            })
            .then(({ data }) => {
                if (data.success) goto(next || "/code/" + data.data.code.id);
            })
            .catch((e) => {
                if ([401, 403, 422].includes(e?.response?.status))
                    goto("/logout");
            });
    }
</script>

<svelte:head>
    <title>Write Code - CodeReviewers</title>
</svelte:head>

<h1 class="display-5 text-center">Write Code</h1>
<p class="lead text-center">Write code to use in posts and reviews</p>

<form on:submit|preventDefault={submit}>
    {#if error}
        <div class="alert alert-danger">{error}</div>
    {/if}
    <p>
        <label for="name">Filename (Optional)</label>
        <input type="text" id="name" class="form-control" bind:value={name} />
    </p>
    <p>
        <label for="language">Valid language</label>
        <input
            type="text"
            id="language"
            class="form-control"
            bind:value={lang} />
        <small class="text-muted">The language of your code. Leave blank for
            plaintext</small>
    </p>
    <p>
        <label for="file">Upload code</label>
        <input type="file" id="file" class="form-control" bind:files />
        <small class="text-muted">Please only send files with UTF-8 encoding!</small>
    </p>
    <p><button type="submit" class="btn btn-success">Submit</button></p>
</form>
