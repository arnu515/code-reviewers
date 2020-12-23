<script lang="ts" context="module">
    export function preload(_, { apiUrl, accessToken }) {
        return { apiUrl, accessToken };
    }
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import { handleAxiosError } from "../util";
    import { user } from "../util/stores";
    import axios from "axios";
    import type { Resp, User } from "../util/types";

    export let apiUrl: string;
    export let accessToken: string;

    onMount(() => {
        if (!$user) window.location.href = "/login";
    });

    let email = $user?.email,
        username = $user?.username,
        profileErr = "";

    let oldPassword = "",
        newPassword = "",
        confirmPassword = "",
        passwordErr = "";

    let password = "",
        deleteErr = "";

    let profileLoading = false,
        passwordLoading = false,
        deleteLoading = false;

    async function updateProfile() {
        if (!email || !username) {
            profileErr = "Fill out all fields!";
            return;
        }

        profileErr = "";
        profileLoading = true;

        try {
            const { data } = await axios.put<Resp<{ user: User }>>(
                apiUrl + "/api/user/profile",
                {
                    email,
                    username,
                },
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            profileLoading = false;
            if (data.success) window.location.reload();
        } catch (e) {
            profileLoading = false;
            if ([401, 403, 422].includes(e?.response?.status))
                window.location.href = "/logout";
            else profileErr = handleAxiosError(e);
        }
    }

    async function changePassword() {
        passwordLoading = true;
        if (!oldPassword || !newPassword || !confirmPassword) {
            passwordErr = "Fill out all fields!";
            return;
        }

        if (newPassword !== confirmPassword) {
            passwordErr = "Passwords don't match";
            return;
        }

        passwordErr = "";
        passwordLoading = true;

        try {
            const { data } = await axios.patch<Resp<{ user: User }>>(
                apiUrl + "/api/user/password",
                {
                    password: oldPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                },
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            passwordLoading = false;
            if (data.success) window.location.href = "/logout";
        } catch (e) {
            passwordLoading = false;
            if ([401, 403, 422].includes(e?.response?.status))
                window.location.href = "/logout";
            else profileErr = handleAxiosError(e);
        }
    }

    async function deleteAccount() {
        deleteLoading = true;
        if (!password) {
            deleteErr = "Enter your password to delete your account";
            return;
        }

        try {
            const { data } = await axios.post(
                apiUrl + "/api/user/delete",
                { password },
                { headers: { Authorization: "Bearer " + accessToken } }
            );
            deleteLoading = false;
            if (data.success) window.location.href = "/logout";
        } catch (e) {
            deleteLoading = false;
            if ([401, 403, 422].includes(e?.response?.status))
                window.location.href = "/logout";
            else deleteErr = handleAxiosError(e);
        }
    }
</script>

<svelte:head>
    <title>Your dashboard - CodeReviewers.gq</title>
</svelte:head>

<h1 class="display-5 text-center">User dashboard</h1>

{#if $user}
    <div class="row">
        <div class="col">
            <a
                href="/@{$user.username}"
                class="btn btn-outline-dark w-100">Posts</a>
        </div>
        <div class="col">
            <a
                href="/dashboard#settings"
                class="btn btn-outline-dark w-100">Settings</a>
        </div>
        <div class="col">
            <a href="/logout" class="btn btn-outline-dark w-100">Logout</a>
        </div>
    </div>
{/if}

<h3 id="settings" class="mt-2">Settings</h3>

<h4>Profile</h4>

<form on:submit|preventDefault={updateProfile}>
    {#if profileErr}
        <div class="alert alert-danger">{profileErr}</div>
    {/if}
    <p>
        <label for="username">Username</label>
        <input
            type="text"
            id="username"
            class="form-control"
            bind:value={username} />
    </p>
    <p>
        <label for="email">Email</label>
        <input
            type="email"
            id="email"
            class="form-control"
            bind:value={email} />
    </p>
    <p>
        <button
            class="btn btn-success"
            type="submit"
            disabled={profileLoading}>Submit
            {#if profileLoading}
                <span class="spinner-border spinner-border-sm" />
            {/if}
        </button>
        <button
            type="reset"
            class="btn btn-outline-secondary"
            on:click|preventDefault={() => {
                email = $user.email;
                username = $user.username;
            }}>Reset</button>
    </p>
</form>

<h4>Password</h4>
<form on:submit|preventDefault={changePassword}>
    {#if passwordErr}
        <div class="alert alert-danger">{passwordErr}</div>
    {/if}
    <p>
        <label for="old-password">Old password</label>
        <input
            type="password"
            bind:value={oldPassword}
            id="old-password"
            class="form-control" />
    </p>
    <p>
        <label for="new-password">New password</label>
        <input
            type="password"
            bind:value={newPassword}
            id="new-password"
            class="form-control" />
    </p>
    <p>
        <label for="confirm-password">Confirm password</label>
        <input
            type="password"
            bind:value={confirmPassword}
            id="confirm-password"
            class="form-control" />
    </p>
    <p>
        <button
            class="btn btn-success"
            type="submit"
            disabled={passwordLoading}>Change
            {#if passwordLoading}
                <span class="spinner-border spinner-border-sm" />
            {/if}</button>
    </p>
</form>

<h4 class="text-danger">Danger zone</h4>

<div
    class="border border-danger text-danger w-100 d-flex align-items-center py-2 px-3 rounded">
    <strong>Delete account</strong>
    <button
        class="btn btn-outline-danger ms-auto"
        data-bs-toggle="modal"
        data-bs-target="#delete-account-modal">
        Delete
    </button>
</div>

<!-- Delete account modal -->
<div class="modal fade" id="delete-account-modal" aria-labelledby="title">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="title">Delete account</h5>
                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close" />
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete your account?</p>
                <form on:submit|preventDefault={deleteAccount}>
                    {#if deleteErr}
                        <div class="alert alert-danger">{deleteErr}</div>
                    {/if}
                    <p>
                        <label for="d-password">Password</label>
                        <input
                            type="password"
                            bind:value={password}
                            id="d-password"
                            class="form-control" />
                    </p>
                    <p>
                        <button
                            class="btn btn-danger mt-2 w-100"
                            type="submit"
                            disabled={deleteLoading}>Delete account
                            {#if deleteLoading}
                                <span
                                    class="spinner-border spinner-border-sm" />
                            {/if}</button>
                    </p>
                </form>
            </div>
        </div>
    </div>
</div>
