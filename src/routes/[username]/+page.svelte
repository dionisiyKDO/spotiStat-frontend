<script lang="ts">
	import type { PageProps } from './$types';
    import BarChart from "$lib/dashboard/BarChart.svelte";
    import TimelineChart from "$lib/dashboard/TimelineChart.svelte";
    import { fetchAllStats } from "./load";

    let { data }: PageProps = $props();
    const username = data.username

    const historyLinks = [
        {
            name: "Track stats",
            link: `/${username}/tracks`,
        },
        {
            name: "Artist stats",
            link: `/${username}/artists`,
        },
    ];


    async function reqUploadHistory() {
        try {
            const response = await fetch(`/api/db/upload_history?username=${username}`);
            if (!response.ok) {
                const data = await response.json();
                const error = data.error || "Failed to fetch total listening time";
                console.log(error);
                return null;
            }

            const data = (await response.json());
            console.log(data);
            
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    let StatsReq = fetchAllStats(username);

    const summaryPromise    = StatsReq.then(data => ({
        tltData: data.total_listening_time, 
        uniqData: data.unique_tracks_count, 
        sessData: data.longest_session,
        topTracks: data.top_tracks,
        topArtists: data.top_artists,
    }));
    const trendsPromise     = StatsReq.then(data => ({
        hourlyTrends: data.listening_by_hour, 
        weeklyTrends: data.listening_by_weekday, 
        monthsTrends: data.listening_by_month, 
        yearlyTrends: data.listening_by_year, 
        dailyTrends: data.listening_by_date,
    }));
    const behaviorPromise   = StatsReq.then(data => ({
        platfData: data.platform_stats, 
        skipStats: data.skip_stats,
        }));
</script>

<div>
    <div class="space-y-8">
        <!-- Dashboard Header -->
        <header class="flex mb-0 justify-between items-center">
            <h1 class="text-3xl font-bold">Listening Dashboard</h1>
            
            <button class="link cursor-pointer" onclick={reqUploadHistory} >
                Upload History
            </button>
            
            <!-- Links -->
            <div class="flex"> 
                {#each historyLinks as { name, link }}
                    <a class="link" href={link}>{name}</a>
                {/each}
            </div>
        </header>
        <hr class="mt-4">

        <!-- Summary Cards -->
        {#await summaryPromise}
            <p class="loading">Loading Total Listening Time...</p>
        {:then {tltData, uniqData, sessData, topTracks, topArtists}}
            <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h2 class="text-sm text-(--secondary-text)">Total Listening Time</h2>
                    <div class="flex gap-2 text-2xl">
                        <p class="font-semibold mt-1">{numberWithCommas(tltData.total_listening_days.toFixed(0))}d</p>
                        <p class="mt-1"> or </p> 
                        <p class="font-semibold mt-1">{numberWithCommas(tltData.total_listening_hours.toFixed(0))}h</p>
                    </div>
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h2 class="text-sm text-(--secondary-text)">Unique Tracks</h2>
                    <p class="text-2xl font-semibold mt-1">{numberWithCommas(uniqData.unique_tracks_count)}</p>
                </div>

                <!-- TODO: Make top artist and top tracks list 5 elemts instead of one name -->
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h2 class="text-sm text-(--secondary-text)">Top Artist</h2>
                    <p class="text-2xl font-semibold mt-1">[Porter]</p>
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
        {:then {hourlyTrends, weeklyTrends, dailyTrends, yearlyTrends, monthsTrends}}
            
            <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <!-- Weird behavior with col-span-2 -->
                <div class="bg-(--surface) shadow rounded-xl p-4 flex flex-col col-span-2">
                <!-- <div class="bg-(--surface) shadow rounded-xl p-4 flex flex-col"> -->
                    <h3 class="text-lg font-semibold mb-2">Timeline of Activity</h3>
                    <TimelineChart data={dailyTrends} yAxisLabel={'total_ms_played'} xAxisLabel={'date'} />
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h3 class="text-lg font-semibold mb-2">Hourly Listening Pattern</h3>
                    <BarChart data={hourlyTrends} yAxisLabel={'total_ms_played'} xAxisLabel={'hour'} />
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h3 class="text-lg font-semibold mb-2">Day-of-Week Listening Pattern</h3>
                    <BarChart data={weeklyTrends} yAxisLabel={'total_ms_played'} xAxisLabel={'weekday'} />
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h3 class="text-lg font-semibold mb-2">Yearly Listening Pattern</h3>
                    <BarChart data={yearlyTrends} yAxisLabel={'total_ms_played'} xAxisLabel={'year'} />
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h3 class="text-lg font-semibold mb-2">Monthly Listening Pattern</h3>
                    <TimelineChart data={monthsTrends} yAxisLabel={'total_ms_played'} xAxisLabel={'month'} />
                </div>
            </section>
        {/await}

        <!-- Behavior Insights -->
        {#await behaviorPromise}
            <p class="loading">Loading Total Platform stats...</p>
        {:then {platfData, skipStats}}
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
        <!-- <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-(--surface) shadow rounded-xl p-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">Listening Sessions</h2>
                <div class="h-36 rounded">[Session Data Placeholder]</div>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">Genre Distribution</h2>
                <div class="h-36 rounded">[Pie or Bar Placeholder]</div>
            </div>
        </section> -->
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



