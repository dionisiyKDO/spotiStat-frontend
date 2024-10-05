<script lang="ts">
    import TrackList from "$lib/TrackList.svelte";

    let { year } = $props();

    interface Tracks {
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

    async function fetchSavedTracks(year: number): Promise<Tracks[] | null> {
        try {
            const response = await fetch(
                `/api/spotify/saved_tracks/filter?year=${year}`
            );

            if (!response.ok) {
                const data = await response.json();
                const error = data.error || "Failed to fetch saved tracks";
                console.log(error);
                return null;
            }

            const data = (await response.json()) as {
                results: Tracks[];
            };
            return data.results;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    let tracksReq = $derived(fetchSavedTracks(year));
</script>

{#await tracksReq}
    <p class="loading">Loading...</p>
{:then tracks}
    <div class="m-8">
        <div class="flex gap-2 mb-2">
            <h2 class="py-1 text-3xl font-semibold">Tracks from:</h2>
            <input
                class="w-24 text-center text-2xl font-semibold"
                type="text"
                name="year"
                id="year"
                bind:value={year}
            />
        </div>
        <div class="mt-4">
            <TrackList {tracks} />
        </div>
    </div>
{/await}
