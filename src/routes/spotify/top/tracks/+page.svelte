<script>
    let topTracks = $state([]);
    let error = $state('');
    let timeRange = $state('medium_term');


    async function fetchTopTracks() {
        topTracks = [];
        try {
            const response = await fetch(`/api/spotify/top_tracks?time_range=${timeRange}`);
            const data = await response.json();
            if (!response.ok) {
                error = data.error || 'Failed to fetch top tracks';
            } else {
                topTracks = data.top_tracks;
            }
        } catch (err) {
            error = err;
        }
    }

    $effect(() => {
        fetchTopTracks();
    });
</script>



{#if error}
    <p style="color: darkred">{error}</p>
{:else}

    <div class="title-wrapper">
        <h2>Top tracks</h2>
        <div class="time-ranges">
            <select name="time_range" id="time_range" bind:value={timeRange}>
                <option value="short_term" >Short term (4 weeks)  </option>
                <option value="medium_term">Medium term (6 months)</option>
                <option value="long_term"  >Long term (12 months) </option>
            </select>
        </div>
    </div>

    <!-- TODO: skeleton loading animation when page is loading -->

    <ul class="track-list">
        {#each topTracks as track, i}
            <li class="track-item play-history-track-item">
                <div class="track-number">{i + 1}</div>
                <div class="album-image-wrapper">
                    <img src="{track.album_image_url}" alt="Album art" class="album-image">
                </div>
                <div class="track-info">
                    <div class="track-name">{track.name}</div>
                    <div class="track-artist">
                        {track.artist} 
                        <a href="{track.spotify_url}"><i class="fab fa-spotify"></i></a>
                    </div>
                </div>
            </li>
        {/each}
    </ul>
    
{/if}

<style>
@import '$lib/css/track_list.css';
</style>