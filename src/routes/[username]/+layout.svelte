<script lang="ts">
    import Header from "$lib/Header.svelte";
    import Footer from "$lib/Footer.svelte";

    let { children, data } = $props();
    const username = data.username
</script>

<div class="min-h-screen flex flex-col">
    <Header username={username}/>

    <main class="flex-1 container mx-auto p-4">
        {@render children()}
    </main>

    <Footer />
</div>