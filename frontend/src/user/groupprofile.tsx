import React, { useEffect, useRef, useState } from 'react';
import Header from "../components/header";
import { IoMdSettings } from 'react-icons/io';
import { MdFeed, MdGroups } from 'react-icons/md';
import { AiFillCompass } from 'react-icons/ai';
import { useNavigate, useParams } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Image, Video } from 'cloudinary-react';
import GroupSidebar from '../components/groupSidebar';
import CreatePost from '../components/createPost';
import axios from 'axios';
import styles from '../style/home.module.css';
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';
import { FaRegCommentAlt } from 'react-icons/fa';
import { BiShare } from 'react-icons/bi';
import GroupCommentModal from '../components/groupComment';

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

const GET_USER_GROUPS = gql`
    query GetUserGroups($userID: String!) {
        getUserGroups(userID: $userID) {
            id
            name
            creator {
                id
                name
            }
            description
            createdAt
            status
        }
    }
`

const GET_GROUP_PROFILES = gql`
    query GetGroupProfiles {
        getGroupProfiles {
            id
            group {
                id
                name
            }
            imageLink
        }
    }
`

const GET_GROUP = gql`
    query GetGroup($id: String!) {
        getGroup(id: $id) {
            id
            name
            creator {
                id
                name
            }
            description
            createdAt
            status
        }
    }
`

