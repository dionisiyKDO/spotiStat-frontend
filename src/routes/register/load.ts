import { goto } from "$app/navigation";

export async function handleRegister(username, password, confirmPassword) {
    if (!validateForm(username, password, confirmPassword)) {
        return;
    }

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Registration failed";
            console.log(error);
            return null;
        }

        const data = await response.json();

        console.log("Registration successful");
        setTimeout(() => {
            goto("/login");
        }, 2000);

    } catch (err) {
        const error = "Network error. Please try again.";
        console.log(error);
        return null;
    }
}

function validateForm(username, password, confirmPassword) {
    if (!username || !password || !confirmPassword) {
        console.log("All fields are required");
        return false;
    }

    if (username.length < 3) {
        console.log("Username must be at least 3 characters long");
        return false;
    }

    if (password.length < 6) {
        console.log("Password must be at least 6 characters long");
        return false;
    }

    if (password !== confirmPassword) {
        console.log("Passwords do not match");
        return false;
    }
    return true;
}