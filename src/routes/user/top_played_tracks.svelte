<script>
    import Track from "./track.svelte";

    let tracks = $state([]);
    let error = $state('');
    
    
    async function fetchTracks() {
        try {
            const response = await fetch('/api/db/top_played_tracks');
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
                        <!-- <Track {track} /> -->
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
    .space {
        width: 1rem;
        flex-shrink: 0;
    }
    .flex-1 {
        flex: 1;
    }

    .track-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .track-item {
        position: relative;
        padding: 0.375rem 0.375rem 0.375rem 0.5rem;

        display: flex;
        flex-direction: row;
        border-radius: 5px;
        border: 1px solid var(--pico-muted-color);
    }

    .track-number {
        flex-shrink: 0;
        width: 2rem;
        margin: auto 0rem auto 0;

        font-size: 1.5em;
        font-weight: bold;
        text-align: right;
    }
    .track-info {
        display: flex;
        flex-direction: row;
    }
    .album-image {
        width: 3rem;
        height: 3rem;
        background-size: cover;
        background-position: center;
        border-radius: 5px;
        margin-right: 0.5rem;
    }
    .track-name-artist {
        display: flex;
        flex-direction: column;
    }
    .track-name {
        font-size: 1.2rem;
        font-weight: 400;
        color: white;
        margin: 0;
    }
    .track-artist {
        font-size: 1rem;
        margin: 0;
        margin-top: 0.4em;
    }
    .track-bar {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: -1;
    }
    .track-bar-fill {
        width: var(--bar-value);
        height: 100%;
        background-color: var(--pico-muted-border-color);
        position: absolute;
        top: 0;
        left: 0;
    }
</style>