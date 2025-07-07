import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';
import axios from 'axios';
import { FaCheckCircle } from 'react-icons/fa';
import { MdError } from 'react-icons/md';

const ForgotPassword = () => {
    const [input, setInput] = useState('');
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const handleSendLink = async (e) => {
        e.preventDefault();
        setMsg('');
        setErr('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/request-reset', {
                email: input
            });
            setMsg(res.data.message);
        } catch (error) {
            setErr(error.response?.data?.error || 'Failed to send link');
        }
    };

    return (
        <div className="forgot-wrapper">
            <div className="forgot-card">
                <h2>Forgot Password?</h2>
                <p className="subtitle">
                    Enter your email to get a password reset link.
                </p>

                <form className="forgot-form" onSubmit={handleSendLink}>
                    <input
                        type="text"
                        placeholder="Email"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        required
                    />
                    <button type="submit">Send Link</button>
                </form>
                {msg && <p className="success-msg">
                    <FaCheckCircle style={{ marginRight: '8px', verticalAlign: 'middle', color: '#4caf50' }} />
                    {msg}
                </p>}
                {err && <p className="error-msg">
                    <MdError style={{ marginRight: '8px', verticalAlign: 'middle', color: '#ff5252' }} />
                    {err}
                </p>}
                <p className="switch-text">
                    <Link to="/login">Home</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;