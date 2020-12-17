<script lang="ts">
    import { onMount } from "svelte";
    import axios from "axios";
    import { user } from "../util/stores";
    import { goto, stores } from "@sapper/app";

    const { session } = stores();

    function done() {
        setTimeout(() => {
            user.set(null);
            goto("/");
        }, 1000);
    }

    onMount(() => {
        axios
            .delete("/api/login")
            .then((r) => {
                if (r.status === 200) $session.accessToken = null;
                done();
            })
            .catch(done);
    });
</script>

<svelte:head>
    <title>Logout - CodeReviewers</title>
</svelte:head>

<h1 class="display-4 text-center m-5">Logging you out...</h1>
