<script lang="ts">
    interface Props {
        username: string;
    }
    interface Meta {
        stats_exist: boolean
        last_calculated: string
    }

    let { username }: Props = $props();

    const historyLinks = [
        {
            name: "Profile",
            link: `/${username}`,
        },
        {
            name: "Track stats",
            link: `/${username}/tracks`,
        },
        {
            name: "Artist stats",
            link: `/${username}/artists`,
        },
    ];

    export async function fetchStatsStatus(username: string): Promise<Meta | null> {
        try {
            const response = await fetch(`/api/db/stats/${username}/status`);
            if (!response.ok) {
                const data = await response.json();
                const error = data.error || "Failed to fetch stats";
                console.log(error);
                return null;
            }

            const data: Meta = await response.json();
            return data;
        } catch (err) {
            console.error("Network or parsing error in fetchAllStats():", err);
            return null;
        }
    }

    const metaReq = fetchStatsStatus(username);

</script>


<!-- <header class="p-6 pb-4 mb-6 border-b border-gray-500"> -->
<header class="px-4 py-2 mb-2 border-b border-gray-500">
    {#if username}

        <!-- Header -->
        <nav class="flex items-center justify-between">
            <div class="flex flex-col">
                <h1 class="text-3xl font-bold">Listening Dashboard</h1>
                {#await metaReq}
                    <p class="loading">Loading Total Listening Time...</p>
                {:then {stats_exist, last_calculated}}
                    <h2 class="text-sm text-(--secondary-text)">Calculated at: {new Date(last_calculated).toLocaleString()}</h2>
                {/await}
            </div>
            <!-- Links -->
            <div class="flex"> 
                {#each historyLinks as { name, link }}
                    <a class="text-base text-(--secondary-text) hover:text-(--primary-text-hover) px-3 py-1 transition duration-150"
                    href={link}>{name}</a>
                {/each}
            </div>
        </nav>


    {:else}
        
        <!-- Header for the /compare page -->
        <nav class="flex items-center justify-between">
            <div class="flex flex-col">
                <h1 class="text-3xl font-bold">Listening Dashboard</h1>
            </div>
        </nav>
    {/if}
   
</header>
