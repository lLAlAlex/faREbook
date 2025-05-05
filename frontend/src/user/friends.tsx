import React, { useEffect, useRef, useState } from 'react';
import Header from "../components/header";
import '../style/style.css'
import { IoMdSettings } from 'react-icons/io';
import { FaUserFriends, FaUserPlus, FaUserCog, FaBirthdayCake } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { PiUserListFill } from 'react-icons/pi';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Image } from 'cloudinary-react';

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

const GET_ALL_REQUESTS = gql`
    query GetFriendRequests($token: String!) {
        getFriendRequests(token: $token) {
            id
            user {
                id
                name
            }
            requestedUser {
                id
                name
            }
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

const CREATE_FRIEND_REQUEST = gql`
    mutation CreateFriendRequest($userID: String!, $requestedUserID: String!) {
        createFriendRequest(userID: $userID, requestedUserID: $requestedUserID) {
            id
            user {
                id
            }
            requestedUser {
                id
            }
        }
    }
`

const CREATE_FRIEND = gql`
    mutation CreateFriend($userID: String!, $friendID: String!) {
        createFriend(userID: $userID, friendID: $friendID) {
            id
            user {
                id
                name
            }
            friend {
                id
                name
            }
        }
    }
`

const DELETE_FRIEND_REQUEST = gql`
    mutation DeleteFriendRequest($id: String!) {
        deleteFriendRequest(id: $id)
    }
`

const GET_FRIEND_SUGGESTIONS = gql`
    query GetFriendSuggestions($token: String!) {
        getFriendSuggestions(token: $token) {
            id
            name
        }
    }
`

const CREATE_NOTIFICATION = gql`
    mutation CreateNotification($newNotification: NewNotification!) {
        createNotification(newNotification:$newNotification) {
            id
            user {
                id
            }
            content
            createdAt
        }
    }
`

const GET_USER_FRIENDS = gql`
    query GetUserFriends($userID: String!) {
        getUserFriends(userID: $userID) {
            id
            user {
                id
                name
            }
            friend {
                id
                name
            }
        }
    }
