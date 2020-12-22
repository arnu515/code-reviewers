<script>
    import { user } from "../util/stores";
</script>

<svelte:head>
    <title>CodeReviewers - Review code!</title>
</svelte:head>

<div class="p-3 p-lg-5 bg-dark text-light text-center rounded">
    <h1 class="display-4" style="font-weight: bolder">CodeReviewers</h1>
    <p class="lead">Write code that others will review</p>
    {#if !$user}
        <p>
            <a href="/register" class="btn btn-light">Get Started</a>
            <a href="/posts" class="btn btn-outline-light">View posts</a>
        </p>
    {:else}
        <p>
            <a href="/new" class="btn btn-light">Create new post</a>
            <a href="/posts" class="btn btn-outline-light">Review others' code</a>
        </p>
    {/if}
</div>

<div class="mt-2">
    <h4 class="text-center">FEATURES</h4>
    <div class="row row-cols-1 row-cols-md-2 gx-3">
        <div class="col card">
            <div class="card-body">
                <h3 class="card-title">In-browser editing</h3>
                <p class="card-text">
                    Edit your wonderful code in your browser, whether it be
                    Chrome, Firefox, Brave, Edge or Internet Explorer (maybe not
                    the last one, but we'll see :P)
                </p>
            </div>
        </div>
        <div class="col card">
            <div class="card-body">
                <h3 class="card-title">Import code</h3>
                <p class="card-text">
                    If you don't fancy coding in your browser, you can import
                    code from your computer, or anywhere from the Internet!
                </p>
            </div>
        </div>
        <div class="col card">
            <div class="card-body">
                <h3 class="card-title">Rate code</h3>
                <p class="card-text">
                    Allow other users to rate your code, or allow specific ones
                    by sharing links!
                </p>
            </div>
        </div>
        <div class="col card">
            <div class="card-body">
                <h3 class="card-title">Pair programming</h3>
                <p class="card-text">
                    Code with your friends, colleagues, workers, bosses, and
                    even random strangers on the internet. Once someone's left a
                    review on your code, you can then sit and program with them!
                </p>
            </div>
        </div>
    </div>
</div>
