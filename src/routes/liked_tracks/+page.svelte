<script>
    let likedTracks = [];
    let error = '';
    let sortBy = 'index';
    let order = 'asc';

    // Fetch liked tracks from the API with sorting options
    async function fetchLikedTracks() {
        try {
            const response = await fetch(`/api/liked_tracks?sort_by=${sortBy}&order=${order}`);
            if (!response.ok) {
                const data = await response.json();
                error = data.error || 'Failed to fetch liked tracks';
            } else {
                const data = await response.json();
                likedTracks = data.liked_tracks;
            }
        } catch (err) {
            error = 'Error fetching liked tracks';
        }
    }

    // Handle sort change
    function handleSortChange(newSortBy) {
        if (sortBy === newSortBy) {
            // Toggle the order if the same sort field is clicked again
            order = order === 'asc' ? 'desc' : 'asc';
        } else {
            sortBy = newSortBy;
            order = 'asc'; // Reset to ascending when sorting by a new field
        }
        fetchLikedTracks();
    }

    fetchLikedTracks();
</script>

{#if error}
    <p>{error}</p>
{:else}
    <div class="container container-narrow">
        <div class="section-title">
            <h2>Liked Tracks</h2>

            <div class="sort-options">
                <label for="sort_by">Sort by:</label>
                <select name="sort_by" id="sort_by" bind:value={sortBy} on:change={() => handleSortChange(sortBy)}>
                    <option value="index">Index</option>
                    <option value="name">Name</option>
                    <option value="artist">Artist</option>
                    <option value="popularity">Popularity</option>
                </select>

                <label for="order">Order:</label>
                <select name="order" id="order" bind:value={order} on:change={fetchLikedTracks}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                </select>
            </div>
        </div>

        <ul class="track-list">
            {#each likedTracks as track}
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
