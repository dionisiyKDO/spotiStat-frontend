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
            const response = await fetch('/api/user_info');
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

    
    $effect(() => {
        fetchUserInfo()
    });
</script>


{#if error}
    <p style="color: darkred">{error}</p>
{:else}
    <div>
        <div class="profile-header">
            <image class="avatar" style="height: {avatar_height}px; width: {avatar_width}px;" src={avatar_url} />
            <h1>{user_nickname}</h1>
        </div>
        <div class="profile-content">
            <div class="section">
                <div class="section-column">
                    <TopPlayedTracks />
                </div>
                <div class="section-column">
                    <TopCountOfPlays />
                </div>
            </div>
        </div>
    </div>
{/if}


<style>
    .profile-content {
        padding: 1rem;
        display: flex;
        gap: 1rem;
    }

    .section {
        width: 100%;
        display: flex;
        gap: 1rem;
        flex-direction: row;
    }

    .section-column {
        width: 50%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
   }

   @media (max-width: 1024px) {
        .section { 
            flex-direction: column;
        }
        .section-column {
            width: 100%;
        }
   }

    .profile-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    .profile-header h1 {
        font-size: 3em;
        margin: 0;
    }
    .avatar {
        border-radius: 50%;
        object-fit: cover;
    }
</style>