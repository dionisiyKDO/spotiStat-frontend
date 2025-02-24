<script>
    import { goto } from "$app/navigation";
	import { checkLoginStatus } from "$lib/auth";
	import "../app.css";
	
	// TODO: If already logged in, redirect to profile/dashboard
	// checkLoginStatus().then((data) => {
	// 	if (data.logged_in) {
	// 		goto("/dashboard");
	// 	} else {
	// 		goto("/api/auth/login");
	// 	}
	// });
	
	let { children } = $props();
</script>

{@render children()}