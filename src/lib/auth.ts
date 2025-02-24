export async function checkLoginStatus() {
    const res = await fetch("/api/auth/session");
    const data = await res.json();
    return data;
}