<script lang="ts" context="module">
    import axios from "axios";
    import type { Code, Resp } from "../../util/types";

    export async function preload({ params: { slug } }, { apiUrl }) {
        try {
            const { data } = await axios.get<
                Resp<{ code: Code; content: string }>
            >(apiUrl + "/api/code/" + slug);
            return { code: data.data.code, content: data.data.content, apiUrl };
        } catch (e) {
            if (e?.response?.status === 404) this.error(404, "Code not found");
        }
    }
</script>

<script lang="ts">
    import Loading from "../../components/Loading.svelte";
    import hljs from "highlight.js";
    import { onMount } from "svelte";

    export let code: Code;
    export let content: string;

    onMount(() => {
        document.querySelector("#code").innerHTML =
            '<pre><code class="language-' +
            code.language +
            '">' +
            content +
            "</code></pre>";
        hljs.highlightBlock(document.querySelector("#code pre code"));
    });
</script>

<svelte:head>
    <title>{code.filename} - CodeReviewers</title>
    <link rel="stylesheet" href="/lightfair.css" />
</svelte:head>

<h1 class="text-center display-5">Code</h1>

<div class="card">
    <div class="card-header d-flex" style="align-items: center">
        <span>{code.filename} by {code.user.username}</span>
        <a class="btn ms-auto" href="/code/{code.id}/raw">view raw</a>
    </div>
    <div class="card-body">
        <div id="code">
            <Loading />
        </div>
    </div>
</div>
