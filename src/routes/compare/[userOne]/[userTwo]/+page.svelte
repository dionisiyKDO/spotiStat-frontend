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

    // Listening history promis
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
</script>
