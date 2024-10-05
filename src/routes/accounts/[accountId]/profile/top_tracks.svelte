<script lang="ts">
    interface Props {
        limit: number;
        sortBy: string;
    }

    interface Tracks {
        album_image_url: string;
        artist: string;
        play_count: number;
        total_ms_played: number;
        index: number;
        track_name: string;
        percentage_of_max: number;
    }

    let { limit, sortBy }: Props = $props();

    async function fetchTracks(limit: number, sortby: string): Promise<Tracks[] | null> {
        try {
            
            const response = await fetch(`/api/db/history/top-tracks?limit=${limit}&sort_by=${sortby}`);
            if (!response.ok) {
                const data = await response.json();
                const error = data.error || "Failed to fetch top tracks";
                console.log(error);
                return null;
            }
            const data = (await response.json()) as {
                tracks: Tracks[];
            };
            console.log(data);
            

            // Find the maximum total_ms_played
            const max = Math.max(
                ...data.map((track) => track[sortby])
            );

            // Add percentage key to each track
            const tracksWithPercentage = data.map((track) => ({
                ...track, // Spread the existing properties
                percentage_of_max:
                    (track[sortby] / max) * 100,
            }));

            return tracksWithPercentage;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    let TracksReq = $derived(fetchTracks(limit, sortBy));
</script>

{#await TracksReq}
    <p class="loading">Loading...</p>
{:then Tracks} 
    <div class="mt-6">
        <h2 class="text-3xl font-semibold mb-4">Top count of plays</h2>
        {#if Tracks.length > 0}
            <ul class="flex flex-col gap-2">
                {#each Tracks as track}
                    <li
                        class="relative p-1.5 pl-2 flex flex-row rounded-lg border-2 border-emerald-800 hover:border-emerald-400 transition-all duration-200 ease-in-out"
                    >
                        <div
                            class="absolute top-0 left-0 w-full h-full opacity-50 -z-10"
                        >
                            <!-- TODO: background: linear-gradient(to right, #000000 66.6%, transparent 66.6%); -->
                            <div
                                class="h-full bg-emerald-900/50 absolute top-0 left-0 track-bar-fill"
                                style="--bar-value: {track.percentage_of_max}%"
                            ></div>
                        </div>
                        <div
                            class="shrink-0 w-8 my-auto text-2xl font-bold text-emerald-600 text-right"
                        >
                            {track.index + 1}
                        </div>
                        <div class="w-4 shrink-0"></div>
                        <div class="flex flex-row">
                            <div
                                class="w-12 h-12 my-auto bg-cover bg-center rounded-md mr-2 border-2 border-black"
                                style="background-image: url({track.album_image_url});"
                            ></div>
                            <div class="flex flex-col">
                                <div class="text-xl -mt-1 font-semibold">
                                    {track.track_name}
                                </div>
                                <div class="text-base mt-0.5">
                                    {track.artist}
                                </div>
                            </div>
                        </div>
                        <div class="flex-1"></div>
                        <div class="w-4 shrink-0"></div>

                        {#if sortBy === "play_count"}
                            <div>{track.play_count} times</div>
                        {:else}
                            <div>{Math.round((track.total_ms_played / (1000 * 60 * 60)) * 100) / 100} hours</div>
                        {/if}
                    </li>
                {/each}
            </ul>
        {:else}
            <p>No tracks found</p>
        {/if}
    </div>
{/await}


<style>
    .track-bar-fill {
        width: var(--bar-value);
    }
</style>
