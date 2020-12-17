<script context="module" lang="ts">
    import axios from "axios";
    import type { Resp, User } from "../util/types";
    import { user } from "../util/stores";
    export async function preload() {
        try {
            const { data } = await axios.get<
                Resp<{ user: User; token: string }>
            >("/api/login");
            user.set(data.data.user);
        } catch (e) {}
    }
</script>

<script lang="ts">
    import Navbar from "../components/Navbar.svelte";

    export let segment: string;
</script>

<Navbar {segment} />
<main class="container mt-3">
    <slot />
</main>
