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

    let mostSkippedTracksReq = fetchMostSkippedTracks();
    let endReasonsReq = fetchEndReasons();

    const summaryPromise = Promise.all([
        fetchTotalListeningTime(),
        fetchUniqueTracksCount(),
        fetchListeningSessions(),
    ]);
    const trendsPromise = Promise.all([
        fetchHourlyTrends(),
        fetchWeeklyTrends(),
        fetchDailyTrends(),
    ]);
    const behaviorPromise = Promise.all([
        fetchPlatformStats(),
        fetchSkipStats(),
    ]);
</script>

<div>
    <div class="space-y-8">
        <!-- Dashboard Header -->
        <header class="flex mb-0 justify-between items-center">
            <h1 class="text-3xl font-bold">Listening Dashboard</h1>
            
            <!-- Links -->
            <div class="flex"> 
                {#each historyLinks as { name, link }}
                    <a class="link" href={link}>{name}</a>
                {/each}
            </div>
            <!-- <footer class="pt-8 border-t mt-12">
                <h3 class="text-lg font-semibold mb-4">Explore Detailed Stats</h3>
                <div class="flex flex-wrap gap-4">
                <a href="/dashboard/track" class="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200">Track Stats</a>
                <a href="/dashboard/artist" class="bg-green-100 text-green-800 px-4 py-2 rounded hover:bg-green-200">Artist Stats</a>
                <a href="/dashboard/trends" class="bg-purple-100 text-purple-800 px-4 py-2 rounded hover:bg-purple-200">Trends</a>
                <a href="/dashboard/compare" class="bg-gray-800 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">Compare</a>
                </div>
            </footer> -->
        </header>
        <hr class="mt-4">

        <!-- Summary Cards -->
        {#await summaryPromise}
            <p class="loading">Loading Total Listening Time...</p>
        {:then [tltData, uniqData, sessData]}
            <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h2 class="text-sm text-(--secondary-text)">Total Listening Time</h2>
                    <div class="flex gap-3 text-2xl">
                        <p class="font-semibold mt-1">{numberWithCommas(tltData.total_listening_days.toFixed(0))}d</p>
                        <p class="mt-1"> or </p> 
                        <p class="font-semibold mt-1">{numberWithCommas(tltData.total_listening_hours.toFixed(0))}h</p>
                    </div>
                    <!-- <ul class="grid grid-cols-2">
                        <li class="text-2xl font-semibold mt-1">{numberWithCommas(tltData.total_listening_days.toFixed(0))}d</li>
                        <li class="text-2xl font-semibold mt-1">{numberWithCommas(tltData.total_listening_hours.toFixed(0))}h</li>
                        <li class="text-2xl font-semibold mt-1">{numberWithCommas(tltData.total_listening_minutes.toFixed(0))}m</li>
                    </ul> -->
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h2 class="text-sm text-(--secondary-text)">Unique Tracks</h2>
                    <p class="text-2xl font-semibold mt-1">{numberWithCommas(uniqData.unique_tracks_count)}</p>
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h2 class="text-sm text-(--secondary-text)">Top Artist</h2>
                    <p class="text-2xl font-semibold mt-1">[Porter Robinson]</p>
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h2 class="text-sm text-(--secondary-text)">Longest Session</h2>
                    <p class="text-2xl font-semibold mt-1">{(sessData.total_ms_played / 3600000).toFixed(2)}h</p>
                    <!-- <ul class="mx-auto">
                        <li>Session start: {longestSession.session_start} </li>
                        <li>Session end: {longestSession.session_end}</li>
                        <li>Total Hours played: {(longestSession.total_ms_played / 3600000).toFixed(2)} hours</li>
                        <li>Total tracks: {longestSession.total_tracks}</li>
                    </ul> -->
                </div>
            </section>
        {/await}

        <!-- Trends Area -->
        {#await trendsPromise}
            <p class="loading">Loading Hourly Trends...</p>
        {:then [hourlyTrends, weeklyTrends, dailyTrends]}
            
            <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-6">
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h3 class="text-lg font-semibold mb-2">Hourly Listening Pattern</h3>
                    <D3BarChart data={hourlyTrends} yAxisLabel={'total_ms_played'} xAxisLabel={'hour'} />
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h3 class="text-lg font-semibold mb-2">Day-of-Week Listening</h3>
                    <D3BarChart data={weeklyTrends} yAxisLabel={'total_ms_played'} xAxisLabel={'day_of_week'} />
                </div>
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4 flex flex-col">
                    <h3 class="text-lg font-semibold mb-2">Timeline of Activity</h3>
                    <D3TimelineChart data={dailyTrends} yAxisLabel={'total_ms_played'} xAxisLabel={'days'} />
                </div>
            </section>
        {/await}

        <!-- Behavior Insights -->
        {#await behaviorPromise}
            <p class="loading">Loading Total Platform stats...</p>
        {:then [platfData, skipStats]}
            <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                    <h2 class="text-sm text-(--secondary-text) mb-1">Platform Usage</h2>
                    <!-- <div class="h-48 bg-gray-800 rounded">[Bar Graph Placeholder]</div> -->
                    <ul class="mx-auto">
                        {#each platfData.sort((a, b) => b.total_ms_played - a.total_ms_played) as { platform, play_count, total_ms_played }}
                            {#if play_count > 0}
                                <li><strong>{platform}</strong>: {numberWithCommas((total_ms_played / 3600000).toFixed(2))}h</li>
                            {/if}
                        {/each}
                    </ul>
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h2 class="text-sm text-(--secondary-text) mb-1">Skip Stats</h2>
                    <ul class="text-base space-y-1">
                        <li><strong>Total Plays:</strong> {numberWithCommas(skipStats.total_plays.toString())}</li>
                        <li><strong>Skipped Tracks:</strong> {numberWithCommas(skipStats.skipped_tracks.toString())}</li>
                        <li><strong>Skip Rate:</strong> {(skipStats.skip_rate * 100).toFixed(2)}%</li>
                    </ul>
                </div>
            </section>
        {/await}

        <!-- Future Expansion -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-(--surface) shadow rounded-xl p-4">
                <h3 class="text-lg font-semibold mb-2">Listening Sessions</h3>
                <div class="h-36 rounded">[Session Data Placeholder]</div>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4">
                <h3 class="text-lg font-semibold mb-2">Genre Distribution</h3>
                <div class="h-36 rounded">[Pie or Bar Placeholder]</div>
            </div>
        </section>
    </div>


    <!-- <hr class="mt-4"> -->

    <!-- {#await mostSkippedTracksReq}
        <p class="loading">Loading Most Skipped Tracks...</p>
    {:then mstData}
        <h2 class="text-2xl font-semibold mb-1 mx-auto">Most Skipped Tracks</h2>
        <TrackListPage Tracks={mstData} />
    {/await} -->

    <!-- TODO: Think what to do -->
    <!-- {#await endReasonsReq}
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
    {/await} -->
        
</div>



