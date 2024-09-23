<script>
    import TrackList from "$lib/TrackList.svelte";

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

    <div class="ml-10">
        <h2 class="text-3xl font-semibold mb-2">Top tracks</h2>
        <div class="flex flex-col gap-2">
            <select class="w-72"  name="time_range" id="time_range" bind:value={timeRange}>
                <option value="short_term" >Short term (4 weeks)  </option>
                <option value="medium_term">Medium term (6 months)</option>
                <option value="long_term"  >Long term (12 months) </option>
            </select>
        </div>
    </div>
    <div class="mt-4">
        <TrackList tracks={topTracks} />
    </div>
    
{/if}
