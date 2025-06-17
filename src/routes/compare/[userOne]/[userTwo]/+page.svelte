<script lang="ts">
    import type { PageProps } from "./$types";
    import BarChart from "$lib/dashboard/BarChart.svelte";
    import TimelineChart from "$lib/dashboard/TimelineChart.svelte";
    import { fetchAllStats, numberWithCommas, type TopArtist, type TopTrack, type MostSkippedTrack, type EndReason } from "./load";

    let { data }: PageProps = $props();
    const userOne = data.userOne;
    const userTwo = data.userTwo;

    const reasonLabels: Record<string, string> = {
        trackdone: "Finished naturally",
        endplay: "Manually paused",
        fwdbtn: "Skipped (Forward)",
        backbtn: "Skipped (Back)",
        logout: "User logged out",
        remote: "Remote control",
        trackerror: "Track error",
        "unexpected-exit": "Unexpected exit",
        "unexpected-exit-while-paused": "Unexpected exit (paused)",
        unknown: "Unknown reason",
    };

    // Fetch stats for both users
    let StatsReqOne = fetchAllStats(userOne);
    let StatsReqTwo = fetchAllStats(userTwo);

    // Helper function to compare values and return comparison result
    function compareValues(valueOne: number, valueTwo: number): { winner: 'one' | 'two' | 'tie', difference: number, percentage: number } {
        if (valueOne === valueTwo) return { winner: 'tie', difference: 0, percentage: 0 };
        if (valueTwo > valueOne) {
            const percentage = valueOne > 0 ? ((valueTwo - valueOne) / valueOne) * 100 : 100;
            return { winner: 'two', difference: valueTwo - valueOne, percentage };
        } else {
            const percentage = valueTwo > 0 ? ((valueOne - valueTwo) / valueTwo) * 100 : 100;
            return { winner: 'one', difference: valueOne - valueTwo, percentage };
        }
    }

    // Summary promises
    const summaryPromise = Promise.all([StatsReqOne, StatsReqTwo]).then(([dataOne, dataTwo]) => {
        if (!dataOne || !dataTwo) return null;
        
        const tltOne = dataOne.total_listening_time;
        const tltTwo = dataTwo.total_listening_time;
        const tltComparison = compareValues(tltOne.total_listening_hours, tltTwo.total_listening_hours);
        
        const uniqOne = dataOne.unique_tracks_count;
        const uniqTwo = dataTwo.unique_tracks_count;
        const uniqComparison = compareValues(uniqOne.unique_tracks_count, uniqTwo.unique_tracks_count);
        
        const sessOne = dataOne.longest_session;
        const sessTwo = dataTwo.longest_session;
        const sessComparison = compareValues(sessOne.total_ms_played / 3600000, sessTwo.total_ms_played / 3600000);

        return {
            tlt: { one: tltOne, two: tltTwo, comparison: tltComparison },
            uniq: { one: uniqOne, two: uniqTwo, comparison: uniqComparison },
            sess: { one: sessOne, two: sessTwo, comparison: sessComparison }
        };
    });

    // Top stats promises
    const topPromise = Promise.all([StatsReqOne, StatsReqTwo]).then(([dataOne, dataTwo]) => {
        if (!dataOne || !dataTwo) return null;
        return {
            topTracks: { one: dataOne.top_tracks, two: dataTwo.top_tracks },
            topArtists: { one: dataOne.top_artists, two: dataTwo.top_artists }
        };
    });

    // Listening history promise
    const listeningHistoryPromise = Promise.all([StatsReqOne, StatsReqTwo]).then(([dataOne, dataTwo]) => {
        if (!dataOne || !dataTwo) return null;
        return {
            daily: { one: dataOne.listening_by_date, two: dataTwo.listening_by_date }
        };
    });

    // Trends promises
    const trendsPromise = Promise.all([StatsReqOne, StatsReqTwo]).then(([dataOne, dataTwo]) => {
        if (!dataOne || !dataTwo) return null;
        return {
            hourly: { one: dataOne.listening_by_hour, two: dataTwo.listening_by_hour },
            weekly: { one: dataOne.listening_by_weekday, two: dataTwo.listening_by_weekday },
            monthly: { one: dataOne.listening_by_month, two: dataTwo.listening_by_month },
            yearly: { one: dataOne.listening_by_year, two: dataTwo.listening_by_year },
        };
    });
    
    // Behavior promises
    const behaviorPromise = Promise.all([StatsReqOne, StatsReqTwo]).then(([dataOne, dataTwo]) => {
        if (!dataOne || !dataTwo) return null;
        
        const skipComparison = compareValues(dataOne.skip_stats.skip_rate, dataTwo.skip_stats.skip_rate);
        
        return {
            platf: { one: dataOne.platform_stats, two: dataTwo.platform_stats },
            skip: { one: dataOne.skip_stats, two: dataTwo.skip_stats, comparison: skipComparison }
        };
    });

    // Skip stats promises
    const skipPromise = Promise.all([StatsReqOne, StatsReqTwo]).then(([dataOne, dataTwo]) => {
        if (!dataOne || !dataTwo) return null;
        return {
            endReasons: { one: dataOne.end_reasons, two: dataTwo.end_reasons },
            skippedTracks: { one: dataOne.most_skipped_tracks, two: dataTwo.most_skipped_tracks }
        };
    });

    // Helper function to get comparison icon
    function getComparisonIcon(winner: 'one' | 'two' | 'tie'): string {
        if (winner === 'tie') return '==';
        if (winner === 'one') return '>';
        if (winner === 'two') return '<';
    }

    // Helper function to get comparison color
    function getComparisonColor(winner: 'one' | 'two' | 'tie'): string {
        if (winner === 'tie') return 'text-yellow-400';
        if (winner === 'one') return 'text-blue-400';
        if (winner === 'two') return 'text-emerald-400';
    }

