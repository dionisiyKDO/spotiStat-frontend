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

    <div class="ml-8 flex gap-2">
        <h2 class="text-3xl font-semibold mb-2">Top artists</h2>
        <select class="text-xl" name="time_range" id="time_range" bind:value={timeRange}>
            <option value="short_term" >Short term (4 weeks)  </option>
            <option value="medium_term">Medium term (6 months)</option>
            <option value="long_term"  >Long term (12 months) </option>
        </select>
    </div>

    <!-- TODO: Check screen sizes display off all cards -->

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 p-4 pt-6">
        {#each topArtists as artist, i}
            <div class="flex flex-col items-center justify-center">
                <div >
                    {#if artist.images && artist.images.length > 0}
                        <div class="bg-cover bg-center rounded-xl border-2 border-emerald-800 min-w-44 min-h-44 xl:min-w-64 xl:min-h-64" style="background-image: url({artist.images[0].url});"></div>
                    {:else}
                        <p>No image available :(</p> <!-- TODO: some mock image if artist doesn't have one -->
                    {/if}
                </div>
                <div class="p-0 mt-2 text-center">
                    {i + 1}. {artist.name} <a href="{artist.external_urls.spotify}"><i class="fab fa-spotify"></i></a>
                </div>
            </div>
        {/each}
    </div>
    
{/if}
