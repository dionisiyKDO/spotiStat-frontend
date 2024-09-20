<script>
    let { year } = $props();
    let tracks = $state([]);
    let error = $state('');
    // TODO: add waiting response from server indicator

    async function fetchTracksByYear() {
        try {
            const response = await fetch(`/api/search_saved_tracks?year=${year}`);
            if (!response.ok) {
                const data = await response.json();
                error = data.error || 'Something went wrong!';
            } else {
                const data = await response.json();
                tracks = data.results;
            }
        } catch (err) {
            error = 'Error fetching tracks by year';
        }
    }

    $effect(() => {
        fetchTracksByYear();
    });

    function formatDate(dateString) {
        const date = new Date(dateString);
        if (date.getFullYear() === new Date(dateString).getFullYear() && 
            date.getMonth() === 0 && date.getDate() === 1) {
            // Return just the year if it's the only available date information
            return date.toLocaleString('en-US', { year: 'numeric' });
        } else {
            // Format date as Month Day, Year, HH:MM:SS
            return date.toLocaleString('en-US', {
                month: 'long',
                day: '2-digit',
                year: 'numeric',
                hour12: false
            });
        }
    }
</script>


{#if error}
    <p style="color: darkred">{error}</p>
{:else}
    <div class="track-list">
        
        <div class="search-track">
            <h2>Search track</h2>
            <input type="text" name="year" id="year" bind:value={year}>
            <!-- <button onclick={fetchTracksByYear}>Search</button> -->
        </div>
        {#each tracks as track, i}
            <li class="track-item">
                <div class="track-number">{i + 1}</div>
                <div class="album-image-wrapper">
                    <img src="{track.album_image_url}" alt="Album art" class="album-image">
                </div>
                <div class="track-info">
                    <div class="track-name">{track.name}</div>
                    <div class="track-artist">{track.artist}</div>
                    <div class="track-meta"><div class="track-time-played">Released on: {formatDate(track.release_date)}</div></div>
                </div>
            </li>
        {/each}
        {#if tracks.length === 0}
            <p>No tracks found</p>
        {/if}
    </div>
{/if}





<style>
    @import '$lib/css/track_list.css';
    .search-track {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        margin-top: 2rem;
    }
    .search-track h2 {
        margin: 0;
    }
    .search-track input {
        text-align: center;
        margin: 0;
        width: 100px;
    }
    .search-track button {
        margin: 0;
    }
</style>