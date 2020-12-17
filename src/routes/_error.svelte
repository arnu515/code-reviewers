<script lang="ts">
    export let status: number;
    export let error: Error;

    const dev = process.env.NODE_ENV === "development";
</script>

<svelte:head>
    <title>An error occured - {status}</title>
</svelte:head>

<h1 class="display-3 text-center">{status}</h1>

<p class="text-center lead">{error.message}</p>

{#if dev && error.stack}
    <pre>{error.stack}</pre>
{/if}
