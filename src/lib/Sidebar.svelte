<script>
    import { isSidebarCollapsed } from "./Sidebar";

    const navItems = [
        { href: "/dashboard", label: "Overview", icon: "home" },
        { href: "/tracks", label: "Tracks", icon: "disc" },
        { href: "/artists", label: "Artists", icon: "users" },
        { href: "/trends", label: "Trends", icon: "trends" },
        { href: "/import", label: "Import Data", icon: "upload" },
        { href: "/settings", label: "Settings", icon: "settings" },
    ];

    const icons = {
        home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        disc: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/></svg>`,
        users: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        trends: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
        upload: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
        settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2z"/></svg>`,
    };

    function toggleCollapse() {
        $isSidebarCollapsed = !$isSidebarCollapsed;
    }
</script>

<div
    class="{$isSidebarCollapsed
        ? 'w-16'
        : 'w-64'} 
        bg-gray-800 h-screen p-4 fixed top-0 left-0 transition-all duration-300 overflow-hidden"
>
    <div class="flex items-center justify-between mb-8">
        {#if !$isSidebarCollapsed}
            <h1 class="text-2xl font-bold">SpotiStat</h1>
        {/if}
        <button
            on:click={toggleCollapse}
            class="text-gray-700 hover:text-blue-600 focus:outline-none"
            aria-label={$isSidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"}
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                {#if $isSidebarCollapsed}
                    <path d="M15 18l-6-6 6-6" />
                {:else}
                    <path d="M9 18l6-6-6-6" />
                {/if}
            </svg>
        </button>
    </div>

    <nav>
        <ul class="space-y-2">
            {#each navItems as item}
                <li>
                    <a
                        href={item.href}
                        class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 {$isSidebarCollapsed
                            ? 'justify-center'
                            : ''}"
                        title={$isSidebarCollapsed ? item.label : ""}
                    >
                        <span class="inline-block w-5 h-5">
                            {@html icons[item.icon]}
                        </span>
                        {#if !$isSidebarCollapsed}
                            <span>{item.label}</span>
                        {/if}
                    </a>
                </li>
            {/each}
        </ul>
    </nav>
</div>
