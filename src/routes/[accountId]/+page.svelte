<script lang="ts">
    import D3BarChart from "$lib/overview/D3BarChart.svelte";
    import D3TimelineChart from "$lib/overview/D3TimelineChart.svelte";
    import { fetchUserInfo } from "$lib/auth";
    import {
        fetchTotalListeningTime,
        fetchPlatformStats,
        fetchMostSkippedTracks,
        fetchSkipStats,
        fetchEndReasons,
        fetchUniqueTracksCount,
        fetchListeningSessions,
        fetchDailyTrends,
        fetchHourlyTrends,
        fetchWeeklyTrends,
        type ListeningSession,
    } from "./load";

    let { accountId } = $props();

    const historyLinks = [
        {
            name: "Track stats",
            link: `/${accountId}/tracks`,
        },
        {
            name: "Artist stats",
            link: `/${accountId}/artists`,
        },
    ];

    const userReq = fetchUserInfo();

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    let totalListeningTimeReq = fetchTotalListeningTime();
    let platformStatsReq = fetchPlatformStats();
    let skipStatsReq = fetchSkipStats();
    let uniqueTracksCountReq = fetchUniqueTracksCount();
    let longestListeningSessionsReq = fetchListeningSessions();
    let mostSkippedTracksReq = fetchMostSkippedTracks();
    let endReasonsReq = fetchEndReasons();
    let hourlyTrendsReq = fetchHourlyTrends();
    let weeklyTrendsReq = fetchWeeklyTrends();
    let dailyTrendsReq = fetchDailyTrends();
</script>

<div>
    {#await userReq}
        <div class="flex items-center justify-center">
            <p class="font-bold text-2xl text-center mt-10 mb-4">
                Loading Profile...
            </p>
        </div>
    {:then userInfo}
        <div class="flex"> <!-- links -->
            {#each historyLinks as { name, link }}
                <a class="link" href={link}>{name}</a>
            {/each}
        </div>
        <hr class="mt-4">
    {/await}

    <div class="flex flex-col gap-10">
        <h1 class="text-3xl font-semibold mb-2 inline-block">{accountId} Overview</h1>

        <!-- Total Listening Time Section -->
        <div class="min-h-12 grid grid-cols-2 lg:grid-cols-3 gap-6 grid-flow-row bg-(--surface) rounded-lg p-4 w-full">
            
            {#await totalListeningTimeReq}
                <p class="loading">Loading Total Listening Time...</p>
            {:then tltData}
                <div class="flex flex-col w-full text-center">
                    <h2 class="text-2xl font-semibold mb-1">Total listening time</h2>
                    <ul class="mx-auto">
                        <li>{numberWithCommas(tltData.total_listening_days.toFixed(2))} Days</li>
                        <li>{numberWithCommas(tltData.total_listening_hours.toFixed(2))} Hours</li>
                        <li>{numberWithCommas(tltData.total_listening_minutes.toFixed(2))} Minutes</li>
                    </ul>
                </div>
            {/await}

            {#await platformStatsReq}
                <p class="loading">Loading Total Platform stats...</p>
            {:then psData}
                <div class="flex flex-col w-full text-center">
                    <h2 class="text-2xl font-semibold mb-1">Listening on each Platforms</h2>
                    <ul class="mx-auto">
                        {#each psData.sort((a, b) => b.total_ms_played - a.total_ms_played) as { platform, play_count, total_ms_played }}
                            {#if play_count > 0}
                                <li>{numberWithCommas((total_ms_played / 3600000).toFixed(2))} Hours on {platform}</li>
                            {/if}
                        {/each}
                    </ul>
                </div>
            {/await}

            

            {#await skipStatsReq}
                <p class="loading">Loading Skip Stats...</p>
            {:then skipStats}
                <div class="flex flex-col w-full text-center">
                    <h2 class="text-2xl font-semibold mb-1">Skip Stats</h2>
                    <ul class="mx-auto">
                        <li>Total Plays: {numberWithCommas(skipStats.total_plays.toString())}</li>
                        <li>Skipped Tracks: {numberWithCommas(skipStats.skipped_tracks.toString())}</li>
                        <li>Skip Rate: {(skipStats.skip_rate * 100).toFixed(2)}%</li>
                    </ul>
                </div>
            {/await}

            

            {#await uniqueTracksCountReq}
                <p class="loading">Loading Unique Tracks Count...</p>
            {:then uniqueTracks}
                <div class="flex flex-col w-full text-center">
                    <h2 class="text-2xl font-semibold mb-1">Unique Tracks Count</h2>
                    <ul class="mx-auto">
                        <li>Unique Tracks: {uniqueTracks.unique_tracks_count}</li>
                    </ul>
                </div>
            {/await}

            {#await longestListeningSessionsReq}
                <p class="loading">Loading Listening Sessions...</p>
            {:then longestSession}
                <div class="flex flex-col w-full text-center">
                    <h2 class="text-2xl font-semibold mb-1">Longest listening Session</h2>
                    <ul class="mx-auto">
                        <li>Session start: {longestSession.session_start} </li>
                        <li>Session end: {longestSession.session_end}</li>
                        <li>Total Hours played: {(longestSession.total_ms_played / 3600000).toFixed(2)} hours</li>
                        <li>Total tracks: {longestSession.total_tracks}</li>
                    </ul>
                </div>
            {/await}

        </div>


        {#await mostSkippedTracksReq}
            <p class="loading">Loading Most Skipped Tracks...</p>
        {:then mstData}
            <h2 class="text-2xl font-semibold mb-1 mx-auto">Most Skipped Tracks</h2>
            <!-- <TrackListPage Tracks={mstData} /> -->
        {/await}

        <!-- TODO: Think what to do -->
        {#await endReasonsReq}
            <p class="loading">Loading End Reasons...</p>
        {:then endReasons}
            <div class="flex flex-col w-full text-center">
                <h2 class="text-2xl font-semibold mb-1">End Reasons</h2>
                <ul class="mx-auto">
                    {#each endReasons as { reason_end, count }}
                        <li>{reason_end}: {count} times</li>
                    {/each}
                </ul>
            </div>
        {/await}
        

        <!-- TODO: graphs -->
        <!-- Hourly Trends -->
        <h2 class="text-2xl font-semibold mb-1">Hourly Trends</h2>
        {#await hourlyTrendsReq}
            <p class="loading">Loading Hourly Trends...</p>
        {:then hourlyTrends}
            <D3BarChart data={hourlyTrends} yAxisLabel={'total_ms_played'} xAxisLabel={'hour'} />
        {/await}

        <!-- Weekly Trends -->
        <h2 class="text-2xl font-semibold mb-1">Weekly Trends</h2>
        {#await weeklyTrendsReq}
            <p class="loading">Loading Weekly Trends...</p>
        {:then weeklyTrends}
            <D3BarChart data={weeklyTrends} yAxisLabel={'total_ms_played'} xAxisLabel={'day_of_week'} />
        {/await}

        <!-- Daily Trends -->
        <h2 class="text-2xl font-semibold mb-1">Daily Trends</h2>
        {#await dailyTrendsReq}
            <p class="loading">Loading Daily Trends...</p>
        {:then dailyTrends}
            <D3TimelineChart data={dailyTrends} yAxisLabel={'total_ms_played'} xAxisLabel={'days'} />
        {/await}

    </div>

</div>



