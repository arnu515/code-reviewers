<script lang="ts" context="module">
    import axios from "axios";
    import { handleAxiosError } from "../../../util";
    import type { Code, Resp } from "../../../util/types";

    export async function preload(
        { params: { slug } },
        { apiUrl, accessToken }
    ) {
        try {
            const { data } = await axios.get<
                Resp<{ code: Code; content: string }>
            >(apiUrl + "/api/code/" + slug);
            try {
                const {
                    data: { success },
                } = await axios.get<Resp<{ code: Code }>>(
                    apiUrl + "/api/code/" + slug + "/author",
                    { headers: { Authorization: "Bearer " + accessToken } }
                );
                if (!success)
                    this.error(403, "You don't have permission to do that");
                else
                    return {
                        code: data.data.code,
                        apiUrl,
                        accessToken,
                        content: data.data.content,
                    };
            } catch (e) {
                if ([401, 403, 422].includes(e?.response?.status))
                    this.error(403, "You don't have permission to do that");
                else
                    this.error(e?.response?.status || 500, handleAxiosError(e));
            }
        } catch (e) {
            if (e?.response?.status === 404) this.error(404, "Code not found");
            else this.error(e?.response?.status || 500, handleAxiosError(e));
        }
    }
</script>

<script lang="ts">
    import Codemirror from "../../../components/Codemirror.svelte";

    export let code: Code;
    export let content: string;
    export let apiUrl: string;
    export let accessToken: string;

    let { filename, language } = code;
    let filenameErr = "",
        langErr = "";
    let filenameLoading = false,
        langLoading = false,
        saveLoading = false;

    async function changeFilename() {
        filenameLoading = true;
        try {
            const { data } = await axios.put<Resp<{ code: Code }>>(
                apiUrl + "/api/code/" + code.id,
                {
                    filename,
                    language,
                    code: content,
                },
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            filenameLoading = false;
            if (data.success) window.location.reload();
        } catch (e) {
            filenameLoading = false;
            if ([401, 403, 422].includes(e?.response?.status))
                window.location.href = "/login";
            else filenameErr = handleAxiosError(e);
        }
    }

    async function changeLanguage() {
        langLoading = true;
        try {
            const { data } = await axios.put<Resp<{ code: Code }>>(
                apiUrl + "/api/code/" + code.id,
                {
                    filename,
                    language,
                    code: content,
                },
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            langLoading = false;
            if (data.success) window.location.reload();
        } catch (e) {
            langLoading = false;
            if ([401, 403, 422].includes(e?.response?.status))
                window.location.href = "/login";
            else langErr = handleAxiosError(e);
        }
    }

    async function save() {
        saveLoading = true;
        try {
            const { data } = await axios.put<Resp<{ code: Code }>>(
                apiUrl + "/api/code/" + code.id,
                {
                    filename,
                    language,
                    code: content,
                },
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            saveLoading = false;
            if (data.success) window.location.reload();
        } catch (e) {
            saveLoading = false;
            if ([401, 403, 422].includes(e?.response?.status))
                window.location.href = "/login";
            else alert(handleAxiosError(e));
        }
    }
</script>

<style>
    .edit-button {
        opacity: 0;
        transition: opacity 300ms ease;
    }

    .edit-button-parent:hover .edit-button {
        opacity: 1;
    }
</style>

<svelte:head>
    <title>Editing code - CodeReviewers.gq</title>
</svelte:head>

<h1 class="display-5 text-center">Edit code</h1>

<div class="card">
    <div class="card-header d-flex align-items-center">
        <div class="d-flex align-items-center">
            <button
                class="btn edit-button-parent"
                data-bs-toggle="modal"
                data-bs-target="#filename-modal">{code.filename}
                <i class="fas fa-pen edit-button" />
            </button>
            <button
                data-bs-toggle="modal"
                data-bs-target="#lang-modal"
                class="btn btn-sm text-muted edit-button-parent">{code.language.toUpperCase()}
                <i class="fas fa-pen edit-button" />
            </button>
        </div>
        <div class="d-flex align-items-center ms-auto">
            <button
                class="btn btn-success"
                on:click={save}
                disabled={saveLoading}>Save
                {#if saveLoading}
                    <span class="spinner-border spinner-border-sm" />
                {/if}</button>
        </div>
    </div>
    <div class="card-body">
        <Codemirror
            defaultValue={content}
            language={code.language}
            lineNumbers={false}
            on:change={(value) => (content = value.detail)} />
    </div>
</div>

<!-- Modals -->
<div
    class="modal fade"
    id="filename-modal"
    tabindex="-1"
    aria-labelledby="filename-title">
    <div class="modal-dialog">
        <form on:submit|preventDefault={changeFilename} class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="filename-title">Change filename</h5>
                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close" />
            </div>
            <div class="modal-body">
                {#if filenameErr}
                    <div class="alert alert-danger">{filenameErr}</div>
                {/if}
                <p>
                    <label for="filename">New filename</label>
                    <input
                        type="text"
                        id="filename"
                        class="form-control"
                        bind:value={filename} />
                </p>
            </div>
            <div class="modal-footer">
                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    data-bs-dismiss="modal">Cancel</button>
                <button
                    type="sumbit"
                    class="btn btn-success"
                    disabled={filenameLoading}>Change
                    {#if filenameLoading}
                        <span class="spinner-border spinner-border-sm" />
                    {/if}</button>
            </div>
        </form>
    </div>
</div>

<div
    class="modal fade"
    id="lang-modal"
    tabindex="-1"
    aria-labelledby="lang-title">
    <div class="modal-dialog">
        <form on:submit|preventDefault={changeLanguage} class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="lang-title">Change language</h5>
                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close" />
            </div>
            <div class="modal-body">
                {#if langErr}
                    <div class="alert alert-danger">{langErr}</div>
                {/if}
                <p>
                    <label for="language">Language</label>
                    <input
                        type="text"
                        id="language"
                        class="form-control"
                        bind:value={language} />
                </p>
            </div>
            <div class="modal-footer">
                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    data-bs-dismiss="modal">Cancel</button>
                <button
                    type="submit"
                    class="btn btn-success"
                    disabled={langLoading}>Change
                    {#if langLoading}
                        <span class="spinner-border spinner-border-sm" />
                    {/if}</button>
            </div>
        </form>
    </div>
</div>
