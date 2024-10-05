<script>
    let { tracks } = $props();

    function formatDateWithTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    }
    function formatDateWithoutTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }
</script>

<ul class="flex flex-col gap-2">
    {#each tracks as track, i}
        <li
            class="relative p-1.5 pl-2 flex flex-row border-b-2 border-white/50"
        >
            <!-- Popularity bar -->
            {#if track.popularity !== undefined}
                <div
                    class="absolute top-0 left-0 w-full h-full opacity-50 -z-10"
                >
                    <!-- TODO: background: linear-gradient(to right, #000000 66.6%, transparent 66.6%); -->
                    <div
                        class="h-full bg-emerald-900/60 absolute top-0 left-0 track-bar-fill"
                        style="--bar-value: {track.popularity}%"
                    ></div>
                </div>
            {/if}

            <!-- Number -->
            <div class="shrink-0 w-16 my-auto text-2xl font-bold text-right">
                {i + 1}
            </div>
            <div class="w-4 shrink-0"></div>

            <div class="flex flex-row">
                <!-- Album art + play button -->
                <a href={track.spotify_url} target="_blank">
                    <div
                        class="w-16 h-16 my-auto bg-cover bg-center rounded-md mr-2 border-2 border-black hover:border-white transition-all duration-200 ease-in-out"
                        style="background-image: url({track.album_image_url});"
                    >
                        <div
                            class="icon-shadow text h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200 ease-in-out"
                        >
                            <i class="fa-solid fa-play"></i>
                        </div>
                    </div>
                </a>
                <!-- Track name + artist -->
                <div class="flex flex-col mt-0.5 max-w-96">
                    <div class="text-lg font-semibold truncate-text">
                        {track.name}
                    </div>
                    <div class="text-base -mt-0.5">{track.artist}</div>
                </div>
            </div>

            <div class="flex-1"></div>
            <div class="w-4 shrink-0"></div>

            <!-- Track meta -->
            <div class="flex flex-col mt-0.5 text-right">
                <!-- Conditionally render optional fields if they exist -->
                {#if track.played_at}
                    <div class="">
                        Played at: {formatDateWithTime(track.played_at)}
                    </div>
                {/if}

                {#if track.release_date}
                    <div class="">
                        Released on: {formatDateWithoutTime(track.release_date)}
                    </div>
                {/if}

                {#if track.popularity !== undefined}
                    <div class="">Popularity: {track.popularity}</div>
                {/if}
            </div>
        </li>
    {/each}
    {#if tracks.length === 0}
        <p>No tracks found</p>
    {/if}
</ul>

<style>
    .icon-shadow:hover {
        text-shadow: 1px 1px 5px rgba(0, 0, 0, 1);
        color: #ffffff;
    }
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
