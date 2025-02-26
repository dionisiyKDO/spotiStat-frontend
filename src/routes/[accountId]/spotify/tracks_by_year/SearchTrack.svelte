<script lang="ts">
    import TrackList from "$lib/TrackList.svelte";
    import { fetchSavedTracks } from "./load";

    let { year = $bindable() }: { year: number; } = $props();
    let tempYear = $state(year);

    let tracksReq = $derived(fetchSavedTracks(year));
</script>


<div class="flex gap-2 mt-8 mb-2">
    <h2 class="text-3xl font-semibold mb-0 inline-block">Tracks from:</h2>
    <input
        class="w-24 text-center text-2xl font-semibold"
        type="text"
        name="year"
        id="year"
        bind:value={tempYear}
        onblur={() => year = tempYear}
    />
</div>

{#await tracksReq}
    <p class="loading">Loading...</p>
{:then tracks}
    <div class="mt-4">
        <TrackList {tracks} />
    </div>
{/await}
