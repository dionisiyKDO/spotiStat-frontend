<script>
    let topTracks = $state([]);
    let error = $state('');
    let timeRange = $state('medium_term');

    // Fetch top tracks when the component is mounted
    async function fetchTopTracks() {
        topTracks = [];
        try {
            const response = await fetch(`/api/top_tracks?time_range=${timeRange}`);
            if (!response.ok) {
                const data = await response.json();
                error = data.error || 'Failed to fetch top tracks';
            } else {
                const data = await response.json();
                topTracks = data.top_tracks;
            }
        } catch (err) {
            error = 'Error fetching top tracks';
        }
    }

    function handleTermChange(newTerm) {
        timeRange = newTerm;
        fetchTopTracks();
    }

    fetchTopTracks();
</script>



{#if error}
    <p>{error}</p>
{:else}

    <div class="title-wrapper">
        <h2>Top tracks</h2>
        <div class="time-ranges">
            <p>Time ranges:</p>
            <div class="time-range-group">
                <button onclick={() => handleTermChange('short_term')}>Short term (4 weeks)</button>
                <button onclick={() => handleTermChange('medium_term')}>Medium term (6 months)</button>
                <button onclick={() => handleTermChange('long_term')}>Long term (12 months)</button>
            </div>
        </div>
    </div>

    <!-- TODO: loading animation when page loading for different time ranges -->

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