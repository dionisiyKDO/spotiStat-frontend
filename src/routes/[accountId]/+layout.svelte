<script>
    import Header from "$lib/Header.svelte";
    import Footer from "$lib/Footer.svelte";
    import { checkLoginStatus } from "$lib/auth";

    let { children } = $props();
    let LoginStatusReq = checkLoginStatus();
</script>

{#await LoginStatusReq}
    <div class="flex items-center justify-center">
        <p class="font-bold text-2xl text-center mt-10 mb-4">Loading...</p>
    </div>
{:then data}
    {#if data.logged_in === false}
        <div class="flex flex-col items-center justify-center m-10">
            <p class="font-bold text-red-400 text-2xl text-center mb-4">You are not allowed</p>
            <a class="login-link" href="/api/auth/login">Login with Spotify</a>
        </div>
    {:else}
        <div class="min-h-screen flex flex-col">
            <Header loggedIn={data.logged_in} accountId={data.account_id} />

            <main class="flex-1 container mx-auto p-4">
                {@render children()}
            </main>

            <Footer />
        </div>
    {/if}
{/await}
