<script lang="ts">
    import D3Chart from "$lib/artist/TimelineChart.svelte";
    import {
        fetchArtistStats,
        fetchPlayedTracks,
        fetchTracks,
        type Track,
    } from "./load";

    let artist = $state("塞壬唱片-MSR");
    let selectedDate = $state("1976-01-01");
    let searchInput = $state("");
    let filteredTracks: Track[] = $state([]);
    let showSuggestions = $state(false);

    function filterTracks(tracks: Track[]) {
        const inputLower = searchInput.toLowerCase().trim();
        const searchTerms = inputLower.split(/\s+/); // Split by spaces for multi-word search
        const maxResults = 4;

        // Define a helper function to calculate relevance score
        function calculateRelevance(track: Track): number {
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



<section class="track-stats-page">
  <!-- Track Search / Selector -->
    {#await tracksReq}
        <p>Loading.....</p>
    {:then tracks}
        <header class="track-selector">
            <h1 class="text-3xl font-semibold mb-2 inline-block">Artist stats</h1>
            <div class="relative mb-4">
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
                    <ul class="absolute bg-black border mt-1 w-9/12">
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
        </header>
    {/await}

    {#await artistStatsReq}
        <p>Loading.....</p>
    {:then artistStats}
        <section class="grid grid-cols-2 md:grid-cols-2 gap-6">
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">Total Plays</h2>
                <p class="text-xl font-semibold mt-1">{artistStats.total_plays}</p>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">Total Time Played</h2>
                <p class="text-xl font-semibold mt-1">
                    {#if (artistStats.total_ms_played / 3600000) > 3}
                        {(artistStats.total_ms_played / 3600000).toFixed(2)} hours
                    {:else}
                        {(artistStats.total_ms_played / 60000).toFixed(2)} minutes
                    {/if}
                </p>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">First Play</h2>
                <p class="text-xl font-semibold mt-1">{new Date(artistStats.first_played).toLocaleDateString()}</p>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">Last (recorded) Play</h2>
                <p class="text-xl font-semibold mt-1">{new Date(artistStats.last_played).toLocaleDateString()}</p>
            </div>
            <!-- Optional Add-ons -->
            <!-- <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">Longest streak</h2>
                <p class="text-xl font-semibold mt-1">7 days in a row</p>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">First 30 days trend (Was it an instant favorite or a grower?)</h2>
                <p class="text-xl font-semibold mt-1">aboba Jan 15, 2024</p>
            </div> -->

            <!-- Artist meta maybe (spotify api required) -->
            <!-- {#await trackMetaReq}
                <p class="loading">Loading track meta info from Spotify...</p>
            {:then track_meta}
                <div class="flex flex-col">
                    meta
                    <div>
                        Artists:
                        {#if track_meta.artists.length === 0}
                            <p>No artists found</p>
                        {:else}
                            {#each track_meta.artists as artist, index}
                                {artist.name}{index < track_meta.artists.length - 1 ? ' / ' : ''}
                            {/each}
                        {/if}
                    </div>

                    <div>
                        <p>Album name: {track_meta.album.name}</p>
                        <p>Album release date: {track_meta.album.release_date}</p>
                        <p>Track popularity: {track_meta.popularity}</p>
                    </div>
                </div>
            {/await} -->
        </section>

        <!-- Chart Section -->
        <section class="track-chart mt-10">
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
            <h2 class="text-sm text-(--secondary-text) mb-1 ml-4">Minutes of artist played per day</h2>
                {#if artistStats.timeline_data.length > 0}
                    <D3Chart
                        selectedDate={(value) => {
                            selectedDate = value;
                        }}
                        timeline_data={artistStats.timeline_data}
                    />
                {/if}
            </div>
        </section>
    {/await}
    
    <!-- {#await playedTracksReq}
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
    {/await} -->

</section>
