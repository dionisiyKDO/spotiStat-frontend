<script>
    import { goto } from "$app/navigation";
    import { handleLogin } from "./load"

    let username = $state("");
    let password = $state("");

    function goToRegister() {
        goto("/register");
    }
</script>

<div class="login-container">
    <div class="login-card">
        <h1>Login</h1>

        <form
            onsubmit={(e) => {
                e.preventDefault();
                handleLogin(username, password);
            }}
        >
            <div class="form-group">
                <label for="username">Username</label>
                <input
                    id="username"
                    type="text"
                    bind:value={username}
                    placeholder="Enter your username"
                    required
                />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input
                    id="password"
                    type="password"
                    bind:value={password}
                    placeholder="Enter your password"
                    required
                />
            </div>

            <button type="submit" class="login-btn">Login</button>
        </form>

        <div class="register-link">
            <p>
                Don't have an account?
                <button type="button" onclick={goToRegister} class="link-btn">
                    Register here
                </button>
            </p>
        </div>
    </div>
</div>

<style>
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
    }

    .login-card {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        width: 100%;
        max-width: 400px;
    }

    h1 {
        text-align: center;
        color: #333;
        margin-bottom: 2rem;
        font-size: 2rem;
        font-weight: 600;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        color: #555;
        font-weight: 500;
    }

    input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e1e5e9;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-sizing: border-box;
    }

    input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    input:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
    }

    .message {
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }

    .message.error {
        background-color: #fee;
        color: #c33;
        border: 1px solid #fcc;
    }

    .message.success {
        background-color: #efe;
        color: #363;
        border: 1px solid #cfc;
    }

    .login-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 1.5rem;
    }

    .login-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .login-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .register-link {
        text-align: center;
    }

    .register-link p {
        color: #666;
        margin: 0;
    }

    .link-btn {
        background: none;
        border: none;
        color: #667eea;
        cursor: pointer;
        text-decoration: underline;
        font-size: inherit;
    }

    .link-btn:hover {
        color: #764ba2;
    }
</style>
