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
	let track_id = $state("");
	let searchInput = $state("");
	let showSuggestions = $state(false);
	let selectedIndex = $state(-1); // -1 means no selection
	let isInitialized = $state(false);

	// Computed values
	let trackStatsReq = $derived(track_id ? fetchTrackStats(username, track_id) : null);
	let tracksReq = $derived(fetchTracks(username));

	$effect(() => {
		tracksReq.then((tracks) => {
			if (!isInitialized && tracks && tracks.length > 0) {
				const mostPopularTrack = tracks[0];
				track_id = mostPopularTrack.spotify_track_uri.replace("spotify:track:", "");
				searchInput = `${mostPopularTrack.track_name} by ${mostPopularTrack.artist}`;
				isInitialized = true;
			}
		}).catch((error) => {
			console.error("Failed to load tracks:", error);
		});
	});

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
		selectedIndex = -1;
		track_id = track.spotify_track_uri.replace("spotify:track:", "");
		searchInput = `${track.track_name} by ${track.artist}`;
	}

	function handleKeyDown(event: KeyboardEvent, tracks: TopTrack[]): void {
		showSuggestions = true;
		// if (!showSuggestions) return;
		
		const displayTracks = getDisplayTracks(tracks);
		
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = selectedIndex < displayTracks.length - 1 ? selectedIndex + 1 : 0;
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : displayTracks.length - 1;
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < displayTracks.length) {
					selectTrack(displayTracks[selectedIndex]);
				}
				break;
			case 'Escape':
				showSuggestions = false;
				selectedIndex = -1;
				break;
			default:
				selectedIndex = -1;
		}
	}

	function handleFocus(): void {
		showSuggestions = true;
		selectedIndex = -1;
	}

	function handleBlur(): void {
		setTimeout(() => {
			showSuggestions = false;
			selectedIndex = -1;
		}, 150); // timeout for mouse click to get through
	}

	// Utility functions
	function formatDuration(milliseconds: number): string {
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

<div>
	<!-- Track Search -->
	{#await tracksReq}
		<div class="flex justify-center items-center p-8">
			<p class="text-(--secondary-text)">Loading tracks...</p>
		</div>
	{:then tracks}
		<header class="mb-8">
			<h1 class="text-3xl font-semibold mb-4 text-(--primary-text)">Track Stats</h1>
			<!-- <h2 class="ml-1 text-sm text-(--secondary-text)">Search through {tracks.length} tracks</h2> -->
			
			<!-- Top Tracks Carousel -->
			<!-- <div class="mb-6">
				<h3 class="text-sm font-medium text-(--secondary-text) mb-3 uppercase tracking-wide">Your Top Tracks</h3>
				<div class="flex gap-3 overflow-x-auto pb-2">
					{#each tracks.slice(0, 8) as track, i}
						<button
							type="button"
							class="flex-shrink-0 bg-(--surface) hover:bg-(--surface-hover) rounded-lg p-3 min-w-48 transition-colors duration-200 text-left border border-transparent hover:border-(--border)"
							onclick={() => selectTrack(track)}
						>
							<div class="flex items-center gap-2 mb-2">
								<div class="w-6 h-6 rounded-full bg-(--primary) text-white text-xs flex items-center justify-center font-medium">
									{i + 1}
								</div>
								<div class="text-xs text-(--secondary-text)">{track.total_hours.toFixed(1)}h</div>
							</div>
							<div class="font-medium text-(--primary-text) text-sm mb-1 line-clamp-1">{track.track_name}</div>
							<div class="text-xs text-(--secondary-text) line-clamp-1">{track.artist}</div>
							<div class="text-xs text-(--secondary-text) mt-1">{track.play_count.toLocaleString()} plays</div>
						</button>
					{/each}
				</div>
			</div> -->
			
			
			
			<div class="relative mb-4">
				<div class="relative">
					<input
						class="input pl-10 pr-4"
						type="text"
						placeholder={`Search through ${tracks.length.toLocaleString()} tracks...`}
						bind:value={searchInput}
						onfocus={handleFocus}
						onblur={handleBlur}
						onkeydown={(e) => handleKeyDown(e, tracks)}
					/>
					<div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--secondary-text)">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
					</div>
				</div>

				{#if showSuggestions}
					{@const displayTracks = getDisplayTracks(tracks)}
					{#if displayTracks.length > 0}
						<ul class="w-96 absolute top-full left-0 right-0 bg-(--surface) border border-(--border) rounded-md mt-1 max-h-56 overflow-y-auto z-10 shadow-lg">
							{#each displayTracks as track, i (track.spotify_track_uri)}
								<li class="border-b border-(--border) last:border-b-0">
									<button
										type="button"
										class={`w-full text-left p-1 px-3 border-none text-(--primary-text) cursor-pointer transition-colors duration-200 ${selectedIndex === i ? 'bg-(--surface-hover)' : 'bg-transparent'}`}
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
		{#if trackStats}
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
		{/if}
	{/await}
</div>