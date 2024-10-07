<script lang="ts">
    import { page } from "$app/stores";
    import { fetchUserInfo, fetchCheckHistory } from "./load";
    import TopTracks from "$lib/TopTracks.svelte";
    let accountId = $page.params.accountId;

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
            link: `/${accountId}/history/track_stats`,
        },
        {
            name: "Artist stats",
            link: `/${accountId}/history/artist_stats`,
        },
        {
            name: "OverView",
            link: `/${accountId}/history/overview`,
        },
    ];

    let historyFlagReq = $derived(fetchCheckHistory(accountId));
    let userInfoReq = $derived(fetchUserInfo());
</script>

<div>
    <!-- Profile related block -->
    {#await userInfoReq}
        <p class="loading">Loading Profile...</p>
    {:then userInfo} 
        <!-- Profile head -->
        <div>

            <!-- avatar -->
            <div class="p-4 flex gap-4">
                <div
                    class="rounded-full bg-cover bg-center w-20 h-20"
                    style="background-image:url({userInfo.images[1].url});"
                ></div>
                <h1 class="mt-6 ml-0 text-5xl font-semibold">{userInfo.display_name}</h1>
            </div>

            <!-- links -->
            <div class="flex gap-8">
                
                <!-- History related block -->
                <div>
                    {#await historyFlagReq}
                        <p class="loading">Checking history existance...</p>
                    {:then historyFlag}
                        {#if historyFlag === null}
                            <p style="color: darkred">
                                Listening history not found (Import history) <!-- TODO: importing logic -->
                            </p>
                        {:else}
                            <h2 class="text-2xl font-semibold mb-1">History links</h2>
                            {#each historyLinks as { name, link }}
                                <a class="link" href={link}>{name}</a>
                            {/each}
                        {/if}
                    {/await}
                </div>

                <!-- SpotifyAPI related block -->
                <div>
                    <h2 class="text-2xl font-semibold mb-1">Spotify api links</h2>
                    {#each spotifyLinks as { name, link }}
                        <a class="link" href={link}>{name}</a>
                    {/each}
                </div>
            </div>

        </div>

        <!-- Account overview block -->
        <div class="w-full flex gap-4 flex-col lg:flex-row">
            <div class="w-full flex flex-col gap-4 lg:w-1/2">
                <TopTracks limit={10} sortBy="total_ms_played" />
            </div>
            <div class="w-full flex flex-col gap-4 lg:w-1/2">
                <TopTracks limit={10} sortBy="play_count" />
            </div>
        </div>
    {/await}

</div>
