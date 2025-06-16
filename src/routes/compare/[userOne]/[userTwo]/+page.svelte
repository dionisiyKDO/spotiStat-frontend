<script lang="ts">
    import type { PageProps } from "./$types";
    import BarChart from "$lib/dashboard/BarChart.svelte";
    import TimelineChart from "$lib/dashboard/TimelineChart.svelte";
    import { fetchAllStats, numberWithCommas } from "./load";

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



<div class="space-y-8">
    <!-- Header -->
    <!-- Grey text -->
    <!-- <header class="text-center space-y-4">
        <div class="flex items-center justify-center gap-6 text-(--secondary-text) text-xl">
            <span class="w-40 px-3 py-1 bg-(--surface) rounded-lg">{userOne}</span>
            <span class="text-xl">vs</span>
            <span class="w-40 px-3 py-1 bg-(--surface) rounded-lg">{userTwo}</span>
        </div>
    </header> -->

    <!-- Colored line, text and dots -->
    <!-- <header class="text-center space-y-4">
        <div class="flex items-center justify-center gap-6">
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
        <div class="w-72 h-px bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto"></div>
    </header> -->

    <!-- Colored line and text -->
    <header class="text-center space-y-4">
        <div class="flex items-center justify-center gap-6">
            <div class="w-40 flex justify-center items-center gap-3 px-3 py-1 bg-(--surface) rounded-lg">
                <span class="text-xl font-semibold text-blue-400">{userOne}</span>
            </div>
            <div class="text-2xl font-light text-(--secondary-text)">vs</div>
            <div class="w-40 flex justify-center items-center gap-3 px-3 py-1 bg-(--surface) rounded-lg">
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
                <div class="bg-(--surface) shadow rounded-xl p-5">
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
                <div class="bg-(--surface) shadow rounded-xl p-5">
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
                <div class="bg-(--surface) shadow rounded-xl p-5">
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
    






</div>