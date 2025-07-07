import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import authenticatorMap from '../assets/authenticator-map.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const bufferToBase64url = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = window.btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const Profile = () => {
    const token = localStorage.getItem('token');
    const [userData, setUserData] = useState({ username: '', email: '', avatar: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [changing, setChanging] = useState(false);
    const [authenticatorInfo, setAuthenticatorInfo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            try {
                const decoded = jwtDecode(token);
                const res = await axios.get(`http://192.168.1.6:5000/api/user/${decoded.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(res.data.user);
                if (res.data.user.aaguid && authenticatorMap[res.data.user.aaguid]) {
                    setAuthenticatorInfo(authenticatorMap[res.data.user.aaguid]);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    const handleInputChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await axios.put('http://192.168.1.6:5000/api/user/settings', userData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Profile updated!');
        } catch {
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordInputChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = async () => {
        try {
            setChanging(true);
            const res = await axios.put('http://192.168.1.6:5000/api/user/change-password', passwordData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            setPasswordData({ currentPassword: '', newPassword: '' });
            setShowPasswordForm(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to change password.');
        } finally {
            setChanging(false);
        }
    };

    const handleRegisterPasskey = async () => {
        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;
            const res = await fetch('http://192.168.1.6:5000/api/auth/generate-registration-options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, username: userData.username })
            });
            const options = await res.json();
            options.challenge = Uint8Array.from(options.challenge, c => c.charCodeAt(0));
            options.user.id = Uint8Array.from(options.user.id, c => c.charCodeAt(0));

            const cred = await navigator.credentials.create({ publicKey: options });

            const attestationResponse = {
                id: bufferToBase64url(cred.rawId),
                rawId: bufferToBase64url(cred.rawId),
                response: {
                    clientDataJSON: bufferToBase64url(cred.response.clientDataJSON),
                    attestationObject: bufferToBase64url(cred.response.attestationObject),
                },
                type: cred.type,
                clientExtensionResults: cred.getClientExtensionResults(),
            };

            const verify = await fetch('http://192.168.1.6:5000/api/auth/verify-registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userData.username, attestationResponse })
            });

            const result = await verify.json();
            if (result.verified && result.token && result.aaguid) {
                localStorage.setItem('token', result.token);
                const authInfo = authenticatorMap[result.aaguid];
                if (authInfo) setAuthenticatorInfo(authInfo);
                alert('Passkey successfully registered!');
            } else {
                alert('Passkey registration failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Error during passkey registration.');
        }
    };

    const handleDeletePasskey = async () => {
        try {
            await axios.delete('http://192.168.1.6:5000/api/auth/delete-passkey', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAuthenticatorInfo(null);
            alert('Passkey deleted!');
        } catch {
            alert('Failed to delete passkey.');
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await axios.post('http://192.168.1.6:5000/api/user/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setUserData(prev => ({ ...prev, avatar: res.data.path }));
        } catch (err) {
            console.error(err);
            alert('Failed to upload avatar.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div style={{ color: '#E9EDEF', padding: '20px' }}>Loading profile...</div>;
    }

    return (
        <div style={{ background: '#111B21', color: '#E9EDEF', minHeight: '100vh', padding: '30px 20px', fontFamily: 'Segoe UI, sans-serif' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: '#25D366', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '15px' }}>
                    <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '6px' }} />
                    Back
                </button>

                {/* Avatar */}
                <div style={{
                    width: '100px', height: '100px', margin: '0 auto 10px',
                    borderRadius: '50%', overflow: 'hidden', backgroundColor: '#1f2c34',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                }}>
                    {userData.avatar ? (
                        <img
                            src={`http://192.168.1.6:5000${userData.avatar}`}
                            alt="avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <FaUserCircle style={{ fontSize: '50px' }} />
                    )}
                    <label htmlFor="avatarUpload" style={{
                        position: 'absolute',
                        bottom: '0',
                        width: '100%',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        textAlign: 'center',
                        fontSize: '12px',
                        padding: '4px',
                        cursor: 'pointer'
                    }}>
                        {uploading ? 'Uploading...' : 'Change'}
                        <input
                            id="avatarUpload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleAvatarUpload}
                        />
                    </label>
                </div>

                {/* Editable Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label>
                        <span style={{ fontSize: '14px', color: '#aaa' }}>Username</span>
                        <input type="text" name="username" value={userData.username} onChange={handleInputChange} style={inputStyle} />
                    </label>
                    <label>
                        <span style={{ fontSize: '14px', color: '#aaa' }}>Email</span>
                        <input type="email" name="email" value={userData.email} onChange={handleInputChange} style={inputStyle} />
                    </label>
                    <button onClick={handleSave} disabled={saving} style={saveBtnStyle}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Change Password & Passkey */}
                <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                    <button style={passBtnStyle} onClick={() => setShowPasswordForm(!showPasswordForm)}>
                        {showPasswordForm ? 'Cancel' : 'Change Password'}
                    </button>

                    {!authenticatorInfo ? (
                        <button onClick={handleRegisterPasskey} style={passkeyBtnStyle}>
                            ➕ Add a Passkey
                        </button>
                    ) : (
                        <div style={passkeyBtnStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src={authenticatorInfo.iconDark} alt="icon" style={{ width: '24px', height: '24px' }} />
                                <span>{authenticatorInfo.name}</span>
                            </div>
                            <button onClick={handleDeletePasskey} style={trashBtnStyle}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Password Change Form */}
                {showPasswordForm && (
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="password" name="currentPassword" placeholder="Current Password" value={passwordData.currentPassword} onChange={handlePasswordInputChange} style={inputStyle} />
                        <input type="password" name="newPassword" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordInputChange} style={inputStyle} />
                        <button onClick={handlePasswordChange} disabled={changing} style={saveBtnStyle}>
                            {changing ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    backgroundColor: '#1f2c34',
    color: '#E9EDEF',
    border: '1px solid #2a2a2a',
    borderRadius: '6px',
    fontSize: '15px'
};

const saveBtnStyle = {
    padding: '10px',
    backgroundColor: '#25D366',
    color: '#111B21',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
};

const passBtnStyle = {
    flex: 1,
    padding: '10px',
    backgroundColor: '#ffae42',
    border: 'none',
    borderRadius: '6px',
    color: '#111B21',
    fontWeight: 'bold',
    cursor: 'pointer'
};

const passkeyBtnStyle = {
    flex: 1,
    padding: '10px',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    border: '0.2px solid #FFF',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const trashBtnStyle = {
    padding: '6px 10px',
    borderRadius: '6px',
    backgroundColor: '#ff4d4d',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer'
};

export default Profile;