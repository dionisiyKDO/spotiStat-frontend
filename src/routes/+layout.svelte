<script>
	import "../app.css";
	// export const ssr = false; 
	// `export const ssr` will be ignored — move it to +layout(.server).js/ts instead. See https://kit.svelte.dev/docs/page-options for more information.
	
	let { children } = $props();
</script>


<div class="container mx-auto flex flex-col">
	{@render children()}
</div>