`

const Friends = () => {
    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    const navigate = useNavigate();

    useEffect(() => {
        if(!token) {
            navigate('/login');
        }
    }, [])

    const location = useLocation();
    const currentPath = location.pathname;

    const { data, loading, error } = useQuery(FIND_USER, {
        variables: { token: token },
    });

    const { data: requestData, refetch: refetchRequest } = useQuery(GET_ALL_REQUESTS, {variables: {
        token: token
    }});
    const { data: profileData, refetch: refetchProfile } = useQuery(GET_ALL_PROFILE);
    const { data: suggestionData, refetch: refetchSuggestion } = useQuery(GET_FRIEND_SUGGESTIONS, {variables: {
        token: token
    }});

    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : './profile.png';
    };

    const [createFriend] = useMutation(CREATE_FRIEND);
    const [createFriendRequest] = useMutation(CREATE_FRIEND_REQUEST);
    const [deleteFriendRequest] = useMutation(DELETE_FRIEND_REQUEST);
    const { data: friendsData } = useQuery(GET_USER_FRIENDS, {variables: {userID: data?.getUserByToken.id}});

    const handleAcceptRequest = async(friendID, requestID, friendName) => {
        // console.log(friendID);
        // console.log(requestID);
        await createFriend({
            variables: {
                userID: data?.getUserByToken.id,
                friendID: friendID
            }
        });

        await deleteFriendRequest({
            variables: {
                id: requestID
            }
        });

        handleCreateNotification(data?.getUserByToken.id, friendID, "You and "+friendName+" are now friends!");
        handleCreateNotification(friendID, data?.getUserByToken.id, "You and "+data?.getUserByToken.name+" are now friends!");

        refetchRequest();
        refetchProfile();
    }

    const handleDeleteRequest = async(requestID) => {
        await deleteFriendRequest({
            variables: {
                id: requestID
            }
        })
        refetchRequest();
        refetchProfile();
        refetchSuggestion();
    }

    const handleAddFriend = async(requestedUserID) => {
        await createFriendRequest({
            variables: {
                userID: data?.getUserByToken.id,
                requestedUserID: requestedUserID
            }
        })
        refetchRequest();
        refetchProfile();
        refetchSuggestion();
        handleCreateNotification(requestedUserID, data?.getuserByToken.id, data?.getUserByToken.name+" has requested to be your friend");
    }

    const handleRemoveFriend = async(requestedUserID) => {
        
    }

    // console.log(suggestionData);

    const [createNotification] = useMutation(CREATE_NOTIFICATION);

    const handleCreateNotification = async(userID, senderID, content) => {
        await createNotification({
            variables: {
                newNotification: {
                    userID: userID,
                    senderID: senderID,
                    content: content,
                    createdAt: new Date()
                }
            }
        })
    }

    const viewProfile = (userID) => {
        // console.log("masuk");
        navigate('/profile/'+userID);
    }

    const isEmptyObject = (obj) => {
        return JSON.stringify(obj) === '{}';
    };

    // console.log(suggestionData);
    
    return (
        <div className='friends-page'>
            <Header/>
            <div className='friends-sidebar'>
                <div className='friends-sidebar-initial'>
                    <h2 className='friends-sidebar-header'>Friends</h2>
                    <div className='friends-setting'><IoMdSettings size={'3vh'}/></div>
                </div>
                <div className={currentPath === '/friends' ? 'friends-sidebar-row-active' : 'friends-sidebar-row'}>
                    <div className={currentPath === '/friends' ? 'friends-sidebar-icons-active' : 'friends-sidebar-icons'}><FaUserFriends color={currentPath === '/friends' ? 'white' : 'black'} size={'3vh'}/></div>
                    <div className='friends-sidebar-menus'>Home</div>
                </div>
                <div className='friends-sidebar-row'>
                    <div className='friends-sidebar-icons'><FaUserCog size={'3vh'}/></div>
                    <div className='friends-sidebar-menus'>Friend Requests</div>
                </div>
                <div className='friends-sidebar-row'>
                    <div className='friends-sidebar-icons'><FaUserPlus size={'3vh'}/></div>
                    <div className='friends-sidebar-menus'>Suggestions</div>
                </div>
                <div className='friends-sidebar-row'>
                    <div className='friends-sidebar-icons'><PiUserListFill size={'3vh'}/></div>
                    <div className='friends-sidebar-menus'>All friends</div>
                </div>
                <div className='friends-sidebar-row'>
                    <div className='friends-sidebar-icons'><FaBirthdayCake size={'3vh'}/></div>
                    <div className='friends-sidebar-menus'>Birthdays</div>
                </div>
                <div className='friends-sidebar-row'>
                    <div className='friends-sidebar-icons'><PiUserListFill size={'3vh'}/></div>
                    <div className='friends-sidebar-menus'>Custom Lists</div>
                </div>
            </div>
            <div className='friends-container'>
                <div className='friends-content'>
                    {requestData && requestData?.getFriendRequests.length > 0 && (
                        <div className='friend-requests'>
                            <div className='friends-content-row'>
                                <h3 className='friends-content-header'>Friend Requests</h3>
                            </div>
                            <div className='friends-content-row'>
                                {requestData && requestData?.getFriendRequests.map(f => (
                                    <div className='friends-card'>
                                        <Image className='friends-img' cloudName="dogiichep" publicId={getProfileImage(f.user.id)} onClick={() => viewProfile(f.user.id)}/>
                                        <div className='friends-data'>
                                            <div className='friends-name' onClick={() => viewProfile(f.user.id)}>{f.user.name}</div>
                                            <button className='accept-request-btn' onClick={() => handleAcceptRequest(f.user.id, f.id, f.name)}>Confirm</button>
                                            <button className='delete-request-btn' onClick={() => handleDeleteRequest(f.id)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {suggestionData?.getFriendSuggestions.length !== 0 &&
                        <div className='friend-suggestions'>
                            <div className='friends-content-row'>    
                                <h3 className='friends-content-header'>People You May Know</h3>
                            </div>
                            <div className='friends-content-row'>
                                {suggestionData?.getFriendSuggestions.map(s => (
                                    <div className='friends-card'>
                                        <Image className='friends-img' cloudName="dogiichep" publicId={getProfileImage(s.id)} onClick={() => viewProfile(s.id)}/>
                                        <div className='friends-data'>
                                            <div className='friends-name' onClick={() => viewProfile(s.id)}>{s.name}</div>
                                            <button className='accept-request-btn' onClick={() => handleAddFriend(s.id)}>Add Friend</button>
                                            <button className='delete-request-btn' onClick={() => handleRemoveFriend(s.id)}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                    {friendsData?.getUserFriends.length !== 0 &&
                        <div className='friend-suggestions'>
                            <div className='friends-content-row'>    
                                <h3 className='friends-content-header'>All Friends</h3>
                            </div>
                            <div className='friends-content-row'>
                                {friendsData && friendsData?.getUserFriends.map(f => (
                                    <div className='friends-card'>
                                        <Image className='friends-img' cloudName="dogiichep" publicId={getProfileImage(f.user.id)} onClick={() => viewProfile(f.user.id)}/>
                                        <div className='friends-data'>
                                            <div className='friends-name' onClick={() => viewProfile(f.user.id)}>{f.user.name}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default Friends;