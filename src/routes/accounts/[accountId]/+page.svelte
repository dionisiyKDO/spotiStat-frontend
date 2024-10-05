<script lang="ts">
    import { page } from "$app/stores";
    let accountId = $page.params.accountId;

    const spotifyLinks = [
        {
            name: "Recently played",
            link: `/accounts/${accountId}/spotify/recently_played`,
        },
        {
            name: "Saved tracks",
            link: `/accounts/${accountId}/spotify/saved_tracks`,
        },
        {
            name: "Top tracks",
            link: `/accounts/${accountId}/spotify/top/tracks`,
        },
        {
            name: "Top artists",
            link: `/accounts/${accountId}/spotify/top/artists`,
        },
        {
            name: "Tracks by year",
            link: `/accounts/${accountId}/spotify/tracks_by_year`,
        },
    ];

    interface Response {
        message: string;
    }

    async function fetchCheckHistory(
        accountId: string
    ): Promise<Response | null> {
        try {
            const response = await fetch(
                `/api/db/check_history?account_id=${accountId}`
            );

            if (!response.ok) {
                const data = await response.json();
                error = data.error || "Failed to fetch user info";
                return null;
            }

            const data = (await response.json()) as Response;
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    let historyFlagReq = $derived(fetchCheckHistory(accountId));
</script>

<div>
    <h2 class="text-3xl font-semibold">{accountId}</h2>

    <!-- History related block -->
    {#await historyFlagReq}
        <p class="loading">Loading...</p>
    {:then historyFlag}
        <div class="mt-6">
            {#if historyFlag === null}
                <p style="color: darkred">
                    Listening history not found (Import history) <!-- TODO: importing logic -->
                </p>
            {:else}
                <h2 class="text-2xl font-semibold mb-4">History links</h2>
                <a class="link" href="/accounts/{accountId}/profile/">
                    Profile
                </a>
            {/if}
        </div>
    {/await}

    <!-- SpotifyAPI related block -->
    <div class="mt-4">
        <h2 class="text-2xl font-semibold mb-4">Spotify api links</h2>
        {#each spotifyLinks as { name, link }}
            <a class="link" href={link}>
                {name}
            </a>
        {/each}
    </div>
</div>
