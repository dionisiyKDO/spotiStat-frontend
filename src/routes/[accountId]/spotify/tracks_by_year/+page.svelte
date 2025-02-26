<script lang="ts">
    import { onMount } from "svelte";
    import D3Chart from "./D3Chart.svelte";
    import SearchTrack from "./SearchTrack.svelte";
    import { fetchTracksByYear } from "./load";

    let year = $state(1976);

    let tracksByYearReq = $derived(fetchTracksByYear());
</script>

<div>
    <h2 class="text-3xl font-semibold mb-2 inline-block">Tracks by year</h2>

    <!-- Question mark with hover effect -->
    <div class="relative inline-block group">
        <i
            class="question-mark fa fa-question-circle ml-2 text-(--primary-text) hover:text-(--primary-hover) transition duration-100 ease-in-out"
        ></i>

        <!-- Popup content on hover -->
        <div
            class="popup-content hidden absolute left-0 mt-2 w-72 p-3 rounded-lg bg-(--surface) border border-(--border) z-10"
        >
            <p>
                This line chart shows the number of tracks in your saves
                released in each year, showing your preferences by time range.
            </p>
            <p class="mt-2 opacity-50">
                you can click on chart for selecting a year to search
            </p>
        </div>
    </div>
</div>

{#await tracksByYearReq}
    <p class="loading">Loading...</p>
{:then tracksByYear}
    <D3Chart bind:year {tracksByYear} />
{/await}

<SearchTrack bind:year />

<style>
    .question-mark:hover + .popup-content {
        display: block;
    }
</style>
