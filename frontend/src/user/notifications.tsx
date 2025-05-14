import React, { useEffect, useRef, useState } from 'react';
import Header from "../components/header";
import { gql, useMutation, useQuery } from '@apollo/client';
import { Image } from 'cloudinary-react';
import { useNavigate } from 'react-router-dom';

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

const GET_MEMBER_INVITES = gql`
    query GetMemberInvites {
        getMemberInvites {
            id
            user {
                id
            }
            sender {
                id
            }
            group {
                id
            }
        }
    }
`

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
const CREATE_GROUP_MEMBER = gql`
    mutation CreateMember($userID: String!, $groupID: String!, $role: String!) {
        createMember(userID: $userID, groupID: $groupID, role: $role) {
            user {
                id
                name
            }
            group {
                id
                name
            }
            joinedAt
            role
        }
    }
`

const DELETE_GROUP_INVITE = gql`
    mutation DeleteGroupInvite($id: String!) {
        deleteGroupInvite(id: $id)
    }
`

const Notifications = () => {
    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    const navigate = useNavigate();

    useEffect(() => {
        if(!token) {
            navigate('/login');
        }
    }, [])
    
    const { data, loading, error } = useQuery(FIND_USER, {
        variables: { token: token }
    });
    const { data: profileData } = useQuery(GET_ALL_PROFILE);

    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : 'http://localhost:5173/profile.png';
    };

    const { data: notificationData, refetch: refetchNotifications } = useQuery(GET_USER_NOTIFICATIONS, { variables: {token: token}})
    // console.log(notificationData);

    const calculateTimeAgo = (createdAt) => {
        const currentTime = new Date();
        const postTime = new Date(createdAt);

        const timeDifferenceInSeconds = Math.floor((currentTime.getTime() - postTime.getTime()) / 1000);

        if(timeDifferenceInSeconds < 10) {
            return `Just now`;
        }
        else if(timeDifferenceInSeconds < 60) {
            return `${timeDifferenceInSeconds} seconds ago`;
        } 
        else if(timeDifferenceInSeconds < 3600) {
            const minutes = Math.floor(timeDifferenceInSeconds / 60);
            return `${minutes} minutes ago`;
        } 
        else if(timeDifferenceInSeconds < 86400) {
            const hours = Math.floor(timeDifferenceInSeconds / 3600);
            return `${hours} hours ago`;
        } 
        else {
            const days = Math.floor(timeDifferenceInSeconds / 86400);
            return `${days} days ago`;
        }
    };

    const containsInvited = (content) => {
        return content.toLowerCase().includes('invited');
    }

    const { data: invitesData } = useQuery(GET_MEMBER_INVITES);
    const [createGroupMember] = useMutation(CREATE_GROUP_MEMBER);
    const [deleteGroupInvite] = useMutation(DELETE_GROUP_INVITE);

    const hasMatchingUserId = (userId) => {
        return invitesData?.getMemberInvites.some(invite => invite.user.id === userId);
    };

    const handleJoinGroup = async(inviteId) => {
        const matchingInvite = invitesData?.getMemberInvites.find(invite => invite.id === inviteId);

        if(matchingInvite) {
            const { group } = matchingInvite;
            const groupID = group.id;

            await createGroupMember({
                variables: {
                    userID: data?.getUserByToken.id,
                    groupID: groupID,
                    role: 'Member'
                }
            });

            await deleteGroupInvite({
                variables: {
                    id: inviteId
                }
            });

            refetchNotifications();
        }
    }

    const getMatchingInviteId = (content, userId) => {
        const matchingInvite = invitesData?.getMemberInvites.find(
            invite => invite.user.id === userId && containsInvited(content)
        );
        return matchingInvite ? matchingInvite.id : null;
    };
    
    return (
        <>
            <Header/>
            <div className='notification-page'>
                <div className='notification-container'>
                    <div className='notification-content'>
                        <h2 className='notification-header'>Notifications</h2>
                        {notificationData?.getUserNotifications.map(notification => (
                            <div className='notification-item'>
                                <Image className='notification-user-profile' cloudName="dogiichep" publicId={getProfileImage(notification?.sender.id)}/>
                                <div className='notification-info'>
                                    <div className='notification-content-text'>{notification.content}</div>
                                    <div className='notification-time'>{calculateTimeAgo(notification.createdAt)}</div>
                                    {containsInvited(notification.content) && hasMatchingUserId(notification?.user?.id) && data?.getUserByToken.id === notification?.user?.id && (
                                        <button className='notification-button' onClick={() => handleJoinGroup(getMatchingInviteId(notification.content, notification.user.id))}>Accept Invitation</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Notifications;