<script lang="ts">
    import TrackList from "$lib/TrackList.svelte";

    let timeRange = $state("medium_term");

    interface TopTrack {
        added_at: any;
        album_image_url: string;
        artist: string;
        duration_ms: number;
        name: string;
        played_at: any;
        popularity: number;
        release_date: string;
        spotify_url: string;
    }

    async function fetchTopTracks(
        timeRange: string = "medium_term"
    ): Promise<TopTrack[] | null> {
        try {
            const response = await fetch(
                `/api/spotify/top_tracks?time_range=${timeRange}`
            );

            if (!response.ok) {
                const data = await response.json();
                const error = data.error || "Failed to fetch top tracks";
                console.log(error);
                return null;
            }

            const data = (await response.json()) as { top_tracks: TopTrack[] };
            return data.top_tracks;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    let topTracksReq = $derived(fetchTopTracks(timeRange));
</script>

<div>
    <h2 class="text-3xl font-semibold mb-2">Top tracks</h2>
    <select class="w-72" name="timeRange" id="timeRange" bind:value={timeRange}>
        <option value="short_term">Short term (4 weeks) </option>
        <option value="medium_term">Medium term (6 months)</option>
        <option value="long_term">Long term (12 months) </option>
    </select>
</div>

{#await topTracksReq}
    <p class="loading">Loading...</p>
{:then topTracks}
    <div class="mt-4">
        <TrackList tracks={topTracks} />
    </div>
{/await}
