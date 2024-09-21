<script>
    let topArtists = $state([]);
    let timeRange = $state('medium_term');
    let error = $state('');
    // TODO : maybe some image for artists with no image
    // TODO : align pictures better


    async function fetchTopArtists() {
        try {
            const response = await fetch(`/api/spotify/top_artists?time_range=${timeRange}`);
            const data = await response.json();
            if (!response.ok) {
                error = data.error || 'Failed to fetch top artists';
            } else {
                topArtists = [];
                topArtists = data.top_artists;                
            }
        } catch (err) {
            error = err;
        }
    }

    $effect(() => {
        fetchTopArtists();
    });
</script>


{#if error}
    <p style="color: darkred">{error}</p>
{:else}

    <div class="title-wrapper">
        <h2>Play history</h2>
        <div class="time-ranges">
            <select name="time_range" id="time_range" bind:value={timeRange}>
                <option value="short_term" >Short term (4 weeks)  </option>
                <option value="medium_term">Medium term (6 months)</option>
                <option value="long_term"  >Long term (12 months) </option>
            </select>
        </div>
    </div>

    <!-- TODO: Check screen sizes display off all cards -->
    <!-- TODO: skeleton loading animation when page is loading -->

    <div class="top-artists-list grid">
        {#each topArtists as artist, i}
            <div class="top-artist-item">
                <div class="top-artist-image-wrapper">
                    {#if artist.images && artist.images.length > 0}
                        <img src="{artist.images[0].url}" alt="Artist art" class="top-artist-image">
                    {:else}
                        <p>No image available</p> <!-- TODO: some mock image if artist doesn't have one -->
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