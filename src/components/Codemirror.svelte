<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import Loading from "./Loading.svelte";

    export let language = "";
    export let defaultValue = "";
    export let lineNumbers = true;

    const d = createEventDispatcher();
    let _CodeMirror: any;
    let editor: any;

    const modes = {
        svelte: { name: "handlebars", base: "text/html" },
        md: { name: "markdown" },
    };

    const tabLang = ["python", "html"];

    async function createCodeMirror(lang: string, value: string) {
        if (!_CodeMirror) return;
        if (editor) editor.toTextArea();

        const codeMirrorOptions = {
            lineNumbers,
            lineWrapping: true,
            value,
            tabSize: tabLang.includes(lang) ? 4 : 2,
            indentWithTabs: tabLang.includes(lang),
            autoCloseBrackets: true,
            autoCloseTags: true,
            theme: "eclipse",
            mode: modes[lang] || { name: lang },
        };

        editor = _CodeMirror.fromTextArea(
            document.getElementById("editor"),
            codeMirrorOptions
        );

        editor.on("change", (e: any) => {
            d("change", e.getValue());
        });

        await new Promise((resolve) => setTimeout(resolve, 100));
        editor.refresh();

        editor.setValue(value);
    }

    onMount(async () => {
        const CodeMirror = await import("./codemirror-loader");
        _CodeMirror = CodeMirror.default;

        await createCodeMirror(language, defaultValue);
    });
</script>

<style>
    :global(.CodeMirror) {
        font-size: 20px;
    }
</style>

<div>
    <!-- svelte-ignore a11y-positive-tabindex -->
    <textarea
        id="editor"
        readonly={true}
        tabindex="2"
        style="visibility: hidden" />
    {#if !_CodeMirror}
        <Loading />
    {/if}
</div>
