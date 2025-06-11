import { goto } from "$app/navigation";

export async function handleLogin(username, password) {
    if (!username || !password) {
        const error = "Username and password are required";
        console.log(error);
        return null;
    }

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Login failed";
            console.log(error);
            return null;
        }

        const data = await response.json();
        console.log("Login successful! Redirecting...");
        setTimeout(() => {
            goto(`/${data.username}`);
        }, 1000);

    } catch (err) {
        const error = "Network error. Please try again.";
        console.log(error);
        return null;
    }
}