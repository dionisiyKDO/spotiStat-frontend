<script>
    import { fetchUserInfo } from "./auth";
    let { loggedIn, username } = $props();

    const userReq = fetchUserInfo();
</script>


<!-- <header class="p-6 pb-4 mb-6 border-b border-gray-500"> -->
<header class="p-4 mb-2 border-b border-gray-500">
    <nav class="flex items-center justify-between">
        <div class="flex gap-4">
            <h1 class="text-2xl"><a class="block" href="/"><strong>SpotiStat</strong></a></h1>
            <strong class="text-2xl">|</strong>
            {#await userReq then userInfo}
                <div class="flex gap-2">
                    <h1 class="mt-0 ml-0 text-2xl font-semibold">
                        {userInfo.display_name}
                    </h1>
                </div>
            {/await}
        </div>

        <ul class="list-none flex gap-4">
            {#if loggedIn === true}
                <li><a href="/{username}">Profile</a></li>
                <li><a href="/api/auth/logout">Logout</a></li>
            {:else if loggedIn === false}
                <li><a href="/api/auth/login">Login with Spotify</a></li>
            {/if}
        </ul>
    </nav>
</header>