</script>



<div class="space-y-5">
    <!-- Header -->
    <header class="text-center space-y-4">
        <!-- Grey text -->
        <!-- <div class="flex items-center justify-center gap-6 text-(--secondary-text) text-xl">
            <span class="w-40 px-3 py-1 bg-(--surface) rounded-lg">{userOne}</span>
            <span class="text-xl">vs</span>
            <span class="w-40 px-3 py-1 bg-(--surface) rounded-lg">{userTwo}</span>
        </div> -->

        <!-- Colored line, text and dots -->
        <!-- <div class="flex items-center justify-center gap-6">
            <div class="w-40 flex justify-end items-center gap-3 text-right px-3 py-1 bg-(--surface) rounded-lg">
                <span class="text-xl font-semibold text-blue-400">{userOne}</span>
                <div class="w-4 h-4 rounded-full bg-blue-500"></div>
            </div>
            <div class="text-2xl font-light text-(--secondary-text)">vs</div>
            <div class="w-40 flex justify-start items-center gap-3 text-left px-3 py-1 bg-(--surface) rounded-lg">
                <div class="w-4 h-4 rounded-full bg-emerald-500"></div>
                <span class="text-xl font-semibold text-emerald-400">{userTwo}</span>
            </div>
        </div>
        <div class="w-72 h-px bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto"></div> -->

        <!-- Colored line and text -->
        <div class="flex items-center justify-center gap-6">
            <div class="w-40 border border-gray-200/10  flex justify-center items-center gap-3 px-3 py-1 bg-(--surface) rounded-lg">
                <span class="text-xl font-semibold text-blue-400">{userOne}</span>
            </div>
            <div class="text-2xl font-light text-(--secondary-text)">vs</div>
            <div class="w-40 border border-gray-200/10  flex justify-center items-center gap-3 px-3 py-1 bg-(--surface) rounded-lg">
                <span class="text-xl font-semibold text-emerald-400">{userTwo}</span>
            </div>
        </div>
        <div class="w-72 h-px bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto"></div>
    </header>

    <!-- Summary Cards Comparison -->
    {#await summaryPromise}
        <p class="loading">Loading comparison data...</p>
    {:then data}
        {#if data}
            <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Total Listening Time -->
                <div class="bg-(--surface) border border-gray-200/10  shadow rounded-xl p-5">
                    <h2 class="text-sm text-(--secondary-text) mb-2">Total Listening Time</h2>
                    <!-- <div class="h-px bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto mb-2"></div> -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="text-left">
                                <p class="text-xs text-(--secondary-text)">{userOne}</p>
                                <p class="text-lg font-semibold">
                                    {numberWithCommas(data.tlt.one.total_listening_hours.toFixed(0))}h
                                </p>
                            </div>
                            <div class="flex flex-col items-center px-3">
                                <span class="text-2xl {getComparisonColor(data.tlt.comparison.winner)}">
                                    {getComparisonIcon(data.tlt.comparison.winner)}
                                </span>
                                {#if data.tlt.comparison.winner !== 'tie'}
                                    <span class="text-xs text-(--secondary-text) text-center">
                                        {data.tlt.comparison.percentage.toFixed(0)}%
                                    </span>
                                {/if}
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-(--secondary-text)">{userTwo}</p>
                                <p class="text-lg font-semibold">
                                    {numberWithCommas(data.tlt.two.total_listening_hours.toFixed(0))}h
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Unique Tracks -->
                <div class="bg-(--surface) border border-gray-200/10  shadow rounded-xl p-5">
                    <h2 class="text-sm text-(--secondary-text) mb-2">Unique Tracks</h2>
                    <!-- <div class="h-px bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto mb-2"></div> -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="text-left">
                                <p class="text-xs text-(--secondary-text)">{userOne}</p>
                                <p class="text-lg font-semibold">
                                    {numberWithCommas(data.uniq.one.unique_tracks_count)}
                                </p>
                            </div>
                            <div class="flex flex-col items-center px-3">
                                <span class="text-2xl {getComparisonColor(data.uniq.comparison.winner)}">
                                    {getComparisonIcon(data.uniq.comparison.winner)}
                                </span>
                                {#if data.uniq.comparison.winner !== 'tie'}
                                    <span class="text-xs text-(--secondary-text) text-center">
                                        {data.uniq.comparison.percentage.toFixed(0)}%
                                    </span>
                                {/if}
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-(--secondary-text)">{userTwo}</p>
                                <p class="text-lg font-semibold">
                                    {numberWithCommas(data.uniq.two.unique_tracks_count)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Longest Session -->
                <div class="bg-(--surface) border border-gray-200/10  shadow rounded-xl p-5">
                    <h2 class="text-sm text-(--secondary-text) mb-2">Longest Session</h2>
                    <!-- <div class="h-px bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto mb-2"></div> -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="text-left">
                                <p class="text-xs text-(--secondary-text)">{userOne}</p>
                                <p class="text-lg font-semibold">
                                    {(data.sess.one.total_ms_played / 3600000).toFixed(2)}h
                                </p>
                            </div>
                            <div class="flex flex-col items-center px-3">
                                <span class="text-2xl {getComparisonColor(data.sess.comparison.winner)}">
                                    {getComparisonIcon(data.sess.comparison.winner)}
                                </span>
                                {#if data.sess.comparison.winner !== 'tie'}
                                    <span class="text-xs text-(--secondary-text) text-center">
                                        {data.sess.comparison.percentage.toFixed(0)}%
                                    </span>
                                {/if}
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-(--secondary-text)">{userTwo}</p>
                                <p class="text-lg font-semibold">
                                    {(data.sess.two.total_ms_played / 3600000).toFixed(2)}h
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        {/if}
    {/await}

    <!-- Top Artists and Tracks - Side by Side -->
    {#await topPromise}
        <div class="flex justify-center">
            <div class="animate-pulse text-(--secondary-text)">Loading top stats...</div>
        </div>
    {:then data}
        {#if data}
            <section class="grid grid-cols-1 xl:grid-cols-2 gap-4">

                 <div>
                    <h2 class="ml-5 text-base text-(--secondary-text)">Top Artists</h2>
                    <div class="bg-(--surface) border border-gray-200/10 rounded-2xl px-6 py-5">

                        <div class="grid grid-cols-2 gap-6">
                            
                            {#each [[data.topArtists.one, userOne, 'blue'], [data.topArtists.two, userTwo, 'emerald']] as [artistsData, userName, color]}
                                <div class="space-y-3">
                                    <div class="flex items-center gap-2 pb-2 border-b border-{color}-500/20">
                                        <div class="w-3 h-3 rounded-full bg-{color}-500"></div>
                                        <h3 class="font-medium text-{color}-400 text-sm">{userName}</h3>
                                    </div>
                                    <ul class="space-y-2">
                                        {#each (artistsData as TopArtist[]).slice(0, 10) as { artist, total_hours, distinct_track_count }, i}
                                            <li class="flex items-center justify-between group">
                                                <div class="flex items-center gap-3 min-w-0 flex-1">
                                                    <span class="flex-shrink-0 w-6 h-6 rounded-full bg-{color}-500/10 flex items-center justify-center text-[11px] font-semibold text-{color}-400">
                                                        {i + 1}
                                                    </span>
                                                    <div class="min-w-0 flex-1">
                                                        <div class="truncate text-sm text-(--primary-text) group-hover:text-{color}-400 transition-colors" title={artist}>
                                                            {artist}
                                                        </div>
                                                        <div class="flex truncate text-xs text-(--secondary-text)">
                                                            Tracks listened: {distinct_track_count}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span class="font-medium text-sm text-(--secondary-text) ml-2">
                                                    {total_hours.toFixed(1)}h
                                                </span>
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            {/each}
                        </div>
                    </div>
                 </div>

                <div>
                    <h2 class="ml-5 text-base text-(--secondary-text)">Top Tracks</h2>
                    <div class="bg-(--surface) border border-gray-200/10 rounded-2xl px-6 py-5">
                        <div class="grid grid-cols-2 gap-6">
                            {#each [[data.topTracks.one, userOne, 'blue'], [data.topTracks.two, userTwo, 'emerald']] as [tracksData, userName, color]}
                                <div class="space-y-3">
                                    <div class="flex items-center gap-2 pb-2 border-b border-{color}-500/20">
                                        <div class="w-3 h-3 rounded-full bg-{color}-500"></div>
                                        <h3 class="font-medium text-{color}-400 text-sm">{userName}</h3>
                                    </div>
                                    <ul class="space-y-2">
                                        {#each (tracksData as TopTrack[]).slice(0, 10) as { artist, track_name, total_hours }, i}
                                            <li class="flex items-center justify-between group">
                                                <div class="flex items-center gap-3 min-w-0 flex-1">
                                                    <span class="flex-shrink-0 w-6 h-6 rounded-full bg-{color}-500/10 flex items-center justify-center text-[11px] font-semibold text-{color}-400">
                                                        {i + 1}
                                                    </span>
                                                    <div class="min-w-0 flex-1">
                                                        <div class="truncate text-sm text-(--primary-text) group-hover:text-{color}-400 transition-colors" title={`${track_name} by ${artist}`}>
                                                            {track_name}
                                                        </div>
                                                        <div class="truncate text-xs text-(--secondary-text)">
                                                            {artist}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span class="font-medium text-sm text-(--secondary-text) ml-2">
                                                    {total_hours.toFixed(1)}h
                                                </span>
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

            </section>
        {/if}
    {/await}

    <!-- Listening Timeline Comparison -->
    {#await listeningHistoryPromise}
        <p class="loading">Loading listening history...</p>
    {:then data}
        {#if data}
            <section>
                <div class="bg-(--surface) border border-gray-200/10 rounded-2xl px-6 py-5">
                    <div class="flex justify-between gap-6">
                        <h3 class="text-lg font-semibold mb-2">Timeline of Activity Comparison</h3>
                        <div class="flex items-center gap-4 mr-3 text-base">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 bg-blue-400 rounded"></div>
                                <span>{userOne}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 bg-green-400 rounded"></div>
                                <span>{userTwo}</span>
                            </div>
                        </div>
                    </div>
                    <TimelineChart
                        data={[data.daily.one, data.daily.two]}
                        yAxisLabel={"total_ms_played"}
                        xAxisLabel={"date"}
                        userLabels = {[userOne, userTwo]}
                        lineColors = {["oklch(70.7% 0.165 254.624)", "oklch(79.2% 0.209 151.711)"]} 
                    />  <!-- hardcoded tailwind blue-400 and green-400 colors -->
                </div>
            </section>
        {/if}
    {/await}

    <!-- Behavior Comparison (idontcareanymoreffs)-->
    {#await behaviorPromise}
        <p class="loading">Loading behavior stats...</p>
    {:then data}
        {#if data}            
            <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Skip Rate Comparison -->
                <div class="flex flex-col">
                    <h2 class="ml-5 text-sm text-(--secondary-text)">Skip rate</h2>
                    <div class="flex-1 bg-(--surface) border border-gray-200/10 shadow rounded-xl p-5 py-3">
                        <!-- <h2 class="text-sm text-(--secondary-text) mb-4">Skip Rate</h2> -->
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">

                                <!-- User One Stats -->
                                <div class="flex-1 text-center">
                                    <p class="text-xs text-(--secondary-text) mb-1">{userOne}</p>
                                    <p class="text-2xl font-bold ">
                                        {(data.skip.one.skip_rate * 100).toFixed(2)}%
                                    </p>
                                    <div class="space-y-0.5 text-sm text-(--secondary-text)">
                                        <p>Total Plays: {numberWithCommas(data.skip.one.total_plays)}</p>
                                        <p>Skipped: {numberWithCommas(data.skip.one.skipped_tracks)}</p>
                                    </div>
                                </div>

                                <!-- Comparison Icon -->
                                <div class="flex items-center px-2">
                                    <span class="text-4xl {getComparisonColor(data.skip.comparison.winner)}">
                                        {getComparisonIcon(data.skip.comparison.winner)}
                                    </span>
                                </div>

                                <!-- User Two Stats -->
                                <div class="flex-1 text-center">
                                    <p class="text-xs text-(--secondary-text) mb-1">{userTwo}</p>
                                    <p class="text-2xl font-bold ">
                                        {(data.skip.two.skip_rate * 100).toFixed(2)}%
                                    </p>
                                    <div class="space-y-0.5 text-sm text-(--secondary-text)">
                                        <p>Total Plays: {numberWithCommas(data.skip.two.total_plays)}</p>
                                        <p>Skipped: {numberWithCommas(data.skip.two.skipped_tracks)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Platform Usage -->
                <div class="flex flex-col">
                    <h2 class="ml-5 text-sm text-(--secondary-text)">Platform Usage</h2>
                    <div class="flex-1 bg-(--surface) border border-gray-200/10 shadow rounded-xl p-5 py-3">
                        <!-- <h2 class="text-sm text-(--secondary-text) mb-3">Platform Usage</h2> -->
                        <div class="grid grid-cols-2 gap-4">
                            <!-- User One Platforms -->
                            <div class="flex flex-col">
                                <h3 class="text-center text-xs text-(--secondary-text) mb-1">{userOne}</h3>
                                <ul class="space-y-1 text-sm">
                                    {#each data.platf.one.sort((a, b) => b.total_ms_played - a.total_ms_played) as { platform, total_ms_played }}
                                        {#if total_ms_played > 0}
                                            <li class="flex justify-between">
                                                <span class="text-(--primary-text)">{platform}</span>
                                                <span class="font-semibold tabular-nums text-xs">
                                                    {numberWithCommas((total_ms_played / 3600000).toFixed(1))}h
                                                </span>
                                            </li>
                                        {/if}
                                    {/each}
                                </ul>
                            </div>

                            <!-- User Two Platforms -->
                            <div class="flex flex-col">
                                <h3 class="text-center text-xs text-(--secondary-text) mb-1">{userTwo}</h3>
                                <ul class="space-y-1 text-sm">
                                    {#each data.platf.two.sort((a, b) => b.total_ms_played - a.total_ms_played) as { platform, total_ms_played }}
                                        {#if total_ms_played > 0}
                                            <li class="flex justify-between">
                                                <span class="font-semibold tabular-nums text-xs">
                                                    {numberWithCommas((total_ms_played / 3600000).toFixed(1))}h
                                                </span>
                                                <span class="text-(--primary-text)">{platform}</span>
                                            </li>
                                        {/if}
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        {/if}
    {/await}

    <!-- Listening Patterns Comparison -->
    {#await trendsPromise}
        <p class="loading">Loading listening patterns...</p>
    {:then data}
        {#if data}
            <section class="grid grid-cols-1 gap-6">
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h3 class="text-lg font-semibold mb-2">Hourly Patterns</h3>
                    <BarChart
                        data={[data.hourly.one, data.hourly.two]}
                        yAxisLabel="total_ms_played"
                        xAxisLabel="hour"
                        userLabels = {[userOne, userTwo]}
                        barColors = {["oklch(70.7% 0.165 254.624)", "oklch(79.2% 0.209 151.711)"]} 
                        useProportionalScaling = {true}
                    />
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h3 class="text-lg font-semibold mb-2">Weekly Patterns</h3>
                    <BarChart
                        data={[data.weekly.one, data.weekly.two]}
                        yAxisLabel="total_ms_played"
                        xAxisLabel="weekday"
                        userLabels = {[userOne, userTwo]}
                        barColors = {["oklch(70.7% 0.165 254.624)", "oklch(79.2% 0.209 151.711)"]} 
                        useProportionalScaling = {true}
                    />
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h3 class="text-lg font-semibold mb-2">Yearly Patterns</h3>
                    <BarChart
                        data={[data.yearly.one, data.yearly.two]}
                        yAxisLabel="total_ms_played"
                        xAxisLabel="year"
                        userLabels = {[userOne, userTwo]}
                        barColors = {["oklch(70.7% 0.165 254.624)", "oklch(79.2% 0.209 151.711)"]} 
                        useProportionalScaling = {false}
                    />
                </div>
                <div class="bg-(--surface) shadow rounded-xl p-4">
                    <h3 class="text-lg font-semibold mb-2">Monthly Patterns</h3>
                    <TimelineChart
                        data={[data.monthly.one, data.monthly.two]}
                        yAxisLabel="total_ms_played"
                        xAxisLabel="month"
                        userLabels = {[userOne, userTwo]}
                        lineColors = {["oklch(70.7% 0.165 254.624)", "oklch(79.2% 0.209 151.711)"]} 
                    />
                </div>
            </section>
        {/if}
    {/await}
  
    <!-- Most Skipped & End Reasons -->
    {#await skipPromise}
        <p class="loading">Loading skip stats...</p>
    {:then data}
        {#if data}
            <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Most Skipped Tracks -->
                <div>
                    <h2 class="text-sm text-(--secondary-text) text-center">Most Skipped Tracks</h2>
                    <div class="bg-(--surface) border border-gray-200/10 rounded-2xl px-6 pb-5 pt-3">
                        <div class="grid grid-cols-2 gap-6">
                            {#each [[data.skippedTracks.one, userOne, 'blue'], [data.skippedTracks.two, userTwo, 'emerald']] as [tracksData, userName, color]}
                                <div class="space-y-2">
                                    <div class="flex items-center gap-2 pb-3 border-b border-{color}-500/20">
                                        <h3 class="w-full text-center font-medium text-{color}-400 text-sm">{userName}</h3>
                                    </div>
                                    <ul class="space-y-2 text-sm">
                                        {#each (tracksData as MostSkippedTrack[]).slice(0, 10) as { artist, track_name, skip_count }, i}
                                            <li class="flex items-center justify-between group">
                                                <div class="flex items-center gap-3 min-w-0 flex-1">
                                                    <span class="flex-shrink-0 flex items-center justify-center font-semibold text-{color}-400">
                                                        {i + 1}
                                                    </span>
                                                    <div class="min-w-0 flex-1">
                                                        <div class="truncate text-sm text-(--primary-text) group-hover:text-{color}-400 transition-colors" title={`${track_name} by ${artist}`}>
                                                            {track_name}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span class="font-medium text-sm text-(--secondary-text) ml-2">
                                                    {skip_count}
                                                </span>
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            {/each}
                            
                        </div>
                    </div>
                </div>

                <!-- End Reasons -->
                <div>
                    <h2 class="text-sm text-(--secondary-text) text-center">End Reasons</h2>
                    <div class="bg-(--surface) border border-gray-200/10 rounded-2xl px-6 pb-5 pt-3">
                        <div class="grid grid-cols-2 gap-6">
                            {#each [[data.endReasons.one, userOne, 'blue'], [data.endReasons.two, userTwo, 'emerald']] as [reasonsData, userName, color]}
                                <div class="space-y-2">
                                    <div class="flex items-center gap-2 pb-3 border-b border-{color}-500/20">
                                        <h3 class="w-full text-center font-medium text-{color}-400 text-sm">{userName}</h3>
                                    </div>
                                    <ul class="space-y-2 text-sm">
                                        {#each (reasonsData as EndReason[]).slice(0, 10) as { count, reason_end }, i}
                                            <li class="flex items-center justify-between group">
                                                <div class="flex items-center gap-3 min-w-0 flex-1">
                                                    <span class="flex-shrink-0 flex items-center justify-center font-semibold text-{color}-400">
                                                        {i + 1}
                                                    </span>
                                                    <div class="min-w-0 flex-1">
                                                        <div class="truncate text-sm text-(--primary-text) group-hover:text-{color}-400 transition-colors" title={reason_end}>
                                                            {reasonLabels[reason_end] || reason_end}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span class="font-medium text-sm text-(--secondary-text) ml-2">
                                                    {count.toLocaleString()}
                                                </span>
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            {/each}
                            
                        </div>
                    </div>
                </div>
            </section>
        {/if}
    {/await}
    
</div>