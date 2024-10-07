<script lang="ts">
    import {
        fetchArtistStats,
        fetchPlayedTracks,
        fetchTracks,
        type Tracks,
    } from "./load";
    import D3Chart from "./D3Chart.svelte";
    import TrackList from "$lib/TrackList.svelte";

    let artist = $state("塞壬唱片-MSR");
    let selectedDate = $state("1976-01-01");
    let searchInput = $state("");
    let filteredTracks: Tracks[] = $state([]);
    let showSuggestions = $state(false);

    function filterTracks(tracks: Tracks[]) {
        const inputLower = searchInput.toLowerCase().trim();
        const searchTerms = inputLower.split(/\s+/); // Split by spaces for multi-word search
        const maxResults = 4;

        // Define a helper function to calculate relevance score
        function calculateRelevance(track: Tracks): number {
            let score = 0;

            searchTerms.forEach((term) => {
                if (track.artist.toLowerCase().includes(term)) score += 5; // Artist name match
            });

            return score;
        }

        // Filter and rank tracks by relevance score
        filteredTracks = tracks
            .map((track) => ({
                track, // Keep original track data
                relevance: calculateRelevance(track), // Add relevance score
            }))
            .filter((item) => item.relevance > 0) // Filter out tracks with no relevance
            .sort((a, b) => b.relevance - a.relevance) // Sort by highest relevance first
            .slice(0, maxResults) // Limit to the top 4 results
            .map((item) => item.track); // Return only the tracks
    }

    let artistStatsReq = $derived(fetchArtistStats(artist));
    let playedTracksReq = $derived(
        fetchPlayedTracks(100, selectedDate, artist)
    );
    let tracksReq = $derived(fetchTracks());
</script>

<h1 class="text-3xl font-semibold">Artist stats</h1>

<!-- Input -->
{#await tracksReq}
    <p>Loading.....</p>
{:then tracks}
    <div class="relative my-6">
        <input
            class="w-96 border p-2"
            type="text"
            placeholder="Search artist..."
            bind:value={searchInput}
            onfocus={() => (showSuggestions = true)}
            onblur={() =>
                setTimeout(() => {
                    showSuggestions = false;
                }, 200)}
            oninput={() => filterTracks(tracks)}
        />

        {#if showSuggestions && filteredTracks.length > 0}
            <ul class="absolute bg-black border mt-1 w-96">
                {#each filteredTracks as track}
                    <li class="p-2 cursor-pointer hover:bg-gray-800">
                        <button
                            type="button"
                            class="w-full text-left"
                            onclick={() => {
                                showSuggestions = false;
                                searchInput = track.artist;
                                artist = track.artist;
                            }}
                        >
                            {track.artist}
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
{/await}

{#await artistStatsReq}
    <p>Loading.....</p>
{:then artistStats}
    <div>
        <h1>{artist}</h1>
    </div>

    <div>
        {#if artistStats.timeline_data.length > 0}
            <D3Chart
                selectedDate={(value) => {
                    selectedDate = value;
                }}
                timeline_data={artistStats.timeline_data}
            />
        {/if}

        <p>Total plays: {artistStats.total_plays}</p>
        <p>
            Total time played: {(artistStats.total_ms_played / 3600000).toFixed(
                2
            )} hours
        </p>
        <p>
            First played: {new Date(
                artistStats.first_played
            ).toLocaleDateString()}
        </p>
        <p>
            Last played: {new Date(
                artistStats.last_played
            ).toLocaleDateString()}
        </p>
    </div>
{/await}

{#await playedTracksReq}
    <p>Loading.....</p>
{:then tracks}
    <div class="m-8">
        {#if tracks.length > 0}
            <div class="flex gap-2 mb-2">
                <h2 class="py-1 text-3xl font-semibold">
                    Tracks from: {selectedDate}
                </h2>
            </div>
            <div class="mt-4">
                <TrackList {tracks} />
            </div>
        {/if}
    </div>
{/await}
