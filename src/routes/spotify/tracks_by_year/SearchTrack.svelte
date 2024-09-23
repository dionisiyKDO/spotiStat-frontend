<script>
    import TrackList from "$lib/TrackList.svelte";

    let { year } = $props();
    let tracks = $state([]);
    let error = $state('');
    // TODO: add waiting response from server indicator


    async function fetchSavedTracks() {
        try {
            const response = await fetch(`/api/spotify/saved_tracks/filter?year=${year}`);
            const data = await response.json();
            if (!response.ok) {
                error = data.error || 'failed to fetch saved tracks';
            } else {
                tracks = data.results;
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

    <div class="m-8">
        <div class="flex gap-2 mb-2"> 
            <h2 class="py-1 text-3xl font-semibold">Tracks from: </h2>
            <input class="w-24 text-center text-2xl font-semibold" type="text" name="year" id="year" bind:value={year}>
        </div>
        <div class="mt-4">
            <TrackList tracks={tracks} />
        </div>
    </div>

{/if}
