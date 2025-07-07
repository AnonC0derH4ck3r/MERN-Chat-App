import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import { FaUserShield } from 'react-icons/fa';

const api = 'http://localhost:5000/api/auth';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
    const [loading, setLoading] = useState(false);

    const bufferToBase64url = (buffer) => {
        const bytes = new Uint8Array(buffer);
        const binary = String.fromCharCode(...bytes);
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setShowPasskeyPrompt(false);

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                pass: password
            });

            if (res.data.passkey) {
                setShowPasskeyPrompt(true);
                return;
            }

            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            if (err.response?.data?.error) {
                setErrorMsg(err.response.data.error);
            } else {
                setErrorMsg('Something went wrong. Try again.');
            }
        }
    };

    const handlePasskeyLogin = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await fetch(`${api}/generate-authentication-options`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const options = await res.json();
            if (options.error) {
                setErrorMsg(options.error);
                setLoading(false);
                return;
            }

            options.challenge = Uint8Array.from(options.challenge, c => c.charCodeAt(0));
            options.allowCredentials = options.allowCredentials.map(cred => ({
                ...cred,
                id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0))
            }));

            const cred = await navigator.credentials.get({ publicKey: options });

            const assertionResponse = {
                id: bufferToBase64url(cred.rawId),
                rawId: bufferToBase64url(cred.rawId),
                response: {
                    authenticatorData: bufferToBase64url(cred.response.authenticatorData),
                    clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(cred.response.clientDataJSON))),
                    signature: bufferToBase64url(cred.response.signature),
                    userHandle: cred.response.userHandle
                        ? btoa(String.fromCharCode(...new Uint8Array(cred.response.userHandle)))
                        : null,
                },
                type: cred.type,
            };

            const verify = await fetch(`${api}/verify-authentication`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, assertionResponse })
            });

            const result = await verify.json();
            setLoading(false);

            if (result.verified && result.token) {
                localStorage.setItem('token', result.token);
                navigate('/');
            } else {
                setErrorMsg('Passkey verification failed');
            }
        } catch (err) {
            setLoading(false);
            setErrorMsg('Passkey verification failed');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2>Welcome Back</h2>
                <p className="subtitle">Log in to connect with your friends</p>

                {errorMsg && <p className="error-msg">{errorMsg}</p>}

                {!showPasskeyPrompt ? (
                    <form className="login-form" onSubmit={handleLogin}>
                        <input
                            type="text"
                            id="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="forgot-password">
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>
                        <button type="submit">Login</button>
                    </form>
                ) : (
                    <div className="passkey-auth-box">
                        <div className="passkey-message">
                            <h3>Multi-Factor Authentication</h3>
                            <p>
                                Please verify your identity using your saved passkey to securely log in to your account.
                            </p>
                            {!loading ? (
                                <button className="verify-btn" onClick={handlePasskeyLogin}>Verify with Passkey</button>
                            ) : (
                                <p className="verifying-msg">
                                    <FaUserShield style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    Verifying with authenticator...
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <p className="switch-text">
                    Don't have an account? <Link to="/signup">Signup</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;