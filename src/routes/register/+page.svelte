<script>
    import { goto } from "$app/navigation";
    import { handleRegister } from "./load";

    let username = $state("");
    let password = $state("");
    let confirmPassword = $state("");

    function goToLogin() {
        goto("/login");
    }

    // Real-time password confirmation validation
    let passwordsMatch = $derived(
        confirmPassword === "" || password === confirmPassword
    );
</script>

<div class="register-container">
    <div class="register-card">
        <h1>Create Account</h1>

        <form
            onsubmit={(e) => {
                e.preventDefault();
                handleRegister(username, password, confirmPassword);
            }}
        >
            <div class="form-group">
                <label for="username">Username</label>
                <input
                    id="username"
                    type="text"
                    bind:value={username}
                    placeholder="Choose a username (min 3 characters)"
                    required
                    minlength="3"
                />
                {#if username && username.length < 3}
                    <div class="field-hint error">
                        Username must be at least 3 characters
                    </div>
                {/if}
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input
                    id="password"
                    type="password"
                    bind:value={password}
                    placeholder="Choose a password (min 6 characters)"
                    required
                    minlength="6"
                />
                {#if password && password.length < 6}
                    <div class="field-hint error">
                        Password must be at least 6 characters
                    </div>
                {/if}
            </div>

            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    bind:value={confirmPassword}
                    placeholder="Confirm your password"
                    required
                    class:invalid={!passwordsMatch}
                />
                {#if confirmPassword && !passwordsMatch}
                    <div class="field-hint error">Passwords do not match</div>
                {/if}
                {#if confirmPassword && passwordsMatch && confirmPassword.length >= 6}
                    <div class="field-hint success">Passwords match ✓</div>
                {/if}
            </div>

            <button
                type="submit"
                disabled={!passwordsMatch ||
                    password.length < 6 ||
                    username.length < 3}
                class="register-btn"
            >
                Create Account
            </button>
        </form>

        <div class="login-link">
            <p>
                Already have an account?
                <button type="button" onclick={goToLogin} class="link-btn">
                    Login here
                </button>
            </p>
        </div>
    </div>
</div>

<style>
    .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        padding: 20px;
    }

    .register-card {
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
        border-color: #764ba2;
        box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
    }

    input.invalid {
        border-color: #e74c3c;
    }

    input:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
    }

    .field-hint {
        font-size: 0.85rem;
        margin-top: 0.5rem;
    }

    .field-hint.error {
        color: #e74c3c;
    }

    .field-hint.success {
        color: #27ae60;
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

    .register-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 1.5rem;
    }

    .register-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(118, 75, 162, 0.4);
    }

    .register-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .login-link {
        text-align: center;
    }

    .login-link p {
        color: #666;
        margin: 0;
    }

    .link-btn {
        background: none;
        border: none;
        color: #764ba2;
        cursor: pointer;
        text-decoration: underline;
        font-size: inherit;
    }

    .link-btn:hover {
        color: #667eea;
    }
</style>
