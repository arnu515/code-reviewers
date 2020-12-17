<script lang="ts">
    import axios from "axios";
    import { fade } from "svelte/transition";
    import { handleAxiosError } from "../util";
    import { onMount } from "svelte";
    import { user } from "../util/stores";
    import { goto, stores } from "@sapper/app";
    import type { Resp, User } from "../util/types";

    const { session } = stores();

    let emailError: string | null = null;
    let passwordError: string | null = null;
    let error: string | null = null;

    let email: string, password: string;

    onMount(() => {
        if ($user) goto("/");
    });

    function login() {
        if (!email) emailError = "Enter your email!";
        else emailError = null;
        if (!password) passwordError = "Enter your password!";
        else passwordError = null;

        if (emailError || passwordError) return;
        error = null;

        axios
            .post<Resp<{ token: string; user: User }>>("/api/login", {
                email,
                password,
            })
            .then((r) => {
                if (r.status === 200) {
                    $session.accessToken = r.data.data.token;
                    user.set(r.data.data.user);
                    goto("/");
                } else {
                    error = r.data.message;
                }
            })
            .catch((e) => {
                error = handleAxiosError(e);
            });
    }
</script>

<style>
    .form-control.error {
        border: 1px red solid;
    }
    small.error {
        color: red;
    }
</style>

<svelte:head>
    <title>Login - CodeReviewers</title>
</svelte:head>
<h1 class="display-5 text-center m-5">Login</h1>

<form
    on:submit|preventDefault={login}
    style="margin: 1rem auto; width: 100%; max-width: 400px">
    {#if error}
        <div class="alert alert-danger">{error}</div>
    {/if}
    <p>
        <label for="email">Email</label>
        <input
            type="email"
            bind:value={email}
            id="email"
            class="form-control"
            class:error={!!emailError} />
        {#if emailError}
            <small
                transition:fade={{ duration: 150 }}
                class="error">{emailError}</small>
        {/if}
    </p>
    <p>
        <label for="password">Password</label>
        <input
            type="password"
            bind:value={password}
            id="password"
            class="form-control"
            class:error={!!passwordError} />
        {#if passwordError}
            <small
                transition:fade={{ duration: 150 }}
                class="error">{passwordError}</small>
        {/if}
    </p>
    <p class="text-center">
        <button class="btn btn-success btn-lg w-100">Login</button>
        <small class="text-muted">or <a href="/register">register</a></small>
    </p>
</form>
