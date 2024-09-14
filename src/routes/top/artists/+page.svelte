<script>
    let topArtists = $state([]);
    let error = $state('');
    let timeRange = $state('medium_term');
    // TODO : add session check
    // TODO : maybe some image for artists with no image
    // TODO : align pictures better

    // Fetch top artists based on the selected time range
    async function fetchTopArtists() {
        try {
            const response = await fetch(`/api/top_artists?time_range=${timeRange}`);
            if (!response.ok) {
                const data = await response.json();
                error = data.error || 'Failed to fetch top artists';
            } else {
                topArtists = [];
                const data = await response.json();
                topArtists = data.top_artists;                
            }
        } catch (err) {
            error = 'Error fetching top artists';
        }
    }

    // Update the time range and fetch the data again
    function changeTimeRange(newTimeRange) {
        timeRange = newTimeRange;
        fetchTopArtists();
    }

    // Fetch the data when the component is initialized
    fetchTopArtists();
</script>

{#if error}
    <p>{error}</p>
{:else}
    <div class="title-wrapper">
        <h2>Play history</h2>
        <div class="time-ranges">
            <p>Time ranges:</p>
            <div class="time-range-group">
                <button onclick={() => changeTimeRange('short_term')}>Short term (4 weeks)</button>
                <button onclick={() => changeTimeRange('medium_term')}>Medium term (6 months)</button>
                <button onclick={() => changeTimeRange('long_term')}>Long term (12 months)</button>
            </div>
        </div>
    </div>
    <!-- TODO: Check screen sizes display off all cards -->
    <div class="top-artists-list grid">
        {#each topArtists as artist, i}
            <div class="top-artist-item">
                <div class="top-artist-image-wrapper">
                    {#if artist.images && artist.images.length > 0}
                        <img src="{artist.images[0].url}" alt="Artist art" class="top-artist-image">
                    {:else}
                        <p>No image available</p>
                    {/if}
                </div>
                <div class="top-artist-info">
                    <div class="top-artist-name">{i + 1}. {artist.name} 
                        <a href="{artist.external_urls.spotify}"><i class="fab fa-spotify"></i></a>
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    @import '$lib/css/top_artists.css';
</style>