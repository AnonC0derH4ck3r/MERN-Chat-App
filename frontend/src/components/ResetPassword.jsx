import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    // ✅ Verify token on mount
    useEffect(() => {
        const checkToken = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/auth/verify-reset-token/${token}`);
                if (res.data.valid) setTokenValid(true);
                else setTokenValid(false);
            } catch {
                setTokenValid(false);
            } finally {
                setLoading(false);
            }
        };
        checkToken();
    }, [token]);

    // ✅ Handle password update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setErr('');

        try {
            const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
                newPassword,
            });

            setMsg(res.data.message);
            setTimeout(() => navigate('/login'), 3000); // Redirect after 3s
        } catch (error) {
            setErr(error.response?.data?.error || 'Reset failed. Try again.');
        }
    };

    return (
        <div className="forgot-wrapper">
            <div className="forgot-card">

                {loading ? (
                    <p className="subtitle">Verifying reset link...</p>
                ) : !tokenValid ? (
                    <p className="error-msg">⛔ This reset link is invalid or has expired.</p>
                ) : (
                    <>
                        <h2>🔐 Reset Password</h2>
                        <p className="subtitle">Enter your new password below</p>

                        <form className="forgot-form" onSubmit={handleSubmit}>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button type="submit">Update Password</button>
                        </form>

                        {msg && <p className="success-msg">{msg}</p>}
                        {err && <p className="error-msg">{err}</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;