<script lang="ts">
    import {
        fetchTrackMeta,
        fetchTrackStats,
        fetchTracks,
        type TrackMeta,
        type TrackStats,
        type Tracks,
    } from "./load";
    import D3Chart from "./D3Chart.svelte";

    // 4DMKwE2E2iYDKY01C335Uw carry on
    // 2UZtI2HUyLRzqBjodvcUmY rx medicate
    // 3UhNeRObinbV3mtqPddGux pyrolisis
    let track_id = $state("3UhNeRObinbV3mtqPddGux");
    let searchInput = $state("");
    let filteredTracks: Tracks[] = $state([]);
    let showSuggestions = $state(false);

    let trackStatsReq = $derived(fetchTrackStats(track_id));
    let trackMetaReq = $derived(fetchTrackMeta(track_id));
    let tracksReq = $derived(fetchTracks());

    function filterTracks(tracks: Tracks[]) {
        const inputLower = searchInput.toLowerCase().trim();
        const searchTerms = inputLower.split(/\s+/); // Split by spaces for multi-word search
        const maxResults = 4;

        // Define a helper function to calculate relevance score
        function calculateRelevance(track: Tracks): number {
            let score = 0;

            searchTerms.forEach((term) => {
                if (track.track_name.toLowerCase().includes(term)) score += 5; // Higher score for track name match
                if (track.artist.toLowerCase().includes(term)) score += 3; // Artist name match
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
</script>

<h1 class="text-3xl font-semibold">Track stats</h1>

{#await tracksReq}
    <p>Loading.....</p>
{:then tracks}
    <div class="relative">
        <input
            class="w-96 border p-2"
            type="text"
            placeholder="Search track or artist..."
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
                                track_id = track.spotify_track_uri.replace(
                                    "spotify:track:",
                                    ""
                                );
                                showSuggestions = false;
                                searchInput =
                                    track.track_name + " by " + track.artist;
                            }}
                        >
                            {track.track_name} by {track.artist}
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
{/await}

<!-- Track meta -->
{#await trackMetaReq}
    <p>Loading.....</p>
{:then track_meta}
    <div class="flex flex-row">
        <div class="m-6 mt-2">
            <p>Artists:</p>

            {#if track_meta.artists.length === 0}
                <p>No artists found</p>
            {:else}
                {#each track_meta.artists as artist, index}
                    <p>{index + 1} {artist.name}</p>
                {/each}
            {/if}
        </div>

        <div class="m-6 mt-2">
            <p>Album name: {track_meta.album.name}</p>
            <p>Album release date: {track_meta.album.release_date}</p>
            <p>Track popularity: {track_meta.popularity}</p>
        </div>
    </div>
{/await}

<!-- Chart -->
{#await trackStatsReq}
    <p>Loading.....</p>
{:then track_stats}
    <div>
        {#if track_stats.timeline_data.length > 0}
            <D3Chart timeline_data={track_stats.timeline_data} />
        {/if}

        <p>Total plays: {track_stats.total_plays}</p>
        <p>
            Total time played: {(track_stats.total_ms_played / 3600000).toFixed(
                2
            )} hours
        </p>
        <p>
            First played: {new Date(
                track_stats.first_played
            ).toLocaleDateString()}
        </p>
        <p>
            Last played: {new Date(
                track_stats.last_played
            ).toLocaleDateString()}
        </p>
    </div>
{/await}

<style>
</style>
