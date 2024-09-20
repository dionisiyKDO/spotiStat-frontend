<script>
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';
</script>


<div class="container app">
	<Header />

	<main>
		<slot />
	</main>

	<Footer />
</div>


<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		padding: 1rem;
	}
</style>