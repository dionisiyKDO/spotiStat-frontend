<script lang="ts">
    import type { Track } from "$lib/types";

    let { data, sort_by }: { data: Track[]; sort_by: string } = $props();
    console.log(data);
    
</script>

{#if data.length > 0}
    <ul class="flex flex-col gap-2">
        {#each data as track}
            <li class="relative p-1.5 pl-2 flex flex-row rounded-lg border-2 border-(--primary) hover:border-(--primary-hover) transition-all duration-200 ease-in-out">
                <!-- Background "progress bar" -->
                <div class="absolute top-0 left-0 w-full h-full opacity-50 -z-10">
                    {#if track.percentage_of_max} <!-- TODO: background: linear-gradient(to right, #000000 66.6%, transparent 66.6%); -->
                        <div
                            class="h-full bg-emerald-900/50 absolute top-0 left-0 track-bar-fill"
                            style="width: {track.percentage_of_max}%"
                        ></div>
                    {/if}
                </div>
                <!-- Index -->
                <div class="shrink-0 w-8 my-auto text-2xl font-bold text-emerald-600 text-right">
                    {track.index + 1}
                </div>
                <div class="w-4 shrink-0"></div>
                <!-- Track image, name, artist -->
                <div class="flex flex-row">
                    <!-- TODO: Image on click spotifyUrl -->
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

                <!-- Time played or play count -->
                {#if sort_by === "play_count"}
                    <div>{track.play_count} times</div>
                {:else}
                    <div>
                        {Math.round(
                            (track.total_ms_played / (1000 * 60 * 60)) * 100
                        ) / 100} hours
                    </div>
                {/if}
            </li>
        {/each}
    </ul>
{:else}
    <p>No data found</p>
{/if}