const GET_FRIENDS = gql`
    query GetFriends($token: String!) {
        getFriends(token: $token) {
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

const GET_GROUP_MEMBERS = gql`
    query GetGroupMembers($groupID: String!) {
        getGroupMembers(groupID: $groupID) {
            id
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

const CREATE_GROUP_INVITE = gql`
    mutation CreateGroupInvite($userID: String!, $senderID: String!, $groupID: String!) {
        createGroupInvite(userID: $userID, senderID: $senderID, groupID: $groupID) {
            user {
                id
                name
            }
            sender {
                id
                name
            }
            group {
                id
                name
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

const CREATE_GROUP_POST = gql`
    mutation CreateGroupPost($inputGroupPost: NewGroupPost!) {
        createGroupPost(inputGroupPost: $inputGroupPost) {
            id
            group {
                id
                name
            }
            user {
                id
                name
            }
            content
            privacy
            createdAt
            likes
            comments
        }
    }
`

const CREATE_GROUP_POST_MEDIA = gql`
    mutation createGroupPostMedia($groupPostID: String!, $mediaLink: String!) {
        createGroupPostMedia(groupPostID: $groupPostID, mediaLink: $mediaLink) {
            id
            groupPost {
                id
            }
            mediaLink
        }
    }
`

const GET_GROUP_POSTS = gql`
    query GetGroupPosts($groupID: String!, $limit: Int, $offset: Int) {
        getGroupPosts(groupID: $groupID, limit: $limit, offset: $offset) {
            id
            group {
                id
                name
            }
            user {
                id
                name
            }
            content
            privacy
            createdAt
            likes
            comments
        }
    }
`

const GET_GROUP_POST_MEDIAS = gql`
    query GetGroupPostMedias {
        getGroupPostMedias {
            id
            groupPost {
                id
            }
            mediaLink
        }
    }
`

const CREATE_GROUP_LIKE = gql`
    mutation CreateGroupLike($userID:String!, $groupPostID:String!) {
        createGroupLike(userID:$userID, groupPostID:$groupPostID) {
            id
        }
    }
`

const DELETE_GROUP_LIKE = gql`
    mutation DeleteGroupLike($userID:String!, $groupPostID:String!) {
        deleteGroupLike(userID:$userID, groupPostID:$groupPostID)
    }
`

const GET_LIKED_GROUP_POSTS = gql`
    query GetLikedGroupPosts($token: String!) {
        getLikedGroupPosts(token: $token) {
            id
            groupPost {
                id
            }
        }
    }
`

const GroupProfile = () => {
    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    const navigate = useNavigate();

    useEffect(() => {
        if(!token) {
            navigate('/login');
        }
    }, [])

    const params = useParams();
    const id = JSON.stringify(params.id).replace(/"/g, '');

    const handleCreateGroup = () => {
        navigate('/creategroup');
    }

    const { data, loading, error } = useQuery(FIND_USER, {
        variables: { token: token },
    });
    const { data: profileData, refetch: refetchProfile } = useQuery(GET_ALL_PROFILE);
    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : 'http://localhost:5173/profile.png';
    };

    const { data: groupProfilesData } = useQuery(GET_GROUP_PROFILES);
    const { data: userGroupsData } = useQuery(GET_USER_GROUPS, {variables: {userID: data?.getUserByToken.id}});
    const { data: groupData } = useQuery(GET_GROUP, {variables: {id: id}});
    const { data: friendsData } = useQuery(GET_FRIENDS, {variables: {token: token}});
    const { data: membersData } = useQuery(GET_GROUP_MEMBERS,{variables: {groupID: id}});

    const getGroupProfile = (groupID) => {
        const groupProfile = groupProfilesData?.getGroupProfiles.find((profile) => profile.group.id === groupID);
        console.log(groupProfilesData)
        return groupProfile ? groupProfile.imageLink : 'http://localhost:5173/profile.png';
    }

    const handleGroupProfile = (groupID) => {
        navigate('/groupprofile/'+groupID);
    }

    const [isInviting, setInviting] = useState(false);
    const toggleGroupInvite = () => {
        setInviting(prevValue => !prevValue);
    }

    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const handleFriendSelect = (friend) => {
        setSelectedFriends(prevSelectedFriends => {
            if(prevSelectedFriends.includes(friend.user.id)) {
                return prevSelectedFriends.filter(id => id !== friend.user.id);
            } 
            else {
                return [...prevSelectedFriends, friend.user.id];
            }
        });
    };

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

    const [inviteFriend] = useMutation(CREATE_GROUP_INVITE)

    const handleInviteFriends = async() => {
        selectedFriends.map(async(f) => {
            await inviteFriend({
                variables: {
                    userID: f,
                    senderID: data?.getUserByToken.id,
                    groupID: id
                }
            });
            handleCreateNotification(f, data?.getUserByToken.id, "You have been invited to "+groupData?.getGroup.name+" by "+data?.getUserByToken.name);
        })
        alert("Invitations has been sent");
        toggleGroupInvite();
    }

    const [isModalOpen, setModalOpen] = useState(false);

    const closeModal = () => {
        setModalOpen(false);
    }

    const openModal = () => {
        setModalOpen(true);
    }

    const [formData, setFormData] = useState({
        content: '',
        privacy: 'public',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const fullName = data?.getUserByToken.name;
    const firstName = fullName?.split(' ')[0];

    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    const [createGroupPost] = useMutation(CREATE_GROUP_POST);
    const [createGroupPostMedia] = useMutation(CREATE_GROUP_POST_MEDIA);

    const [itemsLoaded, setItemsLoaded] = useState(5);
    const { data: groupPostsData, loading: postsLoading, error: postsError, refetch: refetchGroupPost, fetchMore } = useQuery(GET_GROUP_POSTS, {
        variables: { groupID: id, limit: itemsLoaded, offset: 0 }
    });
    const { data: groupPostMediasData } = useQuery(GET_GROUP_POST_MEDIAS);

    const inputGroupPost = {
        userID: data?.getUserByToken.id,
        groupID: id,
        content: formData?.content,
        privacy: formData?.privacy,
        createdAt: new Date(),
        likes: 0,
        comments: 0
    };

    const handleSubmit = async(e) => {
        if(!formData.content || !formData.privacy) {
            alert('All fields must be filled');
        }
        else {
            e.preventDefault();
            const { data: res } = await createGroupPost({
                variables: {
                    inputGroupPost: inputGroupPost,
                },
            });
            const postId = res.createGroupPost.id;

            await Promise.all(
                selectedImages.map(async(image) => {
                    const formData = new FormData();
                    formData.append('file', image);
                    formData.append('upload_preset', 'sd30tg2s');

                    let uploadEndpoint = 'https://api.cloudinary.com/v1_1/dogiichep/image/upload';
                    if(image?.type.startsWith('video')) {
                        uploadEndpoint = 'https://api.cloudinary.com/v1_1/dogiichep/video/upload';
                    }
                    const response = await axios.post(uploadEndpoint, formData);
                    
                    createGroupPostMedia({
                        variables: {
                            groupPostID: postId,
                            mediaLink: response.data.secure_url
                        }
                    });
                })
            );
            setSelectedImages([]);
            refetchGroupPost();
            closeModal();
        }
    }

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

    const [likedGroupPosts, setLikedGroupPosts] = useState({});
    const [createGroupLike] = useMutation(CREATE_GROUP_LIKE);
    const [deleteGroupLike] = useMutation(DELETE_GROUP_LIKE);

    const [selectedGroupPost, setSelectedGroupPost] = useState<{ id: string, content: string; likes: number; comments: number; createdAt: string } | null>(null);

    const toggleLike = async (postID) => {
        const isPostLiked = likedGroupPosts[postID] || false;

        try {
            if(isPostLiked) {
                await deleteGroupLike({ variables: { groupPostID: postID, userID: data.getUserByToken.id } });
            } 
            else {
                await createGroupLike({ variables: { groupPostID: postID, userID: data.getUserByToken.id } });
            }
            setLikedGroupPosts((prevLiked) => ({
                ...prevLiked,
                [postID]: !isPostLiked
            }));
            refetchGroupPost();
            setSelectedGroupPost(groupPostsData?.getGroupPosts.find(post => post.id === postID));
        } catch (error) {
            console.error('Error handling like:', error);
        }
    };

    const [commentVisibility, setCommentVisibility] = useState({});

    const toggleCommentVisibility = (postID) => {
        setCommentVisibility((prevVisibility) => ({
            ...prevVisibility,
            [postID]: !prevVisibility[postID]
        }));
    };

    const [isCommentModalOpen, setCommentModalOpen] = useState(false);

    const openCommentModal = (postID) => {
        setSelectedGroupPost(groupPostsData?.getGroupPosts.find(post => post.id === postID));
        setCommentModalOpen(true);
    }

    const closeCommentModal = () => {
        setCommentModalOpen(false);
    }

    const { data: likedPostsData } = useQuery(GET_LIKED_GROUP_POSTS, {variables: {token}});
    
    useEffect(() => {
        if (likedPostsData) {
            const likedPostsMap = {};
            likedPostsData.getLikedGroupPosts.forEach((likedPost) => {
                likedPostsMap[likedPost.groupPost.id] = true;
            });
            setLikedGroupPosts(likedPostsMap);
        }
    }, [likedPostsData]);
    
    return (
        <div className='groups-page'>
            <Header/>
            <GroupSidebar
                handleCreateGroup={handleCreateGroup}
                userGroupsData={userGroupsData}
                getGroupProfile={getGroupProfile}
                handleGroupProfile={handleGroupProfile}
            />
            <div className='group-sidebar-block'></div>
            <div className='group-profile-content'>
                <div className='group-profile-container'>
                    <div className='group-profile-data'>
                        <Image className='group-profile-cover' cloudName="dogiichep" publicId={getGroupProfile(id)}/>
                        <div className='group-profile-name'>{groupData?.getGroup.name}</div>
                        <button className='group-invite-btn' onClick={toggleGroupInvite}>+ Invite</button>
                    </div>
                    <div className='group-post-group'>
                        <div className="group-post-container" onClick={openModal}>
                            <Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} className='group-post-profileframe'/>
                            <input className='group-post-field' type="text" disabled placeholder={`Write something...`}></input>
                        </div>
                        <div className='group-info-container'>
                            <div className='group-info-header'>About</div>
                            <div className='group-info-desc'>{groupData?.getGroup.description}</div>
                            <div className='group-info-privacy'>{groupData?.getGroup.status} Group</div>
                        </div>
                    </div>
                        {groupPostsData?.getGroupPosts.map((post) => (
                            <div id={styles.posts} key={post.id}>
                                <div id={styles.postrow}>
                                    <div id={styles.profileframe}>
                                        <Image cloudName="dogiichep" publicId={getProfileImage(post.user.id)} id={styles.homeprofilepic}/>
                                    </div>
                                    <div id={styles.postdata}>
                                        <h4 id={styles.postname}>{post.user.name}</h4>
                                        <div id={styles.postdate}>{calculateTimeAgo(post.createdAt)}</div>
                                    </div>
                                </div>
                                <div id={styles.postrow}>
                                    <div id={styles.postedcontent}>{post.content}</div>
                                </div>
                                <div id={styles.postImages}>
                                    {groupPostMediasData?.getGroupPostMedias.filter((image) => image.groupPost.id === post.id).length > 1 ? (
                                        <div className={styles.Imagecarousel}>
                                            {groupPostMediasData?.getGroupPostMedias.filter((image) => image.groupPost.id === post.id)[currentImageIndex].imageLink.endsWith('.mp4') || groupPostMediasData?.getGroupPostMedias.filter((image) => image.groupPost.id === post.id)[currentImageIndex].imageLink.endsWith('.mkv') ? (
                                                <Video
                                                    cloudName="dogiichep"
                                                    publicId={groupPostMediasData?.getGroupPostMedias.filter((image) => image.groupPost.id === post.id)[currentImageIndex].mediaLink}
                                                    controls
                                                    className={styles.postimage}
                                                />
                                            ) : (
                                                <Image
                                                    cloudName="dogiichep"
                                                    publicId={groupPostMediasData?.getGroupPostMedias.filter((image) => image.groupPost.id === post.id)[currentImageIndex].mediaLink}
                                                    className={styles.postimage}
                                                />
                                            )}
                                            <div id={styles.carouselrow}>
                                                <div className={styles.carouselLeftButton} onClick={() => {if(currentImageIndex > 0) {setCurrentImageIndex(currentImageIndex - 1)}}}>
                                                    &lt;
                                                </div>
                                                <div className={styles.carouselRightButton} onClick={() => {if(currentImageIndex < groupPostMediasData?.getGroupPostMedias.filter((image) => image.post.id === post.id).length - 1) {setCurrentImageIndex(currentImageIndex + 1)}}}>
                                                    &gt;
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        groupPostMediasData?.getGroupPostMedias.filter((image) => image.groupPost.id === post.id).map((image, index) => (
                                            image.mediaLink.endsWith('.mp4') || image.mediaLink.endsWith('.mkv') ? (
                                                <Video key={index} cloudName="dogiichep" publicId={image.mediaLink} controls className={styles.postimage} />
                                            ) : (
                                                <Image key={index} cloudName="dogiichep" publicId={image.mediaLink} className={styles.postimage} />
                                            )
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
                                    <div id={styles.action} onClick={() => toggleLike(post.id)}>
                                        {likedGroupPosts[post.id] ? (
                                            <AiFillLike size={20} color="blue" />
                                        ) : (
                                            <AiOutlineLike size={20} color="black" />
                                        )}
                                        <div id={styles.like}>Like</div>
                                    </div>
                                    <div id={styles.action} onClick={() => toggleCommentVisibility(post.id)}>
                                        <FaRegCommentAlt size={18}/>
                                        <div id={styles.comment}>Comment</div>
                                    </div>
                                    <div id={styles.action}>
                                        <BiShare size={20}/>
                                        <div id={styles.share}>Share</div>
                                    </div>
                                </div>
                                <div className={styles.divider}></div>
                                {commentVisibility[post.id] && (
                                    <div id={styles.postrow} onClick={() => openCommentModal(post.id)}>
                                        <div id={styles.profileframe}><Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} id={styles.homeprofilepic}/></div>
                                        <input id={styles.postfield} disabled type="text" placeholder='Write a comment...'></input>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            </div>
            {isInviting &&
                <div className='group-invite-background'>
                    <div className='group-invite-container'>
                        <div className='group-invite-header'>
                            <div className='invite-header-text'>Invite friends to this group</div>
                            <div className='invite-close' onClick={toggleGroupInvite}>X</div>
                        </div>
                        <div className='group-invite-options'>
                            {friendsData && friendsData?.getFriends.map((f) => (
                                !membersData?.getGroupMembers.some(member => member.user.id === f.user.id) && (
                                    <div className='friend-invite-row' onClick={() => handleFriendSelect(f)}>
                                        <Image className='friend-invite-img' cloudName="dogiichep" publicId={getProfileImage(f.user.id)}/>
                                        <div className='friend-invite-name'>{f.user.name}</div>
                                        <input
                                            type='checkbox'
                                            onChange={() => handleFriendSelect(f)}
                                            checked={selectedFriends.includes(f.user.id)}
                                            className='friend-invite-checkbox'
                                        />
                                    </div>
                                )
                            ))}
                            <button className='friend-invite-btn' onClick={handleInviteFriends}>Send Invites</button>
                        </div>
                    </div>
                </div>
            }
            <div>
                <CreatePost
                    isModalOpen={isModalOpen}
                    closeModal={closeModal}
                    data={data}
                    handleChange={handleChange}
                    firstName={firstName}
                    selectedImages={selectedImages}
                    setSelectedImages={setSelectedImages}
                    handleSubmit={handleSubmit}
                    getProfileImage={getProfileImage}
                />
            </div>
            <div>
                {isCommentModalOpen && selectedGroupPost && (
                   <GroupCommentModal
                        selectedGroupPost={selectedGroupPost}
                        likedGroupPosts={likedGroupPosts}
                        toggleLike={toggleLike}
                        calculateTimeAgo={calculateTimeAgo}
                        closeCommentModal={closeCommentModal}
                        data={data}
                        refetchGroupPost={refetchGroupPost}
                    />
                )}
            </div>
        </div>
    );
}

export default GroupProfile;