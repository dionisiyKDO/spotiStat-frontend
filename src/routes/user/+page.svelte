<script>
    import TopPlayedTracks from "./top_played_tracks.svelte";
    import TopCountOfPlays from "./top_count_of_plays.svelte";

    let user_info = $state([]);

    let user_nickname = $state('');
    let avatar_url = $state('');
    let avatar_height = $state(0);
    let avatar_width = $state(0);
    let error = $state('');
    
    async function fetchUserInfo() {
        try {
            const response = await fetch('/api/spotify/profile');
            const data = await response.json();
            if (!response.ok) {
                error = data.error || 'Failed to fetch user info';
            } else {
                user_info = data.user_info;

                user_nickname = user_info.display_name;
                avatar_url = user_info.images[1].url;
                avatar_height = 100;
                avatar_width  = 100;
            }
        } catch (err) {
            error = err;
        }
    }
    // TODO: at backend add meta info about track like name, artist, popularity, etc

    
    $effect(() => {
        fetchUserInfo()
    });
</script>


{#if error}
    <p style="color: darkred">{error}</p>
{:else}
    <div>

        <div class="p-4 flex items-center gap-4">
            <div class="rounded-full bg-cover bg-center w-24 h-24" style="background-image:url({avatar_url});"></div>
            <h1 class="mt-3 text-5xl font-semibold">{user_nickname}</h1>
        </div>

        <a class="link" href="/user/track_stats">Track stats</a>

        <div class="w-full flex gap-4 flex-col lg:flex-row">
            <div class="w-full flex flex-col gap-4 lg:w-1/2">
                <TopPlayedTracks />
            </div>
            <div class="w-full flex flex-col gap-4 lg:w-1/2">
                <TopCountOfPlays />
            </div>
        </div>

    </div>
{/if}


<style>

</style>