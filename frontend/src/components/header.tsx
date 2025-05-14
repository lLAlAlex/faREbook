import React, { useState } from 'react';
import '../style/style.css';
import { HiSearch, HiUserGroup, HiOutlineUserGroup } from 'react-icons/hi';
import { AiFillHome, AiOutlineHome } from 'react-icons/ai';
import { FaFacebookMessenger } from 'react-icons/fa';
import { BsPeople, BsPeopleFill, BsCameraVideoFill, BsCameraVideo } from 'react-icons/bs';
import { IoIosNotifications } from 'react-icons/io';
import { BiLogOut } from 'react-icons/bi';
import { useLocation, useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Image } from 'cloudinary-react';
import ThemeToggle from './themeToggle';

const FIND_USER = gql`
    query GetUserByToken($token: String!) {
        getUserByToken(token: $token) {
            id
            name
            email
            dob
            gender
            status
        }
    }
`

const GET_ALL_PROFILE = gql`
    query GetAllUserProfile {
        getAllUserProfile {
            id
            user {
                id
            }
            imageLink
        }
    }
`

// const GET_USER_NOTIFICATIONS = gql`
//     query GetUserNotifications($token: String!) {
//         getUserNotifications(token: $token) {
//             id
//             user {
//                 id
//             }
//             content
//             createdAt
//         }
//     }
// `

const GET_USER_NOTIFICATIONS = gql`
    query GetUserNotifications($token: String!) {
        getUserNotifications(token: $token) {
            id
            user {
                id
            }
            sender {
                id
            }
            content
            createdAt
        }
    }
`

const Header = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const renderHomeIcon = () => {
        if(currentPath === '/home') {
            return <AiFillHome size={35} />;
        } 
        else {
            return <AiOutlineHome size={35} />;
        }
    };

    const renderFriendsIcon = () => {
        if(currentPath === '/friends') {
            return <BsPeopleFill size={35} />;
        } 
        else {
            return <BsPeople size={35} />;
        }
    };

    const renderGroupIcon = () => {
        if(currentPath === '/groups') {
            return <HiUserGroup size={35} />;
        } 
        else {
            return <HiOutlineUserGroup size={35} />;
        }
    };

    const renderReelsIcon = () => {
        if(currentPath === '/reels') {
            return <BsCameraVideoFill size={35} />;
        } 
        else {
            return <BsCameraVideo size={35} />;
        }
    }

    const [dropdownVisible, setDropdownVisible] = React.useState(false);

    const logout = () => {
        localStorage.clear();
    }

    const renderDropdown = () => {
        if(dropdownVisible) {
            // console.log("masuk");
            return (
                <div className="dropdown-content">
                    <div id="dropdownprofile">
                        <div id="dropdownprofileicon" onClick={() => handleProfile(data?.getUserByToken.id)}><Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} style={{width: "100%"}}/></div>
                        <div id="dropdownprofilename">{data.getUserByToken.name}</div>
                    </div>
                    <a href="/login">
                        <div id="logout" onClick={logout}>
                            <div id="logouticon"><BiLogOut size={35}/></div>
                            <div id="logouttext">Log Out</div>
                        </div>
                    </a>
                </div>
            );
        }
        return null;
    };

    // const renderNotification = () => {
    //     if(notificationDropdownVisible) {
    //         return (
    //             <div className='notification-dropdown-content'>
    //                 {notificationData?.getUserNotifications.map(notification => (
    //                     <div className='notification-item'>
    //                         <div className='notification-content'>{notification.content}</div>
    //                         <div className='notification-time'>{notification.createdAt}</div>
    //                     </div>
    //                 ))}
    //             </div>
    //         )
    //     }
    // }

    const toggleDropdown = () => {
        setDropdownVisible(prevVisible => !prevVisible);
    };

    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    const { data, loading, error } = useQuery(FIND_USER, {
        variables: { token: token },
    });

    const { data: profileData } = useQuery(GET_ALL_PROFILE);

    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : 'http://localhost:5173/profile.png';
    };

    const navigate = useNavigate();
    const closePage = () => {
        navigate('/home');
    }

    // const { data: notificationData } = useQuery(GET_USER_NOTIFICATIONS, { variables: {token: token}})

    // const [notificationDropdownVisible, setNotificationDropdownVisible] = useState(false);

    // const toggleNotificationDropdown = () => {
    //     setNotificationDropdownVisible(prevVisible => !prevVisible);
    //     setDropdownVisible(false);
    // };

    const handleNotification = () => {
        navigate('/notifications');
    }

    const handleSearch = (event) => {
        if(event.key === 'Enter') {
            const query = event.target.value;
            if(query.trim() !== '') {
                search(query);
            }
        }
    };

    const search = (query) => {
        navigate('/search/'+query);
    }

    const { data: notificationData } = useQuery(GET_USER_NOTIFICATIONS, { variables: {token: token}})

    const message = () => {
        navigate('/messenger');
    }

    const handleProfile = (userID) => {
        navigate('/profile/'+userID);
    }

    return (
        <>
            <header style={{
                backgroundColor: '#ffffff',
                padding: '1vh',
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                zIndex: '1000'
            }}>
                <img id="logo" src="../facebook.png" onClick={closePage}></img>
                <div id="search">
                    <div id="searchicon"><HiSearch/></div>
                    <input id="searchbar" style={{color:"black"}} type="text" placeholder="Search Facebook" onKeyDown={handleSearch}/>
                </div>
                {/* <div>
                    <ThemeToggle/>
                </div> */}
                <div id="icons">
                    <a href="/home"><div id={currentPath === '/home' ? 'homeicon' : 'homeicon2'} className={currentPath === '/home' ? 'selected-icon' : ''}>{renderHomeIcon()}</div></a>
                    <a href="/friends"><div id={currentPath === '/friends' ? 'friendicon' : 'friendicon2'} className={currentPath === '/friends' ? 'selected-icon' : ''}>{renderFriendsIcon()}</div></a>
                    <a href="/groups"><div id={currentPath === '/groups' ? 'groupicon' : 'groupicon2'} className={currentPath === '/groups' ? 'selected-icon' : ''}>{renderGroupIcon()}</div></a>
                    <a href="/reels"><div id={currentPath === '/reels' ? '' : 'reelsicon'} className={currentPath === '/reels' ? 'selected-icon' : ''}>{renderReelsIcon()}</div></a>
                </div>
                <div id="menus">
                    <div id="messengericon" onClick={message}><FaFacebookMessenger size={25}/></div>
                    <div id="notificationicon" onClick={handleNotification}>
                        <div className='notification-amount'>{notificationData?.getUserNotifications.length}</div>
                        <IoIosNotifications color={currentPath === '/notifications' ? '#006aeb' : 'black'} size={25}/>
                    </div>
                    <div id="profileicon" onClick={toggleDropdown}>
                        <Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} id="profilepic"/>
                        {renderDropdown()}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;