import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './ChatRoom.css';
import { FaArrowLeft, FaPaperclip } from 'react-icons/fa';

const ChatRoom = () => {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUsername, setCurrentUsername] = useState('');
    const [chatPartner, setChatPartner] = useState('');
    const [justSentByUser, setJustSentByUser] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [editMessageId, setEditMessageId] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const bottomRef = useRef(null);
    const menuRef = useRef(null);
    const navigate = useNavigate();


    const handleDeleteMessage = async (messageId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/chat/${messageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages((prev) => prev.filter(msg => msg._id !== messageId));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleSaveEdit = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:5000/api/chat/${id}`, {
                content: editedContent
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages(prev =>
                prev.map(msg => msg._id === id ? { ...msg, content: editedContent } : msg)
            );
            setEditMessageId(null);
            setEditedContent('');
        } catch (err) {
            console.error('Edit failed:', err);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setActiveMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchUserAndPartner = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const decoded = jwtDecode(token);
                const userId = decoded.id;

                const res1 = await axios.get(`http://localhost:5000/api/auth/username/${userId}`);
                const username = res1.data.username;
                setCurrentUsername(username);

                const res2 = await axios.get(`http://localhost:5000/api/chat/room-info/${roomId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const participants = res2.data.participants;
                const partner = participants.find(p => p !== username);
                setChatPartner(partner || 'Unknown');
            } catch (err) {
                console.error('Failed to fetch user or room info:', err);
            }
        };

        fetchUserAndPartner();
    }, [roomId]);

    useEffect(() => {
        let cancel = false;

        const pollMessages = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await axios.get(`http://localhost:5000/api/chat/${roomId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!cancel) {
                    setMessages(res.data);
                }
            } catch (err) {
                console.error('Error fetching messages:', err);
            }

            if (!cancel) setTimeout(pollMessages, 2000);
        };

        pollMessages();
        return () => { cancel = true; };
    }, [roomId]);

    useEffect(() => {
        if (justSentByUser) {
            const timeout = setTimeout(() => {
                if (bottomRef.current) {
                    bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
                setJustSentByUser(false);
            }, 50);

            return () => clearTimeout(timeout);
        }
    }, [messages, justSentByUser]);

    const handleSend = async () => {
        const token = localStorage.getItem('token');
        const content = newMessage.trim();
        if (!content || !currentUsername) return;

        try {
            await axios.post(
                'http://localhost:5000/api/chat',
                { roomId, senderId: currentUsername, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewMessage('');
            setJustSentByUser(true);
        } catch (err) {
            console.error('Send error:', err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileUpload = async (file) => {
        if (!file || !currentUsername) return;
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('roomId', roomId);
        formData.append('senderId', currentUsername);

        try {
            await axios.post('http://localhost:5000/api/chat/send-file', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setJustSentByUser(true);
        } catch (err) {
            console.error('File upload failed:', err);
        }
    };

    return (
        <div style={{
            backgroundColor: '#121212',
            color: '#fff',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Segoe UI, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#1e1e1e',
                width: '100%',
                maxWidth: '500px',
                height: '90vh',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 0 12px rgba(0,0,0,0.6)'
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: '#1f1f1f',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '15px 20px',
                    fontSize: '18px',
                    fontWeight: '500',
                    borderBottom: '1px solid #333',
                }}>
                    <FaArrowLeft
                        style={{ fontSize: '20px', color: '#E9EDEF', cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    />
                    <span style={{ color: '#00c6a9' }}>{chatPartner}</span>
                </div>

                {/* Chat Body */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '15px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    backgroundColor: '#181818'
                }}>
                    {messages.length > 0 ? (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                style={{
                                    position: 'relative',
                                    alignSelf: msg.senderId === currentUsername ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.senderId === currentUsername ? '#00c6a9' : '#2c2c2c',
                                    color: msg.senderId === currentUsername ? '#000' : '#fff',
                                    borderRadius: '10px',
                                    padding: '10px 14px',
                                    maxWidth: '70%',
                                    wordWrap: 'break-word',
                                    fontSize: '15px',
                                    marginBottom: '10px',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {/* 3-dot menu for sender only */}
                                {msg.senderId === currentUsername && (
                                    <div
                                        onClick={() => setActiveMenuId(activeMenuId === msg._id ? null : msg._id)}
                                        style={{
                                            position: 'absolute',
                                            top: '6px',
                                            right: '8px',
                                            fontSize: '18px',
                                            cursor: 'pointer',
                                            color: '#003c35'
                                        }}
                                    >
                                        ⋮
                                    </div>
                                )}

                                {/* Edit/Delete popup menu */}
                                {activeMenuId === msg._id && (
                                    <div
                                        ref={menuRef}
                                        style={{
                                            position: 'absolute',
                                            top: '30px',
                                            right: '10px',
                                            backgroundColor: '#333',
                                            borderRadius: '6px',
                                            padding: '5px 0',
                                            zIndex: 1000,
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {msg.type === 'text' && (
                                            <div
                                                onClick={() => {
                                                    setActiveMenuId(null);
                                                    setEditMessageId(msg._id);
                                                    setEditedContent(msg.content);
                                                }}
                                                style={{
                                                    padding: '8px 15px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    borderBottom: '1px solid #444',
                                                    color: '#fff'
                                                }}
                                            >
                                                Edit
                                            </div>
                                        )}
                                        <div
                                            onClick={() => {
                                                setActiveMenuId(null);
                                                handleDeleteMessage(msg._id);
                                            }}
                                            style={{
                                                padding: '8px 15px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                color: '#ff4d4d'
                                            }}
                                        >
                                            Delete
                                        </div>
                                    </div>
                                )}

                                {/* Message body (your original rendering) */}
                                {msg.type === 'image' ? (
                                    <img
                                        src={`http://localhost:5000${msg.fileUrl}`}
                                        alt="sent"
                                        style={{ maxWidth: '100%', borderRadius: '8px' }}
                                    />
                                ) : msg.type === 'file' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: '#444',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                fontSize: '18px'
                                            }}>📄</div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    color: msg.senderId === currentUsername ? '#003c35' : '#e9edef',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {msg.originalName || 'Document'}
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={`http://localhost:5000${msg.fileUrl}`}
                                            download
                                            title="Download"
                                            style={{
                                                backgroundColor: '#00796b',
                                                borderRadius: '50%',
                                                width: '30px',
                                                height: '30px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            ⬇️
                                        </a>
                                    </div>
                                ) : (
                                    editMessageId === msg._id ? (
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <input
                                                value={editedContent}
                                                onChange={(e) => setEditedContent(e.target.value)}
                                                autoFocus
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #666',
                                                    backgroundColor: '#2a2a2a',
                                                    color: '#fff',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    width: `${editedContent.length + 3}ch`,
                                                    maxWidth: '100%'
                                                }}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleSaveEdit(msg._id)}
                                                    style={{
                                                        backgroundColor: '#00c6a9',
                                                        border: 'none',
                                                        padding: '4px 10px',
                                                        borderRadius: '5px',
                                                        color: '#000',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    ✅
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditMessageId(null);
                                                        setEditedContent('');
                                                    }}
                                                    style={{
                                                        backgroundColor: '#555',
                                                        border: 'none',
                                                        padding: '4px 10px',
                                                        borderRadius: '5px',
                                                        color: '#fff',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        msg.content
                                    )
                                )}

                                <div style={{
                                    fontSize: '11px',
                                    marginTop: '6px',
                                    color: msg.senderId === currentUsername ? '#003c35' : '#aaa',
                                    textAlign: 'right'
                                }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{
                            color: '#999',
                            fontSize: '15px',
                            textAlign: 'center',
                            padding: '20px 0'
                        }}>
                            Chat with <b>{chatPartner}</b> 👋
                        </div>
                    )}
                    <div ref={bottomRef}></div>
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    padding: '10px 15px',
                    borderTop: '1px solid #333',
                    backgroundColor: '#1a1a1a',
                    alignItems: 'center'
                }}>
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        style={{
                            flex: 1,
                            resize: 'none',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: '#2a2a2a',
                            color: '#fff',
                            fontSize: '15px',
                            outline: 'none',
                            marginRight: '10px'
                        }}
                    />

                    <label style={{ marginRight: '10px', cursor: 'pointer' }}>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.pdf,.docx"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                        />
                        <FaPaperclip size={18} color="#00c6a9" />
                    </label>

                    <button onClick={handleSend} style={{
                        backgroundColor: '#00c6a9',
                        border: 'none',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        color: '#000',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="20"
                            viewBox="0 0 24 24"
                            width="20"
                            fill="#000"
                        >
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );

};

export default ChatRoom;