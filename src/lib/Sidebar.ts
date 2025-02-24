import { writable } from 'svelte/store';

export const isSidebarCollapsed = writable(false);
export const collapsedWidth = "3rem"; // 64px
export const expandedWidth = "12rem"; // 256px