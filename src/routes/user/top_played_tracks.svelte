<script>
    let tracks = $state([]);
    let error = $state('');
    
    
    async function fetchTracks() {
        try {
            const response = await fetch('/api/db/history/top_tracks_by_playtime?limit=10');
            const data = await response.json();
            if (!response.ok) {
                error = data.error || 'Failed to fetch top played tracks from database';
            } else {
                // Find the maximum total_ms_played
                const maxTotalMsPlayed = Math.max(...data.map(track => track.total_ms_played));

                // Add percentage key to each track
                const tracksWithPercentage = data.map(track => ({
                    ...track,  // Spread the existing properties
                    percentage_of_max: (track.total_ms_played / maxTotalMsPlayed) * 100
                }));

                tracks = tracksWithPercentage;
                console.log(tracks);
                
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

    <div>
        <h2>Top played tracks</h2>
        {#if tracks.length > 0}

            <ul class="track-list">
                {#each tracks as track}
                    <li class="track-item">
                        <div class="track-bar">
                            <div class="track-bar-fill" style="--bar-value: {track.percentage_of_max}%"></div>
                        </div>
                        <div class="track-number">{track.index + 1}</div>
                            <div class="space"></div>
                        <div class="track-info">
                            <div class="album-image" style="background-image: url({track.album_image_url});"> </div>
                            <div class="track-name-artist">
                                <div class="track-name">{track.name}</div>
                                <div class="track-artist">{track.artist}</div>
                            </div>
                        </div>
                            <div class="flex-1"></div>
                            <div class="space"></div>
                        <div class="track-meta">
                            <div class="track-time-played">{Math.round(track.total_hours_played * 100) / 100} hours</div>
                        </div>
                    </li>
                {/each}
            </ul>

        {:else}
            <p>No tracks found</p>
        {/if}
    </div>

{/if}

<style>
</style>