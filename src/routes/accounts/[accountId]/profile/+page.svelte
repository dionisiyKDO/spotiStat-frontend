<script lang="ts">
    import { page } from "$app/stores";
    import TopPlayedTracks from "./top_played_tracks.svelte";
    import TopCountOfPlays from "./top_count_of_plays.svelte";
    import TopTracks from "./top_tracks.svelte";

    let accountId = $page.params.accountId;

    interface UserInfo {
        display_name: string;
        email: string;
        external_urls: ExternalUrls;
        followers: Followers;
        href: string;
        id: string;
        images: Image[];
        type: string;
        uri: string;
    }

    interface ExternalUrls {
        spotify: string;
    }

    interface Followers {
        href: any;
        total: number;
    }

    interface Image {
        height: number;
        url: string;
        width: number;
    }

    async function fetchUserInfo(): Promise<UserInfo | null> {
        try {
            const response = await fetch("/api/spotify/profile");
            if (!response.ok) {
                const data = await response.json();
                const error = data.error || "Failed to fetch user info";
                console.log(error);
                return null;
            }
            
            const data = await response.json() as { user_info: UserInfo };
            return data.user_info;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    let userInfoReq = $derived(fetchUserInfo());
</script>

{#await userInfoReq}
    <p class="loading">Loading Profile...</p>
{:then userInfo} 
    <div>
        <div class="p-4 flex items-center gap-4">
            <div
                class="rounded-full bg-cover bg-center w-24 h-24"
                style="background-image:url({userInfo.images[1].url});"
            ></div>
            <h1 class="mt-3 text-5xl font-semibold">{userInfo.display_name}</h1>
        </div>

        <a class="link" href="/accounts/{accountId}/profile/track_stats"
            >Track stats</a
        >
        <a class="link" href="/accounts/{accountId}/profile/artist_stats"
            >Artist stats</a
        >

        <div class="w-full flex gap-4 flex-col lg:flex-row">
            <div class="w-full flex flex-col gap-4 lg:w-1/2">
                <TopTracks limit={10} sortBy="total_ms_played" />
            </div>
            <div class="w-full flex flex-col gap-4 lg:w-1/2">
                <TopTracks limit={10} sortBy="play_count" />
            </div>
        </div>
    </div>
{/await}
