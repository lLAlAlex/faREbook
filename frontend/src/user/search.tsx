import React, { useEffect, useState } from 'react';
import '../style/style.css';
import { useNavigate, useParams } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';
import Header from '../components/header';
import { BsFilePost, BsFillPeopleFill } from 'react-icons/bs';
import { HiUserGroup } from 'react-icons/hi';
import styles from '../style/home.module.css';
import { Image, Video } from 'cloudinary-react';
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';
import { FaRegCommentAlt } from 'react-icons/fa';
import { BiShare } from 'react-icons/bi';

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

const SEARCH_POSTS = gql`
    query SearchPost($query: String!) {
        searchPost(query: $query) {
            id
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

const SEARCH_USERS = gql`
    query SearchUser($query: String!) {
        searchUser(query: $query) {
            id
            name
            email
            password
            dob
            gender
            status
        }
    }
`

const SEARCH_GROUPS = gql`
    query SearchGroup($query: String!) {
        searchGroup(query: $query) {
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

const Search = () => {
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

    const params = useParams();
    const query = JSON.stringify(params.query).replace(/"/g, '');

    // console.log(query);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsLoaded, setItemsLoaded] = useState(5);
    const limit = 5;

    const { data: usersData, refetch: refetchUsers } = useQuery(SEARCH_USERS, {variables: {query: query}});
    const { data: postsData, fetchMore } = useQuery(SEARCH_POSTS, {
        variables: { query: query, offset: 0, limit: itemsLoaded },
    });
    const postsLoading = loading || !postsData;
    const { data: groupsData } = useQuery(SEARCH_GROUPS, {variables: {query: query}});
    const { data: friendsData } = useQuery(GET_USER_FRIENDS, {variables: {userID: data?.getUserByToken.id}});
    const { data: requestsData, refetch: refetchRequests } = useQuery(GET_USER_REQUESTS, {variables: {userID: data?.getUserByToken.id}})

    const [isSearchingUser, setSearchingUser] = useState(false);
    const [isSearchingPost, setSearchingPost] = useState(false);
    const [isSearchingGroup, setSearchingGroup] = useState(false);

    const handleSearchUser = () => {
        setSearchingPost(false);
        setSearchingGroup(false);
        setSearchingUser(true);
    }

    const handleSearchGroup = () => {
        setSearchingPost(false);
        setSearchingUser(false);
        setSearchingGroup(true);
    }

    const handleSearchPost = () => {
        setSearchingUser(false);
        setSearchingGroup(false);
        setSearchingPost(true);
    }

    const { data: profileData } = useQuery(GET_ALL_PROFILE);

    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : 'http://localhost:5173/profile.png';
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
    const { data: postImagesData } = useQuery(GET_ALL_IMAGES);

    // console.log(usersData);

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

    const [createFriendRequest] = useMutation(CREATE_FRIEND_REQUEST);
    const handleAddFriend = async(requestedUserID) => {
        await createFriendRequest({
            variables: {
                userID: data?.getUserByToken.id,
                requestedUserID: requestedUserID
            }
        });
        handleCreateNotification(requestedUserID, data?.getUserByToken.id, data?.getUserByToken.name+" has requested to be your friend");
        refetchRequests();
        refetchUsers();
    }

    const { data: groupProfilesData } = useQuery(GET_GROUP_PROFILES);
    const getGroupProfile = (groupID) => {
        const groupProfile = groupProfilesData?.getGroupProfiles.find((profile) => profile.group.id === groupID);
        return groupProfile ? groupProfile.imageLink : 'http://localhost:5173/profile.png';
    }

    window.onscroll = async function () {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            if (!postsLoading && postsData?.searchPost.length >= itemsLoaded) {
                setCurrentPage(currentPage + 1);
                setItemsLoaded(itemsLoaded + limit);
    
                // Fetch more data
                await fetchMore({
                    variables: { query: query, offset: itemsLoaded, limit: limit },
                    updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return prev;
                        return {
                            searchPost: [...prev.searchPost, ...fetchMoreResult.searchPost],
                        };
                    },
                });
            }
        }
    };

    return (
        <>
            <div className='search-page'>
                <Header/>
                <div className='search-sidebar'>
                    <div className='search-header'>Search results</div>
                    <div className='divider'></div>
                    <div className='search-filters'>Filters</div>
                    <div className='search-posts' onClick={handleSearchPost}>
                        <div className='search-posts-icon'><BsFilePost color='white' size={'4vh'} /></div>
                        <div className='search-posts-text'>Posts</div>
                    </div>
                    <div className='search-posts' onClick={handleSearchGroup}>
                        <div className='search-posts-icon'><HiUserGroup color='white' size={'4vh'} /></div>
                        <div className='search-posts-text'>Groups</div>
                    </div>
                    <div className='search-posts' onClick={handleSearchUser}>
                        <div className='search-posts-icon'><BsFillPeopleFill color='white' size={'4vh'} /></div>
                        <div className='search-posts-text'>People</div>
                    </div>
                </div>
                <div className='search-container'>
                    {isSearchingPost ? (
                        <div className='search-post-results'>
                            {postsData?.searchPost.map((post) => (
                                <div className="posts" key={post.id}>
                                    <div id={styles.postrow}>
                                        <div id={styles.profileframe}><Image cloudName="dogiichep" publicId={getProfileImage(post.user.id)} id={styles.homeprofilepic}/></div>
                                        <div id={styles.postdata}>
                                            <h4 id={styles.postname}>{post.user.name}</h4>
                                            <div id={styles.postdate}>{calculateTimeAgo(post.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div id={styles.postrow}>
                                        <div id={styles.postedcontent}>
                                            {(() => {
                                            const tempDiv = document.createElement('div');
                                            tempDiv.innerHTML = post.content;
                                            return tempDiv.textContent || tempDiv.innerText || '';
                                            })()}
                                        </div>
                                    </div>
                                    <div id={styles.postImages}>
                                        {postImagesData?.getAllPostImages.filter((image) => image.post.id === post.id).length > 1 ? (
                                            <div className={styles.Imagecarousel}>
                                                {postImagesData?.getAllPostImages.filter((image) => image.post.id === post.id)[currentImageIndex].imageLink.endsWith('.mp4') || postImagesData?.getAllPostImages.filter((image) => image.post.id === post.id)[currentImageIndex].imageLink.endsWith('.mkv') ? (
                                                    <Video
                                                        cloudName="dogiichep"
                                                        publicId={postImagesData?.getAllPostImages.filter((image) => image.post.id === post.id)[currentImageIndex].imageLink}
                                                        controls
                                                        className={styles.postimage}
                                                    />
                                                ) : (
                                                    <Image
                                                        cloudName="dogiichep"
                                                        publicId={postImagesData?.getAllPostImages.filter((image) => image.post.id === post.id)[currentImageIndex].imageLink}
                                                        className={styles.postimage}
                                                    />
                                                )}
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
                                                image.imageLink.endsWith('.mp4') || image.imageLink.endsWith('.mkv') ? (
                                                    <Video key={index} cloudName="dogiichep" publicId={image.imageLink} controls className={styles.postimage} />
                                                ) : (
                                                    <Image key={index} cloudName="dogiichep" publicId={image.imageLink} className={styles.postimage} />
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
                    ) : isSearchingUser ? (
                        <div className='search-user-results'>
                            {usersData && usersData?.searchUser.map(user => (
                                <div className='users-container'>
                                    <div className='search-profile-frame'><Image cloudName="dogiichep" publicId={getProfileImage(user.id)} className='search-profile-pic'/></div>
                                    <div className='search-user-name'>{user.name}</div>
                                    {!friendsData?.getUserFriends.some(friend => friend.friend.id === user.id) && 
                                    !requestsData?.getUserFriendRequests.some(request => request.requestedUser.id === user.id) && (
                                        <div className='search-user-add'>
                                            <button className='add-user-btn' onClick={() => handleAddFriend(user.id)}>Add Friend</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : isSearchingGroup && (
                        <div className='search-user-results'>
                            {groupsData && groupsData?.searchGroup.map(group => (
                                <div className='users-container'>
                                    <div className='search-profile-frame'><Image cloudName="dogiichep" publicId={getGroupProfile(group.id)} className='search-profile-pic'/></div>
                                    <div className='search-user-name'>{group.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Search