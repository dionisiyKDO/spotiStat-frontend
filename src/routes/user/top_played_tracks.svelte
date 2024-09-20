<script>
    let tracks = $state([]);
    let error = $state('');
    
    
    async function fetchTracks() {
        try {
            const response = await fetch('/api/db/top_played_tracks');
            const data = await response.json();
            if (!response.ok) {
                error = data.error || 'Failed to fetch top played tracks from database';
            } else {
                tracks = data;
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
            <ul>
                {#each tracks as track}
                    <li>
                        <h3>{track.track_name}</h3>
                        <p>{track.track_artist_name}</p>
                        <!-- i want to round hours to two decimals floating point -->
                        <p>{Math.round(track.total_hours_played * 100) / 100} hours</p>
                    </li>
                {/each}
            </ul>
        {:else}
            <p>No tracks found</p>
        {/if}
    </div>
{/if}