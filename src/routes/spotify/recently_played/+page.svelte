<script>
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

    // Format date as MM/DD/YYYY, HH:MM:SS
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    $effect(() => {
        fetchPlayHistory();
    });
</script>


{#if error}
    <p style="color: darkred">{error}</p>
{:else}

    <h2>Play history</h2>
    <!-- TODO: Hide paragraphs to onHover question mark -->
    <p>A track must be played for more than 30 seconds to be included in play history</p>
    <p>Tracks listened to while in "Private Session" will not be shown here.</p>
    
    <ul class="track-list">
        {#each playHistory as track}
            <li class="track-item play-history-track-item">
                <div class="album-image-wrapper">
                    <img src="{track.album_image_url}" alt="Album art" class="album-image">
                </div>
                <div class="track-info">
                    <div class="track-name">{track.name}</div>
                    <div class="track-artist">{track.artist}</div>
                    <div class="track-meta"><div class="track-time-played">Played at: {formatDate(track.played_at)}</div></div>
                </div>
            </li>
        {/each}
    </ul>

{/if}

<style>
    @import '$lib/css/track_list.css';

    p {
        margin-bottom: 0.5em;
    }
</style>