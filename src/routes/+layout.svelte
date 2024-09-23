<script>
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';
	import "../app.css";
</script>


<div class="container mx-auto flex flex-col">
	<Header />

	<main class="flex-1 px-4 ">
		<slot />
	</main>
	
	<Footer />
</div>
