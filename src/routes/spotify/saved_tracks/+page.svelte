<script>
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

    <div class="container container-narrow">
        <div class="section-title">
            <h2>Saved Tracks</h2>

            <div class="sort-options">
                <label for="sort_by">Sort by:</label>
                <select name="sort_by" id="sort_by" bind:value={sortBy}>
                    <option value="index">Index</option>
                    <option value="name">Name</option>
                    <option value="artist">Artist</option>
                    <option value="popularity">Popularity</option>
                </select>

                <label for="order">Order:</label>
                <select name="order" id="order" bind:value={order}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                </select>
            </div>
        </div>

        <ul class="track-list">
            {#each savedTracks as track}
                <li class="track-item">
                    <div class="track-popularity-bar">
                        <div class="track-popularity-bar-fill" style="--popularity: {track.popularity}%"></div>
                    </div>
                    <div class="track-number">{track.index + 1}</div>
                    <div class="album-image-wrapper">
                        <img src={track.album_image_url} alt="Album art" class="album-image">
                    </div>
                    <div class="track-info">
                        <div class="track-name">{track.name}</div>
                        <div class="track-artist">{track.artist}</div>
                        <div class="track-meta">
                            <div class="track-popularity">Popularity: {track.popularity}</div>
                        </div>
                    </div>
                </li>
            {/each}
        </ul>
    </div>
    
{/if}


<style>
    @import '$lib/css/track_list.css';
</style>