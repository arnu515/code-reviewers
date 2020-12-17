<script lang="ts">
    export let message = "";
</script>

<style>
    .loader {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .spinner {
        width: 128px;
        height: 128px;
        border: 3px #eee solid;
        border-top: 7px #aaa solid;
        border-radius: 50%;
        animation: spin 500ms ease infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>

<div class="loader m-5">
    <div class="spinner" />
    {#if message}
        <p>{message}</p>
    {/if}
</div>
