<script lang="ts">
    import {
        fetchTrackMeta,
        fetchTrackStats,
        fetchTracks,
        type TrackMeta,
        type TrackStats,
        type Tracks,
    } from "./load";
    import D3Chart from "$lib/track/TimelineChart.svelte";

    let track_id = $state("3UhNeRObinbV3mtqPddGux");
    let searchInput = $state("Battleplan Pyrolysis by 塞壬唱片-MSR");
    let showSuggestions = $state(false);
    let filteredTracks: Tracks[] = $state([]);

    let trackStatsReq = $derived(fetchTrackStats(track_id));
    let trackMetaReq = $derived(fetchTrackMeta(track_id));
    let tracksReq = $derived(fetchTracks());

    function filterTracks(tracks: Tracks[]) {
        const inputLower = searchInput.toLowerCase().trim();
        const searchTerms = inputLower.split(/\s+/);

        // Calculate relevance score
        const calculateRelevance = (track: Tracks): number => {
            return searchTerms.reduce((score, term) => {
                if (track.track_name.toLowerCase().includes(term)) score += 7;
                if (track.artist.toLowerCase().includes(term)) score += 3;
                return score;
            }, 0);
        };
        
        // Filter and rank tracks by relevance
        filteredTracks = tracks
            .map((track) => ({
                track,
                relevance: calculateRelevance(track),
            }))
            .filter((item) => item.relevance > 0)
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 4)
            .map((item) => item.track);
    }

    // Debounced input function to reduce excessive filtering on each keystroke
    let debounceTimeout: ReturnType<typeof setTimeout>;
    function handleInput(tracks: Tracks[]) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => filterTracks(tracks), 300);
    }

    function selectTrack(track: Tracks) {
        track_id = track.spotify_track_uri.replace("spotify:track:", "");
        searchInput = `${track.track_name} by ${track.artist}`;
        showSuggestions = false;
    }
</script>



<section class="track-stats-page">
  <!-- Track Search / Selector -->
    {#await tracksReq}
        <p class="loading">Loading track list you listened to...</p>
    {:then tracks}
        <header class="track-selector">
            <h1 class="text-3xl font-semibold mb-2 inline-block">Track stats</h1>
            <div class="relative mb-4">
                <input
                    class="w-9/12 border p-2"
                    type="text"
                    placeholder="Search track or artist..."
                    bind:value={searchInput}
                    onfocus={() => { showSuggestions = true}}
                    onblur={() => setTimeout(() => (showSuggestions = false), 200)}
                    oninput={() => handleInput(tracks)}
                />

                {#if showSuggestions && filteredTracks.length > 0}
                    <ul class="absolute bg-black border mt-1 w-9/12">
                        {#each filteredTracks as track}
                        <li class="p-2 cursor-pointer hover:bg-gray-800">
                            <button
                                type="button"
                                class="text-left"
                                onclick={() => selectTrack(track)}
                            >
                                {track.track_name} by {track.artist}
                            </button>
                        </li>
                        {/each}
                    </ul>
                {/if}
            </div>
        </header>
    {/await}

    {#await trackStatsReq}
        <p class="loading">Loading track stats from our database...</p>
    {:then track_stats}
        <section class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">Total Plays</h2>
                <p class="text-xl font-semibold mt-1">{track_stats.total_plays}</p>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">Total Time Played</h2>
                <p class="text-xl font-semibold mt-1">
                    {#if (track_stats.total_ms_played / 3600000) > 3}
                        {(track_stats.total_ms_played / 3600000).toFixed(2)} hours
                    {:else}
                        {(track_stats.total_ms_played / 60000).toFixed(2)} minutes
                    {/if}
                </p>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">First Play</h2>
                <p class="text-xl font-semibold mt-1">{new Date(track_stats.first_played).toLocaleDateString()}</p>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">Last (recorded) Play</h2>
                <p class="text-xl font-semibold mt-1">{new Date(track_stats.last_played).toLocaleDateString()}</p>
            </div>
            <!-- Optional Add-ons -->
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">Longest streak</h2>
                <p class="text-xl font-semibold mt-1">7 days in a row</p>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">First 30 days trend (Was it an instant favorite or a grower?)</h2>
                <p class="text-xl font-semibold mt-1">aboba Jan 15, 2024</p>
            </div>

            <!-- Track meta (spotify api required) -->
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
            <h2 class="text-sm text-(--secondary-text) mb-1 ml-4">Minutes Played Per Day</h2>
                {#if track_stats.timeline_data.length > 0}
                    <D3Chart timeline_data={track_stats.timeline_data} />
                {/if}
            </div>
        </section>
    {/await}

    
</section>
