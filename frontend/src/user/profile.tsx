import React, { useEffect, useRef, useState } from 'react';
import Header from "../components/header";
import { gql, useMutation, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { Image } from 'cloudinary-react';
import { AiFillCamera, AiFillLike, AiOutlineLike } from 'react-icons/ai';
import styles from '../style/home.module.css';
import { FaRegCommentAlt } from 'react-icons/fa';
import { BiShare } from 'react-icons/bi';
import axios from 'axios';

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

const GET_USER = gql`
    query GetUser($id: ID!) {
        getUser(id: $id) {
            id
            name
            email
            dob
            gender
            status
        }
    }
`

const GET_USER_PROFILE_COVER = gql`
    query GetUserProfileCover($userID: String!) {
        getUserProfileCover(userID: $userID) {
            id
            imageLink
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

const GET_FRIEND_SUGGESTIONS = gql`
    query GetFriendSuggestions($token: String!) {
        getFriendSuggestions(token: $token) {
            id
            name
        }
    }
`

const GET_USER_POSTS = gql`
    query GetUserPosts($userID: String!) {
        getUserPosts(userID: $userID) {
            id
            user {
                id
                name
            }
            privacy
            content
            createdAt
            likes
            comments
        }
    }
`

const GET_ALL_IMAGES = gql`
    query GetAllPostImages {
        getAllPostImages {
            id
            post {
                id
            }
            imageLink
        }
    }
`

// const CREATE_LIKE = gql`
//     mutation CreateLike($userID:String!, $postID:String!) {
//         createLike(userID:$userID, postID:$postID) {
//             id
//         }
//     }
// `

// const DELETE_LIKE = gql`
//     mutation DeleteLike($userID:String!, $postID:String!) {
//         deleteLike(userID:$userID, postID:$postID)
//     }
// `

const UPDATE_USER_PROFILE = gql`
    mutation UpdateUserProfile($userID: String!, $imageLink: String!) {
        updateUserProfile(userID: $userID, imageLink: $imageLink) {
            id
            user {
                id
                name
            }
            imageLink
        }
    }
`

const UPDATE_USER_PROFILE_COVER = gql`
    mutation UpdateUserProfileCover($userID: String!, $imageLink: String!) {
        updateUserProfileCover(userID: $userID, imageLink: $imageLink) {
            id
            user {
                id
                name
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

const GET_USER_REQUESTS = gql`
    query GetUserFriendRequests($userID: String!) {
        getUserFriendRequests(userID: $userID) {
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

const GET_USER_MUTUALS = gql`
    query GetUserMutuals($token: String!, $userID: String!) {
        getUserMutuals(token: $token, userID: $userID)
    }
`

type MutualsCount = number;

const Profile = () => {
    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    const navigate = useNavigate();

    useEffect(() => {
        if(!token) {
            navigate('/login');
        }
    }, [])

    const { data: currUserData, loading, error } = useQuery(FIND_USER, {
        variables: { token: token }
    });

    const params = useParams();
    const id = JSON.stringify(params.id).replace(/"/g, '');

    const { data } = useQuery(GET_USER, {variables: {id: id}});
    const { data: profileCoverData } = useQuery(GET_USER_PROFILE_COVER, {variables: {userID: id}});
    const { data: profileData } = useQuery(GET_ALL_PROFILE);
    const { data: suggestionData, refetch: refetchSuggestions } = useQuery(GET_FRIEND_SUGGESTIONS, {variables: {token: token}});
    const { data: postsData, refetch: refetchPosts } = useQuery(GET_USER_POSTS, {variables: {userID: id}});
    const { data: postImagesData } = useQuery(GET_ALL_IMAGES);
    const [ updateUserProfile ] = useMutation(UPDATE_USER_PROFILE);
    const [ updateUserProfileCover ] = useMutation(UPDATE_USER_PROFILE_COVER);
    const { data: requestData, refetch: refetchRequest } = useQuery(GET_USER_REQUESTS, {variables: {userID: currUserData?.getUserByToken.id}});
    const { data: currUser } = useQuery(FIND_USER, {variables: {token: token}});
    const { data: friendsData } = useQuery(GET_USER_FRIENDS, {variables: {userID: id}});

    // console.log(suggestionData);

    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : './profile.png';
    };

    const calculateTimeAgo = (createdAt) => {
        const currentTime = new Date();
        const postTime = new Date(createdAt);

        const timeDifferenceInSeconds = Math.floor((currentTime.getTime() - postTime.getTime()) / 1000);

        if(timeDifferenceInSeconds < 10) {
            return `Just now`;
        }
        else if(timeDifferenceInSeconds < 60) {
            return `${timeDifferenceInSeconds}s`;
        } 
        else if(timeDifferenceInSeconds < 3600) {
            const minutes = Math.floor(timeDifferenceInSeconds / 60);
            return `${minutes}m`;
        } 
        else if(timeDifferenceInSeconds < 86400) {
            const hours = Math.floor(timeDifferenceInSeconds / 3600);
            return `${hours}h`;
        } 
        else {
            const days = Math.floor(timeDifferenceInSeconds / 86400);
            return `${days}d`;
        }
    };

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // const [likedPosts, setLikedPosts] = useState({});
    // const [createLike] = useMutation(CREATE_LIKE);
    // const [deleteLike] = useMutation(DELETE_LIKE);

    // const toggleLike = async (postID) => {
    //     const isPostLiked = likedPosts[postID] || false;

    //     try {
    //         if(isPostLiked) {
    //             await deleteLike({ variables: { postID, userID: data.getUserByToken.id } });
    //         } 
    //         else {
    //             await createLike({ variables: { postID, userID: data.getUserByToken.id } });
    //         }
    //         setLikedPosts((prevLiked) => ({
    //             ...prevLiked,
    //             [postID]: !isPostLiked
    //         }));
    //         refetchPosts();
    //     } catch (error) {
    //         console.error('Error handling like:', error);
    //     }
    // };

    const [editDialog, setEditDialog] = useState(false);

    const toggleDialog = () => {
        setEditDialog(prevValue => !prevValue);
    }

    const handleProfileChange = async(event) => {
        const file = event.target.files[0];

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'sd30tg2s');

        const response = await axios.post(
            'https://api.cloudinary.com/v1_1/dogiichep/image/upload',
            formData
        );

        await updateUserProfile({
            variables: {
                userID: data?.getUser.id,
                imageLink: response.data.secure_url
            }
        })
    };
    
    const handleCoverChange = async(event) => {
        const file = event.target.files[0];

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'sd30tg2s');

        const response = await axios.post(
            'https://api.cloudinary.com/v1_1/dogiichep/image/upload',
            formData
        );

        await updateUserProfileCover({
            variables: {
                userID: data?.getUser.id,
                imageLink: response.data.secure_url
            }
        })
    };

    const [createFriendRequest] = useMutation(CREATE_FRIEND_REQUEST);

    const handleAddFriend = async(requestedUserID) => {
        await createFriendRequest({
            variables: {
                userID: currUser?.getUserByToken.id,
                requestedUserID: requestedUserID
            }
        })
        refetchSuggestions();
        handleCreateNotification(requestedUserID, currUser?.getUserByToken.id, currUser?.getUserByToken.name+" has requested to be your friend");
    }

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
    const isFriendRequestSent = requestData?.getUserFriendRequests.some(request => request.requestedUser.id === data?.getUser.id);
    const isFriends = friendsData?.getUserFriends.some(f => f.user.id === currUser?.getUserByToken.id);
    // console.log(friendsData?.getUserFriends);

    const { data: mutualsData, refetch: refetchMutuals } = useQuery(GET_USER_MUTUALS);

    const [mutualsCounts, setMutualsCounts] = useState<number[]>([]);

    useEffect(() => {
        if(suggestionData?.getFriendSuggestions) {
            const fetchMutualsCounts = async () => {
                const counts = await Promise.all(
                    suggestionData.getFriendSuggestions.map(s => {
                        return refetchMutuals({ token: token, userID: s.id });
                    })
                );
                setMutualsCounts(counts.map(result => result.data.getUserMutuals));
            };
            fetchMutualsCounts();
        }
    }, [suggestionData, token]);

    const handleMessageFriend = () => {
        navigate('/messenger');
    }

    return (
        <>
            <Header/>
            <div className='profile-page'>
                <div className='profile-container'>
                    <div className='profile-content'>
                        <div className='profile-cover-group'>
                            <Image className='profile-cover' cloudName="dogiichep" publicId={profileCoverData?.getUserProfileCover.imageLink}/>
                            {/* <div className='edit-cover-text'><AiFillCamera color='white' size={'3vh'}/> Edit cover photo</div> */}
                        </div>
                        <div className='profile-info'>
                            <Image className='profile-pic' cloudName="dogiichep" publicId={getProfileImage(id)}/>
                            <div className='profile-info-row'>
                                <div className='profile-name'>{data?.getUser.name}</div>
                                <div className='profile-friends'>{friendsData?.getUserFriends.length} friends</div>
                            </div>
                            {data?.getUser.id === currUserData?.getUserByToken.id ? (
                                <div className='profile-edit'>
                                    <button className='profile-edit-btn' onClick={toggleDialog}>Edit Profile</button>
                                </div>
                            ) : isFriendRequestSent ? (
                                <div className='profile-edit'>
                                    <button className='profile-edit-btn'>Requested</button>
                                </div>
                            ) : !isFriends ? (
                                <div className='profile-edit'>
                                    <button className='profile-edit-btn' onClick={() => handleAddFriend(data?.getUser.id)}>Add Friend</button>
                                </div>
                            ) : (
                                <div className='profile-edit'>
                                    <button className='profile-edit-btn' onClick={handleMessageFriend}>Message</button>
                                </div>
                            )}
                        </div>
                        {suggestionData?.getFriendSuggestions.length !== 0 && (
                            <div className='profile-friend-suggestions'>
                                <h3 className='profile-friend-header'>People You May Know</h3>
                                <div className='profile-friend-row'>
                                    {suggestionData?.getFriendSuggestions.map((s, index) => {
                                        // console.log(s.id);
                                        refetchMutuals({token: token, userID: s.id})

                                        return (
                                            <div className='profile-friend-card'>
                                                <Image className='profile-friend-img' cloudName="dogiichep" publicId={getProfileImage(s.id)}/>
                                                <div className='friends-data'>
                                                    <div className='profile-friend-name'>{s.name}</div>
                                                    <div className='mutual-friends'>
                                                        Mutuals: {mutualsCounts[index]}
                                                    </div>
                                                    <button className='accept-request-btn' onClick={() => handleAddFriend(s.id)}>Add Friend</button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='profile-user-group'>
                        <div className='profile-intro-container'>
                            <div className='profile-intro'>
                                <div className='profile-intro-header'>Intro</div>
                                <div className='profile-user-info'>
                                    Born on {data?.getUser.dob}
                                </div>
                            </div>
                        </div>
                        <div className='profile-posts-container'>
                            <div className='profile-posts-title'>
                                <div className='profile-posts-header'>Posts</div>
                            </div>
                            <div className='profile-posts'>
                                {postsData?.getUserPosts.map((post) => (
                                    <div className="posts" key={post.id}>
                                        <div id={styles.postrow}>
                                            <div id={styles.profileframe}><Image cloudName="dogiichep" publicId={getProfileImage(post.user.id)} id={styles.homeprofilepic}/></div>
                                            <div id={styles.postdata}>
                                                <h4 id={styles.postname}>{post.user.name}</h4>
                                                <div id={styles.postdate}>{calculateTimeAgo(post.createdAt)}</div>
                                            </div>
                                        </div>
                                        <div id={styles.postrow}>
                                            <div id={styles.postedcontent}>{post.content}</div>
                                        </div>
                                        <div id={styles.postImages}>
                                            {postImagesData?.getAllPostImages.filter((image) => image.post.id === post.id).length > 1 ? (
                                                <div className={styles.Imagecarousel}>
                                                    <Image
                                                        cloudName="dogiichep"
                                                        publicId={postImagesData?.getAllPostImages.filter((image) => image.post.id === post.id)[currentImageIndex].imageLink}
                                                        className={styles.postimage}
                                                    />
                                                    <div id={styles.carouselrow}>
                                                        <div className={styles.carouselLeftButton} onClick={() => {if(currentImageIndex > 0) {setCurrentImageIndex(currentImageIndex - 1)}}}>
                                                            &lt;
                                                        </div>
                                                        <div className={styles.carouselRightButton} onClick={() => {if(currentImageIndex < postImagesData?.getAllPostImages.filter((image) => image.post.id === post.id).length - 1) {setCurrentImageIndex(currentImageIndex + 1)}}}>
                                                            &gt;
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                postImagesData?.getAllPostImages.filter((image) => image.post.id === post.id).map((image, index) => (
                                                    <Image key={index} cloudName="dogiichep" publicId={image.imageLink} className={styles.postimage} />
                                                ))
                                            )}
                                        </div>
                                        <div id={styles.postrow}>
                                            <AiFillLike size={"2.5vh"} color="black" />
                                            <div id={styles.likecount}>{post.likes}</div>
                                            <div id={styles.commentcount}>{post.comments} comments</div>
                                        </div>
                                        <div className={styles.divider}></div>
                                        <div id={styles.postaction}>
                                            <div id={styles.action}>
                                                {/* {likedPosts[post.id] ? (
                                                    <AiFillLike size={20} color="blue" />
                                                ) : ( */}
                                                    <AiOutlineLike size={20} color="black" />
                                                {/* )} */}
                                                <div id={styles.like}>Like</div>
                                            </div>
                                            <div id={styles.action}>
                                                <FaRegCommentAlt size={18}/>
                                                <div id={styles.comment}>Comment</div>
                                            </div>
                                            <div id={styles.action}>
                                                <BiShare size={20}/>
                                                <div id={styles.share}>Share</div>
                                            </div>
                                        </div>
                                        <div className={styles.divider}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {editDialog && (
                <div className='edit-dialog-background'>
                    <div className='edit-dialog-container'>
                        <div className='edit-dialog-header-row'>
                            <div className='edit-dialog-header'>Edit Profile</div>
                            <div className='edit-dialog-close' onClick={toggleDialog}>X</div>
                        </div>
                        <div className='divider'></div>
                        <div className='edit-dialog-row'>
                            <div className='edit-profile-group'>
                                <div className='edit-profile-header'>Profile picture</div>
                                <div className='edit-profile-text'
                                    onClick={(e) => {
                                        const inputElement = document.createElement('input');
                                        inputElement.type = 'file';
                                        inputElement.accept = 'image/*';
                                        inputElement.addEventListener('change', handleProfileChange)
                                        inputElement.click();
                                    }}
                                >
                                    Edit
                                </div>
                            </div>
                            <Image className='edit-profile-pic' cloudName="dogiichep" publicId={getProfileImage(id)}/>
                        </div>
                        <div className='edit-dialog-row'>
                            <div className='edit-profile-group'>
                                <div className='edit-profile-header'>Cover photo</div>
                                <div className='edit-profile-text'
                                    onClick={(e) => {
                                        const inputElement = document.createElement('input');
                                        inputElement.type = 'file';
                                        inputElement.accept = 'image/*';
                                        inputElement.addEventListener('change', handleCoverChange)
                                        inputElement.click();
                                    }}
                                >
                                    Edit
                                </div>
                            </div>
                            <Image className='edit-cover-pic' cloudName="dogiichep" publicId={profileCoverData?.getUserProfileCover.imageLink}/>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Profile;