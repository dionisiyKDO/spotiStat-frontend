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
    <h2 class="text-3xl font-semibold mb-2 inline-block">Play history</h2>
    
    <!-- Question mark with hover effect -->
    <div class="relative inline-block group">
        <i
            class="question-mark fa fa-question-circle ml-2 text-gray-500 hover:text-emerald-500 transition duration-100 ease-in-out"
        ></i>

        <!-- Popup content on hover -->
        <div
            class="popup-content absolute left-0 mt-2 w-72 p-3 rounded-lg bg-black border border-gray-200 opacity-0 transform transition-all duration-300 ease-in-out z-10"
        >
            <p>
                A track must be played for more than 30 seconds to be included
                in play history.
            </p>
            <p class="mt-2">
                Tracks listened to while in "Private Session" will not be shown
                here.
            </p>
        </div>
    </div>
</div>
{#await playHistoryReq}
    <p class="loading">Loading...</p>
{:then playHistory}
    <div class="mt-4">
        <TrackList tracks={playHistory} />
    </div>
{/await}

<style>
    .question-mark:hover + .popup-content {
        opacity: 1;
    }
</style>
