<script lang="ts">
    const { Tracks } = $props();
</script>

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
                    {#if track.percentage_of_max}
                        <div
                            class="h-full bg-emerald-900/50 absolute top-0 left-0 track-bar-fill"
                            style="--bar-value: {track.percentage_of_max}%"
                        ></div>
                    {/if}
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
                    <div class="flex flex-col max-w-96">
                        <div class="text-xl -mt-1 font-semibold truncate-text">
                            {track.track_name}
                        </div>
                        <div class="text-base mt-0.5">
                            {track.artist}
                        </div>
                    </div>
                </div>
                <div class="flex-1"></div>
                <div class="w-4 shrink-0"></div>

                {#if track.skip_count}
                    <div class="min-w-20">
                        {track.skip_count} times
                    </div>
                {/if}
            </li>
        {/each}
    </ul>
{:else}
    <p>No tracks found</p>
{/if}

<style>
    .track-bar-fill {
        width: var(--bar-value);
    }
    .truncate-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }
</style>
