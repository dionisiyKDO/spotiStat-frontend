<script lang="ts">
    import type { PageProps } from "./$types";
    import BarChart from "$lib/dashboard/BarChart.svelte";
    import TimelineChart from "$lib/dashboard/TimelineChart.svelte";
    import { fetchAllStats, numberWithCommas } from "./load";

    let { data }: PageProps = $props();
    const username = data.username;

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

    let StatsReq = fetchAllStats(username);

    const summaryPromise            = StatsReq.then((data) => ({
        tltData: data.total_listening_time,
        uniqData: data.unique_tracks_count,
        sessData: data.longest_session,
    }));
    const topPromise                = StatsReq.then((data) => ({
        topTracks: data.top_tracks,
        topArtists: data.top_artists,
    }));
    const listeningHistoryPromise   = StatsReq.then((data) => ({
        dailyTrends: data.listening_by_date,
    }));
    const trendsPromise             = StatsReq.then((data) => ({
        hourlyTrends: data.listening_by_hour,
        weeklyTrends: data.listening_by_weekday,
        monthsTrends: data.listening_by_month,
        yearlyTrends: data.listening_by_year,
    }));
    const behaviorPromise           = StatsReq.then((data) => ({
        platfData: data.platform_stats,
        skipStats: data.skip_stats,
    }));
    const skipPromise               = StatsReq.then((data) => ({
        endreasonsData: data.end_reasons,
        skipedTracksStats: data.most_skipped_tracks,
    }));
</script>

