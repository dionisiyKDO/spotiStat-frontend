<script>
    import TrackList from "$lib/TrackList.svelte";

    let playHistory = $state([]);
    let error = $state('');


    async function fetchPlayHistory() {
        try {
            const response = await fetch('/api/spotify/recently_played');
            const data = await response.json();
            if (!response.ok) {
                error = data.error || 'Failed to fetch play history';
            } else {
                playHistory = data.play_history;
            }
        } catch (err) {
            error = err;
        }
    }


    $effect(() => {
        fetchPlayHistory();
    });
</script>


{#if error}
    <p style="color: darkred">{error}</p>
{:else}

    <h2 class="mb-4 text-2xl font-medium">Play history</h2>
    <!-- TODO: Hide paragraphs to onHover question mark -->
    <p>A track must be played for more than 30 seconds to be included in play history</p>
    <p>Tracks listened to while in "Private Session" will not be shown here.</p>
    <div class="m-4">
        <TrackList tracks={playHistory} />
    </div>
    
{/if}
