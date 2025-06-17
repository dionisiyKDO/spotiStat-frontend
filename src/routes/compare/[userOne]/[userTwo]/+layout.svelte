<script lang="ts">
    import Header from "$lib/Header.svelte";
    import Footer from "$lib/Footer.svelte";

    let { children, data } = $props();
</script>

<div class="min-h-screen flex flex-col">
    <Header username={null}/>

    <main class="flex-1 container max-w-7xl mx-auto p-4">
        {@render children()}
    </main>

    <Footer />
</div>