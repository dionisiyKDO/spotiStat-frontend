<script>
    let tracks = $state([]);
    let error = $state('');
    
    // HUGE TODO: This component and top_played_tracks.svelte should be merged into one component
    
    async function fetchTracks() {
        try {
            const response = await fetch('/api/db/history/top_tracks_by_playcount?limit=10');
            const data = await response.json();
            if (!response.ok) {
                error = data.error || 'Failed to fetch top played tracks from database';
            } else {
                // Find the maximum total_ms_played
                const maxCountOfPlays = Math.max(...data.map(track => track.count_of_plays));

                // Add percentage key to each track
                const tracksWithPercentage = data.map(track => ({
                    ...track,  // Spread the existing properties
                    percentage_of_max: (track.count_of_plays / maxCountOfPlays) * 100
                }));

                tracks = tracksWithPercentage;
            }
        } catch (err) {
            error = err;
        }
    }


    $effect(() => {
        fetchTracks();
    });
</script>


{#if error}
    <p style="color: darkred">{error}</p>
{:else}

    <div class="mt-6">
        <h2 class="text-3xl font-semibold mb-4 ">Top count of plays</h2>
        {#if tracks.length > 0}

        <ul class="flex flex-col gap-2">
            {#each tracks as track}
                <li class="relative p-1.5 pl-2 flex flex-row rounded-lg border-2 border-emerald-800 hover:border-emerald-400 transition-all duration-200 ease-in-out">
                    <div class="absolute top-0 left-0 w-full h-full opacity-50 -z-10"> <!-- TODO: background: linear-gradient(to right, #000000 66.6%, transparent 66.6%); -->
                        <div class="h-full bg-emerald-900/50 absolute top-0 left-0 track-bar-fill" style="--bar-value: {track.percentage_of_max}%"></div>
                    </div>
                    <div class="shrink-0 w-8 my-auto text-2xl font-bold text-emerald-600 text-right">{track.index + 1}</div>
                    <div class="w-4 shrink-0"></div>
                    <div class="flex flex-row">
                        <div class="w-12 h-12 my-auto bg-cover bg-center rounded-md mr-2 border-2 border-black" style="background-image: url({track.album_image_url});"> </div>
                        <div class="flex flex-col">
                            <div class="text-xl -mt-1 font-semibold">{track.name}</div>
                            <div class="text-base mt-0.5">{track.artist}</div>
                        </div>
                    </div>
                        <div class="flex-1"></div>
                        <div class="w-4 shrink-0"></div>
                    <div>{track.count_of_plays} times</div>
                </li>
            {/each}
        </ul>

        {:else}
            <p>No tracks found</p>
        {/if}
    </div>

{/if}

<style>
    .track-bar-fill {
        width: var(--bar-value);
    }
</style>