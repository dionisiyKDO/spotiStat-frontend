<script>
    import { onMount } from "svelte";

    let loggedIn = false;

    // Fetch session status from Flask API
    async function checkLoginStatus() {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        loggedIn = data.logged_in;
    }

    onMount(() => {
        checkLoginStatus();
    });
</script>


<header class="container">
    <nav>
        <ul>
            <li><a href="/"><strong>SpotiStat</strong></a></li>
        </ul>
        <ul>
            {#if loggedIn}
                <li><a href="/api/auth/logout">Logout</a></li>
            {:else}
                <li><a href="/api/auth/login">Login with Spotify</a></li>
            {/if}
        </ul>
    </nav>
</header>


<style>
    header {
        padding: 1rem 1rem 0.5rem 1rem;
        margin-bottom: 1.7rem;
        border-bottom: 1px solid #9c9c9c;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        gap: 1rem;
    }

    nav {
        width: 100%;
        display: flex;
        justify-content:space-between;
        align-items: center;
    }
</style>