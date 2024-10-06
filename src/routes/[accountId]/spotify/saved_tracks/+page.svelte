<script lang="ts">
    import TrackList from "$lib/TrackList.svelte";

    let sortBy = $state("index");
    let order = $state("asc");

    interface SavedTrack {
        added_at: any;
        album_image_url: string;
        artist: string;
        duration_ms: number;
        index: number;
        name: string;
        played_at: any;
        popularity: number;
        release_date: string;
        spotify_url: string;
    }

    async function fetchSavedTracks(
        sortBy: string = "index",
        order: string = "asc"
    ): Promise<SavedTrack[] | null> {
        try {
            const response = await fetch(
                `/api/spotify/saved_tracks?sort_by=${sortBy}&order=${order}`
            );
            if (!response.ok) {
                const data = await response.json();
                const error = data.error || "Failed to fetch saved tracks";
                console.log(error);
                return null;
            }

            const data = (await response.json()) as {
                saved_tracks: SavedTrack[];
            };
            return data.saved_tracks;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    let savedTracksReq = $derived(fetchSavedTracks());
</script>

<div class="mt-4">
    <h2 class="text-3xl font-semibold mb-2">Saved Tracks</h2>

    <div class="flex flex-row gap-4">
        <div>
            <label class="ml-2 block" for="sort"> Sort by: </label>
            <select class="w-40" name="sort" id="sort" bind:value={sortBy}>
                <option value="index">Index</option>
                <option value="name">Name</option>
                <option value="artist">Artist</option>
                <option value="popularity">Popularity</option>
            </select>
        </div>

        <div>
            <label class="ml-2 block" for="order"> Order: </label>
            <select class="w-40" name="order" id="order" bind:value={order}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
            </select>
        </div>
    </div>
</div>

{#await savedTracksReq}
    <p class="loading">Loading...</p>
{:then savedTracks}
    <div class="mt-4">
        <TrackList tracks={savedTracks} />
    </div>
{/await}
