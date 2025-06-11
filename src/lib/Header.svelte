<script>
    import { checkLoginStatus } from "./auth";

    const userReq = checkLoginStatus();
    userReq.then((d)=>{
        console.log(d);
    })
</script>


<!-- <header class="p-6 pb-4 mb-6 border-b border-gray-500"> -->
<header class="p-4 mb-2 border-b border-gray-500">
    <nav class="flex items-center justify-between">
        {#await userReq then userInfo}
            <div class="flex gap-4">
                <h1 class="text-2xl"><a class="block" href="/"><strong>SpotiStat</strong></a></h1>
                {#if userInfo.logged_in === true}
                    <strong class="text-2xl">|</strong>
                    <div class="flex gap-2">
                        <h1 class="mt-0 ml-0 text-2xl font-semibold">
                            {userInfo.username}
                        </h1>
                    </div>
                {/if}
                
            </div>

            <ul class="list-none flex gap-4">
                {#if userInfo.logged_in === true}
                    <li><a href="/{userInfo.username}">Profile</a></li>
                    <li><a href="/api/auth/logout">Logout</a></li>
                {:else if userInfo.logged_in === false}
                    <li><a href="/login">Login with Spotify</a></li>
                {/if}
            </ul>
        {/await}
    </nav>
</header>
