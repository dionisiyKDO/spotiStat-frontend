<script>
    let { loggedIn, accountId } = $props();
</script>


<header class="p-6 pb-4 mb-8 border-b border-gray-500">
    <nav class="flex items-center justify-between">
        <a class="block" href="/"><strong>SpotiStat</strong></a>
        <ul class="list-none flex gap-4">
            {#if loggedIn === true}
                <li><a href="/accounts/{accountId}">Profile</a></li>
                <li><a href="/api/auth/logout">Logout</a></li>
            {:else if loggedIn === false}
                <li><a href="/api/auth/login">Login with Spotify</a></li>
            {/if}
        </ul>
    </nav>
</header>
