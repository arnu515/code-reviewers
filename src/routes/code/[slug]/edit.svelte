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
    import Codemirror from "../../../components/codemirror.svelte";

    export let code: Code;
    export let content: string;
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
            <button class="btn edit-button-parent">{code.filename}
                <i class="fas fa-pen edit-button" />
            </button>
            <button
                class="btn btn-sm text-muted edit-button-parent">{code.language.toUpperCase()}
                <i class="fas fa-pen edit-button" />
            </button>
        </div>
    </div>
    <div class="card-body">
        <Codemirror defaultValue={content} language={code.language} />
    </div>
</div>
