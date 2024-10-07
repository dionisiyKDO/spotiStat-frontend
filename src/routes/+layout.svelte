<script>
    import Header from "$lib/Header.svelte";
    import Footer from "$lib/Footer.svelte";
	import "../app.css";
	
    async function checkLoginStatus() {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        return data;
    }

    let LoginStatusReq = checkLoginStatus();
	
	let { children } = $props();
</script>


<div class="container mx-auto flex flex-col">
	{#await LoginStatusReq}
		<p class="loading-login">Loading...</p>
	{:then data}
		<Header loggedIn={data.logged_in} accountId={data.account_id} />

		<main class="flex-1 px-8">
			{#if data.logged_in === false}
				<p style="color: darkred">
					You must be logged in to access this page
				</p>
			{:else}
			{@render children()}
			{/if}
		</main>

		<Footer />
	{/await}
</div>