<script>
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';

    let loggedIn = $state('');

    async function checkLoginStatus() {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        loggedIn = data.logged_in;
    }

    $effect(() => {
        checkLoginStatus();
    });

</script>


<Header />

<main class="flex-1 px-4 ">
    {#if loggedIn === false}
        <p style="color: darkred">You must be logged in to access this page</p>
    {:else}
        <slot />
    {/if}
</main>

<Footer />
