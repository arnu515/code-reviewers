<script lang="ts">
    import { user } from "../util/stores";

    export let segment: string;
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <a href="/" class="navbar-brand">CodeReviewers</a>
        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#nav"
            aria-controls="nav"
            aria-expanded="false"
            aria-label="Toggle navigation">
            <span class="navbar-toggler-icon" />
        </button>
        <div class="collapse navbar-collapse" id="nav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a
                        href="/"
                        class="nav-link"
                        class:active={segment === undefined}>Home</a>
                </li>
                <li class="nav-item">
                    <a
                        href="/about"
                        class="nav-link"
                        class:active={segment === 'about'}>About</a>
                </li>
                {#if !$user}
                    <li class="nav-item">
                        <a
                            href="/login"
                            class="nav-link"
                            class:active={segment === 'login'}>Login</a>
                    </li>
                    <li class="nav-item">
                        <a href="/register" class="btn btn-light">Register</a>
                    </li>
                {:else}
                    <li class="nav-item">
                        <a
                            href="/new"
                            class="nav-link"
                            class:active={segment === 'new'}>Post Code</a>
                    </li>
                    <li class="nav-item">
                        <a
                            href="/dashboard"
                            class="btn btn-light">{$user.username}</a>
                    </li>
                {/if}
            </ul>
        </div>
    </div>
</nav>
