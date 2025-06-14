<script lang="ts">
	import type { PageProps } from './$types';
	import D3Chart from "$lib/stats/TimelineChart.svelte";
	import {
		fetchTrackStats,
		fetchTracks,
		type TopTrack,
		type TrackStats,
	} from "./load";

	// Props  
	let { data }: PageProps = $props();
	const username = data.username;

	// State
	let track_id = $state("29fFAKTm2Bvw9KwyxGtYgV");
	let searchInput = $state("Tsubasa by ナナホシ(CV:若山詩音)");
	let showSuggestions = $state(false);

	// Computed values
	let trackStatsReq = $derived(fetchTrackStats(username, track_id));
	let tracksReq = $derived(fetchTracks(username));

	// Get top 4 tracks or filter based on search input
	function getDisplayTracks(tracks: TopTrack[]): TopTrack[] {
		const input = searchInput.toLowerCase().trim();
		
		if (!input) {
			return tracks.slice(0, 4);
		}
		
		return tracks
			.filter(track => 
				track.track_name.toLowerCase().includes(input) || 
				track.artist.toLowerCase().includes(input)
			)
			.slice(0, 4);
	}

	// Event handlers
	function selectTrack(track: TopTrack): void {
		showSuggestions = false;
		track_id = track.spotify_track_uri.replace("spotify:track:", "");
		searchInput = `${track.track_name} by ${track.artist}`;
	}

	// Utility functions
	function formatDuration(milliseconds: number): string {
		// const hours = milliseconds / 3600000;
		// const minutes = milliseconds / 60000;
		
		// return hours > 3 
		// 	? `${hours.toFixed(2)} hours`
		// 	: `${minutes.toFixed(2)} minutes`;

		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		if (milliseconds >= 3600000) {
			// Rare case: longer than 1 hour
			const hours = milliseconds / 3600000;
			return `${hours.toFixed(2)} hours`;
		} else {
			// Default for 1–5 min (and most songs)
			return seconds === 0
				? `${minutes}m`
				: `${minutes}m${seconds}s`;
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}
</script>

<section class="max-w-6xl mx-auto p-8">
	<!-- Track Search -->
	{#await tracksReq}
		<div class="flex justify-center items-center p-8">
			<p class="text-(--secondary-text)">Loading tracks...</p>
		</div>
	{:then tracks}
		<header class="mb-8">
			<h1 class="text-3xl font-semibold mb-4 text-(--primary-text)">Track Stats</h1>
			
			<div class="relative mb-4">
				<input
					class="input"
					type="text"
					placeholder="Search track or artist..."
					bind:value={searchInput}
					onfocus={() => showSuggestions = true}
					onblur={() => setTimeout(() => showSuggestions = false, 200)}
				/>

				{#if showSuggestions}
					{@const displayTracks = getDisplayTracks(tracks)}
					{#if displayTracks.length > 0}
						<ul class="absolute top-full left-0 right-0 bg-(--surface) border border-(--border) rounded-md mt-1 max-h-56 overflow-y-auto z-10 shadow-lg">
							{#each displayTracks as track (track.spotify_track_uri)}
								<li class="border-b border-(--border) last:border-b-0">
									<button
										type="button"
										class="w-full text-left p-1 px-3 bg-transparent border-none text-(--primary-text) cursor-pointer hover:bg-(--surface-hover) transition-colors duration-200"
										onclick={() => selectTrack(track)}
									>
										<div class="flex justify-between items-center">
											<div>
												<div class="font-medium">{track.track_name}</div>
												<div class="text-sm text-(--secondary-text)">{track.artist}</div>
											</div>
											<div class="text-sm text-(--secondary-text)">
												{track.total_hours.toFixed(1)}h
											</div>
										</div>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				{/if}
			</div>
		</header>
	{/await}

	<!-- Track Statistics -->
	{#await trackStatsReq}
		<div class="flex justify-center items-center p-8">
			<p class="text-(--primary-text)">Loading track statistics...</p>
		</div>
	{:then trackStats}
		<section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6 mb-10">
	
			<!-- Total Plays -->
			<div class="col-span-1 md:col-span-2 bg-(--surface) shadow rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text)">Total Plays</h2>
				<p class="text-2xl font-semibold mt-1">{trackStats.total_plays.toLocaleString()}</p>
			</div>

			<!-- Total Time Played -->
			<div class="col-span-1 md:col-span-2 bg-(--surface) shadow rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text)">Total Time Played</h2>
				<p class="text-2xl font-semibold mt-1">{formatDuration(trackStats.total_ms_played)}</p>
			</div>

			<!-- Distinct Days Played -->
			<div class="col-span-1 md:col-span-2 bg-(--surface) shadow rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text)">Distinct Days Played</h2>
				<p class="text-xl font-semibold mt-1">{trackStats.distinct_days_played}</p>
			</div>

			<!-- First Play -->
			<div class="col-span-1 md:col-span-3 bg-(--surface) shadow rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text)">First Play</h2>
				<p class="text-xl font-semibold mt-1">{formatDate(trackStats.first_played)}</p>
			</div>

			<!-- Average playtime per play -->
			<div class="col-span-1 sm:col-span-2 md:col-span-3 bg-(--surface) shadow rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text)">Average playtime per play</h2>
				<div class="flex flex-wrap gap-2 text-2xl">
					<p class="font-semibold">{formatDuration(trackStats.avg_playtime_per_play)}</p>
					<p>out of</p>
					<p class="font-semibold">{formatDuration(trackStats.song_length)}</p>
				</div>
			</div>
		</section>


		<!-- Timeline Chart -->
		 <!-- todo: change to minutes -->
		{#if trackStats.timeline_data?.length > 0}
			<section class="mt-10">
				<div class="bg-(--surface) shadow rounded-xl p-4">
					<h2 class="text-sm text-(--secondary-text) mb-1 ml-4">Minutes of track played per day</h2>
					<D3Chart timeline_data={trackStats.timeline_data} />
				</div>
			</section>
		{/if}
	{/await}
</section>