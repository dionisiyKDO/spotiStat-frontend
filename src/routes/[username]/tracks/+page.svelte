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
		track_id = track.spotify_track_uri.replace("spotify:track:", "");
		searchInput = `${track.track_name} by ${track.artist}`;
		showSuggestions = false;
	}

	// Utility functions
	function formatDuration(milliseconds: number): string {
		const hours = milliseconds / 3600000;
		const minutes = milliseconds / 60000;
		
		return hours > 3 
			? `${hours.toFixed(2)} hours`
			: `${minutes.toFixed(2)} minutes`;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
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
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
			<div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">Total Plays</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">{trackStats.total_plays.toLocaleString()}</p>
			</div>
			
			<div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">Total Time Played</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">{formatDuration(trackStats.total_ms_played)}</p>
			</div>
			
			<div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">First Play</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">{formatDate(trackStats.first_played)}</p>
			</div>
		</section>

		<!-- Timeline Chart -->
		 <!-- todo: change to minutes -->
		{#if trackStats.timeline_data?.length > 0}
			<section class="mt-10">
				<div class="bg-(--surface) shadow-sm rounded-xl p-4">
					<h2 class="text-sm text-(--secondary-text) mb-1 ml-4 font-medium">Minutes of track played per day</h2>
					<D3Chart timeline_data={trackStats.timeline_data} />
				</div>
			</section>
		{/if}
	{/await}
</section>