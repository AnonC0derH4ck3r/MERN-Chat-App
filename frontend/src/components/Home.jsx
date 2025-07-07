// import react, useEffect and useState
import React, { useEffect, useState } from 'react';

// import Link and useNavigate for navigation
import { Link, useNavigate } from 'react-router-dom';

// import axios for HTTP request and response
import axios from 'axios';

// import JWTDecode to decode JWT
import { jwtDecode } from 'jwt-decode';

// For React Icons
import { FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';

// Home component
const Home = () => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));    // fetches token
    const [username, setUsername] = useState('');   // stores logged in username and setUsername function to update username
    const [users, setUsers] = useState([]); // stores list of users and setUsername function to update users list
    const [searchQuery, setSearchQuery] = useState(''); // stores search input for filtering users
    const navigate = useNavigate(); // to handle navigation programmatically

    // to check if user has hovered over the logout icon and setHovered to change boolean values dynamically
    const [hovered, setHovered] = useState(false);
    // to check if user has hovered over the settings icon and setHovered to change boolean values dynamically
    const [isSettingsHovered, setIsSettingsHovered] = useState(false);

    // useEffect to perform an action depending on the value of `token`
    useEffect(() => {
        // if token is falsy (null, undefined, false, 0)
        if (!token) {
            // navigate to /login page
            navigate('/login');
        }

        // dependency array `token` and `navigate`
        // re-run when token or naviate changes
    }, [token, navigate]);

    // useEffect to fetch users
    useEffect(() => {
        // expression asynchronous function
        const fetchUsers = async () => {
            // if token is falsy    terminate the operation
            if (!token) return;
            // try-catch for better error handling
            try {
                // decode the JWT and store in decoded
                const decoded = jwtDecode(token);
                // make request to endpoint concatenating `id` to convert MongoDB ObjectId to username
                const res1 = await axios.get(`http://192.168.1.6:5000/api/auth/username/${decoded.id}`);
                // get the username from data.username and store it as a currentUsername
                const currentUsername = res1.data.username;

                // update the username to currentUsername
                setUsername(currentUsername);

                // get method to fetch all the users from `users` collection
                const res2 = await axios.get('http://192.168.1.6:5000/api/chat/get-users', {

                    // Set Authorization header with the value of token from localStorage,
                    // this endpoint has middleware authorization checks
                    headers: { Authorization: `Bearer ${token}` }
                });

                // filter all users except the currentUsername
                const filtered = res2.data.users.filter(user => user.username !== currentUsername);

                // set it to users list
                setUsers(filtered);
            } catch (err) {
                // log errors in console if any error occurs during the HTTP requests
                console.error('Error fetching users:', err);
            }
        };
        // execute the fetchUsers function
        fetchUsers();

        // if the token value is changed
    }, [token]);

    const checkUser = (value) => {
        // update the search query state when user types
        setSearchQuery(value);
    };

    // filter users based on searchQuery (case-insensitive)
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // function to startChatWithUser expects the username of the user to chat with
    const startChatWithUser = async (otherUsername) => {
        try {
            // sends a POST request to start-room endpoint
            const res = await axios.post('http://192.168.1.6:5000/api/chat/start-room', {

                // user1 as the currentUser
                user1: username,

                // user2 as the user to chat with
                user2: otherUsername
            }, {

                // sends Authorization header with token for middleware auth checks
                headers: { Authorization: `Bearer ${token}` }
            });
            // once the room is created, send the user to that room with roomId in the response
            // replace true to replace the history stack with a new URL
            // Means, if the user scroll left-right to go back using default browser he'll be redirect to login page
            // Why I did so? I wanna ask the user. Why you're using swipe back when I gave them a button to go back?
            navigate(`/room/${res.data.roomId}`, { replace: true });
        } catch (err) {
            // log error in console if error occurs
            console.error('Failed to start chat:', err);
        }
    };

    // expression function to handle logout
    const handleLogout = () => {
        // remove the token property from localStorage
        localStorage.removeItem("token");

        // navigate to login page
        navigate('/login');
    }

    // JSX
    return (
        <div style={{ background: '#111B21', color: '#E9EDEF', height: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#202C33',
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #2a2a2a'
            }}>
                <h2 style={{ fontSize: '20px' }}>MERN Chat App</h2>
                <div style={{ display: 'flex', gap: '20px', fontSize: '18px' }}>
                    <FaCog
                        /* If user clicks on settings icon, redirect to /profile */
                        onClick={() => navigate('/profile')}

                        /* If user hovers (onMouseEnter) on settings icon, set hovered to true */
                        onMouseEnter={() => setHovered(true)}

                        /* If user leaves (onMouseLeave) off settings icon, set hovered to false */
                        onMouseLeave={() => setHovered(false)}
                        style={{
                            fontSize: '24px',
                            cursor: 'pointer',
                            /* is hovered is true ? set color to #25D366 otherwise to #E9EDEF */
                            // this will varry when user hover or leaves the settings icon
                            color: hovered ? '#25D366' : '#E9EDEF',

                            // transition set to change color on 0.2s (200 milisec) ease
                            transition: 'color 0.2s ease',
                        }}
                        // show title `Settings` when user hovers
                        title="Settings"
                    />

                    {/* Same logic for Logout icon */}
                    <FaSignOutAlt
                        onMouseEnter={() => setIsSettingsHovered(true)}
                        onMouseLeave={() => setIsSettingsHovered(false)}
                        style={{
                            cursor: 'pointer',
                            color: isSettingsHovered ? '#ff4c4c' : '#E9EDEF',
                            transition: 'color 0.2s ease',
                            fontSize: '20px',
                        }} onClick={handleLogout} />
                </div>
            </div>

            {/* Search */}
            {/* Yet to add a functionality */}
            <div style={{ padding: '10px 15px', background: '#111B21', borderBottom: '1px solid #2a2a2a' }}>
                <input
                    type="text"
                    placeholder="Search"
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: '#202C33',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#E9EDEF'
                    }}
                    // when the input change (onkeyup), change the username to the value
                    onChange={(e) => checkUser(e.target.value)}
                />
            </div>

            {/* Filter Tabs */}
            <div className='userLists' style={{ display: 'flex', padding: '8px 15px', gap: '10px', backgroundColor: '#111B21' }}>
                {/* Array */}
                {/* mapping over each element in the array */}
                {['All'].map((tab, i) => (
                    // if the i is 0, means the first element (All) button
                    // set its backgroundColor to #202C33 otherwise as transparent
                    // this is used to show active or current selected option effect
                    <button key={i} style={{
                        backgroundColor: i === 0 ? '#202C33' : 'transparent',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        color: '#E9EDEF',
                        fontWeight: '500',
                        fontSize: '13px',
                        cursor: 'pointer'
                    }}>
                        {/* Show the actual name of the Button */}
                        {tab}
                    </button>
                ))}
            </div>

            {/* User list */}
            <div style={{ overflowY: 'auto', height: 'calc(100vh - 180px)' }}>
                {/* if the filteredUsers.length is greater than 0 */}
                {/* then, map through each users array with index as element position */}
                {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                    <div key={index}
                        // when user clicks on the user's div
                        // call `startChatWithUser` function with parameter as user.username
                        onClick={() => startChatWithUser(user.username)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 15px',
                            borderBottom: '1px solid #2a2a2a',
                            cursor: 'pointer'
                        }}
                        // hover effects
                        onMouseEnter={e => e.currentTarget.style.background = '#202C33'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <div style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: '#1f2c34',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '22px',
                            color: '#ccc',
                            marginRight: '15px'
                        }}>
                            {/* if avatar exists for user, display their image profiles in image tag */}
                            {user.avatar ? (
                                <img
                                    src={`http://192.168.1.6:5000${user.avatar}`}
                                    alt="avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                // otherwise show default avatar icon
                                <FaUserCircle />
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            {/* display the username of users */}
                            <div style={{ fontSize: '15px', fontWeight: '500' }}>{user.username}</div>

                            {/* An interactive text to chat */}
                            <div style={{ fontSize: '13px', color: '#aaa' }}>Tap to start chat</div>
                        </div>
                    </div>
                )) : (
                    // if no users are found
                    <div style={{ padding: '20px', color: '#aaa' }}>No users found.</div>
                )}
            </div>

            {/* Bottom navigation (static for now) */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                width: '100%',
                backgroundColor: '#202C33',
                borderTop: '1px solid #2a2a2a',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '10px 0'
            }}>
                <div style={{ color: '#25D366' }}>Chats</div>
            </div>
        </div>
    );
};

export default Home;