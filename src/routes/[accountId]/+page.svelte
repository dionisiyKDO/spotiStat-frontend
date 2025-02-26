<script lang="ts">
    import TopTracks from "$lib/CardTrackList.svelte";
    import { fetchUserInfo, fetchCheckHistory, fetchTracks } from "./load";
    import { fetchMockDbTracks } from "$lib/mockTrackList";

    let { data } = $props();
    const accountId = data.accountId;

    const spotifyLinks = [
        {
            name: "Recently played",
            link: `/${accountId}/spotify/recently_played`,
        },
        {
            name: "Saved tracks",
            link: `/${accountId}/spotify/saved_tracks`,
        },
        {
            name: "Top tracks",
            link: `/${accountId}/spotify/top/tracks`,
        },
        {
            name: "Top artists",
            link: `/${accountId}/spotify/top/artists`,
        },
        {
            name: "Tracks by year",
            link: `/${accountId}/spotify/tracks_by_year`,
        },
    ];

    const historyLinks = [
        {
            name: "Track stats",
            link: `/${accountId}/tracks`,
        },
        {
            name: "Artist stats",
            link: `/${accountId}/artists`,
        },
        {
            name: "OverView",
            link: `/${accountId}/trends`,
        },
    ];

    // let historyFlagReq = $derived(fetchCheckHistory(accountId));
    // let userInfoReq = $derived(fetchUserInfo());

    const combinedPromise = Promise.all([
        fetchUserInfo(),
        fetchCheckHistory(accountId),
    ]);

    const tracksPromise = Promise.all([
        // fetchTracks(10, "total_ms_played"),
        // fetchTracks(10, "play_count"),
        fetchMockDbTracks(),
        fetchMockDbTracks(),
    ]);
</script>

<div>
    <!-- Profile related block -->
    {#await combinedPromise}
        <div class="flex items-center justify-center">
            <p class="font-bold text-2xl text-center mt-10 mb-4">
                Loading Profile...
            </p>
        </div>
    {:then [userInfo, historyFlag]}
        <!-- Profile head -->
        <div>
            <!-- avatar -->
            <div class="p-4 flex gap-4">
                <div
                    class="rounded-full bg-cover bg-center w-20 h-20"
                    style="background-image:url({userInfo.images[0].url});"
                ></div>
                <h1 class="mt-6 ml-0 text-5xl font-semibold">
                    {userInfo.display_name}
                </h1>
            </div>

            <!-- links -->
            <div class="flex gap-8">
                <!-- History related block -->
                <div>
                    {#if historyFlag === null}
                        <p class="text-red-400">
                            Listening history not found (Import history) <!-- TODO: importing logic -->
                        </p>
                    {:else}
                        <h2 class="text-2xl font-semibold mb-1">
                            History links
                        </h2>
                        {#each historyLinks as { name, link }}
                            <a class="link" href={link}>{name}</a>
                        {/each}
                    {/if}
                </div>

                <!-- SpotifyAPI related block -->
                <div>
                    <h2 class="text-2xl font-semibold mb-1">
                        Spotify api links
                    </h2>
                    {#each spotifyLinks as { name, link }}
                        <a class="link" href={link}>{name}</a>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Account overview block -->
        <div class="w-full flex gap-4 flex-col lg:flex-row">
            {#await tracksPromise}
            <div class="w-full flex flex-col gap-4 lg:w-1/2">
                <h2 class="text-3xl font-semibold mb-4">Top time played</h2>
                <div class="p-2 bg-(--surface) h-96 rounded-lg animate-pulse text-transparent"></div>
            </div>
            <div class="w-full flex flex-col gap-4 lg:w-1/2">
                <h2 class="text-3xl font-semibold mb-4">Top count of plays</h2>
                <div class="p-2 bg-(--surface) h-96 rounded-lg animate-pulse text-transparent"></div>
            </div>
            {:then [msPlayedTracks, playCountTracks]}
            <div class="w-full flex flex-col lg:w-1/2">
                <h2 class="text-3xl font-semibold mb-4">Top time played</h2>
                <TopTracks data={msPlayedTracks} sort_by="ms_played" />
            </div>
            <div class="w-full flex flex-col lg:w-1/2">
                <h2 class="text-3xl font-semibold mb-4">Top count of plays</h2>
                <TopTracks data={playCountTracks} sort_by="play_count" />
            </div>
            {/await}
        </div>
    {/await}
</div>
