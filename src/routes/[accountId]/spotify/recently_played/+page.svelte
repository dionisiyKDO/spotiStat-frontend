<script lang="ts">
    import TrackList from "$lib/TrackList.svelte";

    interface PlayHistory {
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

    async function fetchPlayHistory(): Promise<PlayHistory[] | null> {
        try {
            const response = await fetch("/api/spotify/recently_played");
            if (!response.ok) {
                const data = await response.json();
                const error = data.error || "Failed to fetch play history";
                console.log(error);
                return null;
            }

            const data = (await response.json()) as {
                play_history: PlayHistory[];
            };
            return data.play_history;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    let playHistoryReq = $derived(fetchPlayHistory());
</script>

<div class="mt-4">
    <h2 class="text-3xl font-semibold mb-2">Play history</h2>
    <!-- TODO: Hide paragraphs to onHover question mark -->
    <p>
        A track must be played for more than 30 seconds to be included in play
        history
    </p>
    <p>Tracks listened to while in "Private Session" will not be shown here.</p>
</div>
{#await playHistoryReq}
    <p class="loading">Loading...</p>
{:then playHistory}
    <div class="m-4">
        <TrackList tracks={playHistory} />
    </div>
{/await}
