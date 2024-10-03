<script>
    import { page } from '$app/stores';
    let accountId = $page.params.accountId; 

    let message = $state('');
    let error = $state('');

    const spotifyLinks = [
        {
            name: 'Recently played',
            link: `/accounts/${accountId}/spotify/recently_played`
        },
        {
            name: 'Saved tracks',
            link: `/accounts/${accountId}/spotify/saved_tracks`
        },
        {
            name: 'Top tracks',
            link: `/accounts/${accountId}/spotify/top_tracks`
        },
        {
            name: 'Top artists',
            link: `/accounts/${accountId}/spotify/top_artists`
        },
        {
            name: 'Tracks by year',
            link: `/accounts/${accountId}/spotify/tracks_by_year`
        }
    ];

    async function fetchCheckHistory() {
        try {
            // const response = await fetch(`/api/db/check_history?account_id=${message}`);
            const response = await fetch(`/api/db/check_history?account_id=${accountId}`);
            const data = await response.json();
            
            if (!response.ok) {
                error = data.error || 'Failed to fetch user info';
            } else {
                message = data.message;
            }
        } catch (err) {
            error = err;
        }
    }

    $effect(() => {
        fetchCheckHistory()
    });

</script>


<div>
    
    <h2 class="text-3xl font-semibold">{accountId}</h2>
    
    <!-- History related block -->
    <div class="mt-6">
        {#if error}
            <p style="color: darkred">{error}</p> <!-- TODO: normal advice to import account listening history -->
        {:else if message}
            <h2 class="text-2xl font-semibold mb-4 ">History links</h2>
            <a class="link" href="/accounts/{accountId}/profile/">Profile</a>
        {/if}
    </div>

    <!-- SpotifyAPI related block -->
    <div class="mt-4">
        <h2 class="text-2xl font-semibold mb-4 ">Spotify api links</h2>
        {#each spotifyLinks as {name, link}}
            <a class="link" href={link}>
                {name}
            </a>
        {/each}
    </div>

</div>