<div class="space-y-8">
    <!-- Summary Cards -->
    {#await summaryPromise}
        <p class="loading">Loading Total Listening Time...</p>
    {:then { tltData, uniqData, sessData }}
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                class="bg-(--surface) shadow rounded-xl p-4 sm:col-span-2 lg:col-span-1"
            >
                <h2 class="text-sm text-(--secondary-text)">
                    Total Listening Time
                </h2>
                <div class="flex gap-2 text-2xl">
                    <p class="font-semibold mt-1">
                        {numberWithCommas(
                            tltData.total_listening_days.toFixed(0)
                        )}d
                    </p>
                    <p class="mt-1">or</p>
                    <p class="font-semibold mt-1">
                        {numberWithCommas(
                            tltData.total_listening_hours.toFixed(0)
                        )}h
                    </p>
                </div>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4">
                <h2 class="text-sm text-(--secondary-text)">Unique Tracks</h2>
                <p class="text-2xl font-semibold mt-1">
                    {numberWithCommas(uniqData.unique_tracks_count)}
                </p>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4">
                <h2 class="text-sm text-(--secondary-text)">Longest Session</h2>
                <p class="text-2xl font-semibold mt-1">
                    {(sessData.total_ms_played / 3600000).toFixed(2)}h
                </p>
            </div>
        </section>
    {/await}

    <!-- Top tracks and artists Cards -->
    {#await topPromise}
        <p class="loading">Loading Total Listening Time...</p>
    {:then { topTracks, topArtists }}
        <section class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Top Artists Card -->
            <div
                class="bg-(--surface) shadow rounded-xl p-5 flex flex-col gap-3"
            >
                <h2 class="text-sm text-(--secondary-text)">Top Artists</h2>
                <ul class="space-y-2 text-sm">
                    {#each topArtists.slice(0, 10) as { artist, play_count, total_hours, total_ms_played }, i}
                        <li class="flex justify-between items-center">
                            <span class="text-(--primary-text)">
                                <span class="font-bold text-(--accent-text)"
                                    >{i + 1}.</span
                                >
                                {artist}
                            </span>
                            <span class="font-semibold text-right tabular-nums"
                                >{total_hours.toFixed(2)}h</span
                            >
                        </li>
                    {/each}
                </ul>
            </div>

            <!-- Top Tracks Card -->
            <div
                class="bg-(--surface) shadow rounded-xl p-5 flex flex-col gap-3"
            >
                <h2 class="text-sm text-(--secondary-text)">Top Tracks</h2>
                <ul class="space-y-2 text-sm">
                    {#each topTracks.slice(0, 10) as { artist, track_name, total_hours }, i}
                        <li class="flex justify-between items-center">
                            <span
                                class="text-(--primary-text) max-w-[85%] truncate"
                                title={`${track_name} by ${artist}`}
                            >
                                <span class="font-bold text-(--accent-text)"
                                    >{i + 1}.</span
                                >
                                {track_name}
                                <span class="text-(--secondary-text)">by</span>
                                {artist}
                            </span>
                            <span class="font-semibold text-right tabular-nums"
                                >{total_hours.toFixed(2)}h</span
                            >
                        </li>
                    {/each}
                </ul>
            </div>
        </section>
    {/await}

    <!-- Listening history Card -->
    {#await listeningHistoryPromise}
        <p class="loading">Loading Hourly Trends...</p>
    {:then { dailyTrends }}
        <section class="gap-6">
            <div
                class="bg-(--surface) shadow rounded-xl p-4 flex flex-col col-span-2"
            >
                <h3 class="text-lg font-semibold mb-2">Timeline of Activity</h3>
                <TimelineChart
                    data={dailyTrends}
                    yAxisLabel={"total_ms_played"}
                    xAxisLabel={"date"}
                />
            </div>
        </section>
    {/await}

    <!-- Behavior insights Cards -->
    {#await behaviorPromise}
        <p class="loading">Loading Total Platform stats...</p>
    {:then { platfData, skipStats }}
        <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-(--surface) shadow rounded-xl p-4 gap-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">
                    Platform Usage
                </h2>
                <!-- <div class="h-48 bg-gray-800 rounded">[Bar Graph Placeholder]</div> -->
                <ul class="mx-auto">
                    {#each platfData.sort((a, b) => b.total_ms_played - a.total_ms_played) as { platform, play_count, total_ms_played }}
                        {#if play_count > 0}
                            <li>
                                <strong>{platform}</strong>: {numberWithCommas(
                                    (total_ms_played / 3600000).toFixed(2)
                                )}h
                            </li>
                        {/if}
                    {/each}
                </ul>
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4">
                <h2 class="text-sm text-(--secondary-text) mb-1">Skip Stats</h2>
                <ul class="text-base space-y-1">
                    <li>
                        <strong>Total Plays:</strong>
                        {numberWithCommas(skipStats.total_plays.toString())}
                    </li>
                    <li>
                        <strong>Skipped Tracks:</strong>
                        {numberWithCommas(skipStats.skipped_tracks.toString())}
                    </li>
                    <li>
                        <strong>Skip Rate:</strong>
                        {(skipStats.skip_rate * 100).toFixed(2)}%
                    </li>
                </ul>
            </div>
        </section>
    {/await}

    <!-- Trends Cards -->
    {#await trendsPromise}
        <p class="loading">Loading Hourly Trends...</p>
    {:then { hourlyTrends, weeklyTrends, yearlyTrends, monthsTrends }}
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-(--surface) shadow rounded-xl p-4">
                <h3 class="text-lg font-semibold mb-2">
                    Hourly Listening Pattern
                </h3>
                <BarChart
                    data={hourlyTrends}
                    yAxisLabel={"total_ms_played"}
                    xAxisLabel={"hour"}
                />
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4">
                <h3 class="text-lg font-semibold mb-2">
                    Day-of-Week Listening Pattern
                </h3>
                <BarChart
                    data={weeklyTrends}
                    yAxisLabel={"total_ms_played"}
                    xAxisLabel={"weekday"}
                />
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4">
                <h3 class="text-lg font-semibold mb-2">
                    Yearly Listening Pattern
                </h3>
                <BarChart
                    data={yearlyTrends}
                    yAxisLabel={"total_ms_played"}
                    xAxisLabel={"year"}
                />
            </div>
            <div class="bg-(--surface) shadow rounded-xl p-4">
                <h3 class="text-lg font-semibold mb-2">
                    Monthly Listening Pattern
                </h3>
                <TimelineChart
                    data={monthsTrends}
                    yAxisLabel={"total_ms_played"}
                    xAxisLabel={"month"}
                />
            </div>
        </section>
    {/await}

    <!-- Skip Stats Cards -->
    {#await skipPromise}
        <p class="loading">Loading Total Listening Time...</p>
    {:then { endreasonsData, skipedTracksStats }}
        <section class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Most skipped tracks Card -->
            <div
                class="bg-(--surface) shadow rounded-xl p-5 flex flex-col gap-3"
            >
                <h2 class="text-sm text-(--secondary-text)">
                    Most skipped tracks
                </h2>
                <ul class="space-y-2 text-sm">
                    {#each skipedTracksStats.slice(0, 10) as { artist, skip_count, spotify_track_uri, track_name }, i}
                        <li class="flex justify-between items-center">
                            <span
                                class="text-(--primary-text) max-w-[85%] truncate"
                                title={`${track_name} by ${artist}`}
                            >
                                <span class="font-bold text-(--accent-text)"
                                    >{i + 1}.</span
                                >
                                {track_name}
                                <span class="text-(--secondary-text)">by</span>
                                {artist}
                            </span>
                            <span class="font-semibold text-right tabular-nums"
                                >{skip_count}</span
                            >
                        </li>
                    {/each}
                </ul>
            </div>

            <!-- End reasons Card -->
            <div
                class="bg-(--surface) shadow rounded-xl p-5 flex flex-col gap-3"
            >
                <h2 class="text-sm text-(--secondary-text)">End reasons</h2>
                <ul class="space-y-2 text-sm">
                    {#each endreasonsData as { count, reason_end }, i}
                        <li class="flex justify-between items-center">
                            <span
                                class="text-(--primary-text) max-w-[85%] truncate"
                                title={reason_end}
                            >
                                <span class="font-bold text-(--accent-text)"
                                    >{i + 1}.</span
                                >
                                {reasonLabels[reason_end] || reason_end}
                            </span>
                            <span class="font-semibold text-right tabular-nums"
                                >{count.toLocaleString()}</span
                            >
                        </li>
                    {/each}
                </ul>
            </div>
        </section>
    {/await}
</div>
