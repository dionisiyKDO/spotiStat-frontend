<script>
    import TrackList from "$lib/TrackList.svelte";

    let savedTracks = $state([]);
    let sortBy = $state('index');
    let order = $state('asc');
    let error = $state('');


    async function fetchSavedTracks() {
        try {
            const response = await fetch(`/api/spotify/saved_tracks?sort_by=${sortBy}&order=${order}`);
            const data = await response.json();
            if (!response.ok) {
                error = data.error || 'Failed to fetch liked tracks';
            } else {
                savedTracks = data.saved_tracks;
            }
        } catch (err) {
            error = err;
        }
    }

    $effect(() => {
        fetchSavedTracks();
    });
</script>


{#if error}
    <p style="color: darkred">{error}</p>
{:else}

    <div class="p-4">
        <h2 class="ml-10 text-3xl font-semibold mb-2">Saved Tracks</h2>

        <div class="flex flex-col gap-2">
            <div>
                <label class="inline-block w-20 text-right" for="sort_by">Sort by:</label>
                <select class="w-40" name="sort_by" id="sort_by" bind:value={sortBy}>
                    <option value="index">Index</option>
                    <option value="name">Name</option>
                    <option value="artist">Artist</option>
                    <option value="popularity">Popularity</option>
                </select>
            </div>

            <div>
                <label class="inline-block w-20 text-right" for="order">Order:</label>
                <select class="w-40" name="order" id="order" bind:value={order}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                </select>
            </div>
        </div>
    </div>
    <div class="m-4">
        <TrackList tracks={savedTracks} />
    </div>
    
{/if}

