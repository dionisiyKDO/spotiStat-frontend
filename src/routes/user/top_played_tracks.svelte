<script>
    import { onMount } from "svelte";

    let tracks = $state([]);
    let error = $state('');
    
    async function fetchTracks() {
        try {
            const response = await fetch('/api/db/top_played_tracks');
            if (!response.ok) {
                const data = await response.json();
                error = data.error || 'Something went wrong!';
            } else {
                const data = await response.json();
                tracks = data;
                console.log(tracks);    
                
            }
        } catch (err) {
            error = 'Error fetching tracks by year';
        }
    }

    $effect(async () => {
        await fetchTracks();
    });

</script>

<div class="section">
    <div class="section-column">
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
</div>