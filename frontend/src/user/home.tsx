import React, { useEffect, useRef, useState } from 'react';
import Header from "../components/header";
import styles from '../style/home.module.css';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import CryptoJS from 'crypto-js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AiOutlineLike, AiFillLike } from 'react-icons/ai';
import { FaRegCommentAlt } from 'react-icons/fa';
import { BiShare } from 'react-icons/bi';
import CommentModal from '../components/commentModal';
import axios from 'axios';
import { Image, Video } from 'cloudinary-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useNavigate } from 'react-router-dom';
import CreatePost from '../components/createPost';

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

const CREATE_POST = gql`
    mutation CreatePost($inputPost: NewPost!) {
        createPost(inputPost: $inputPost) {
            id
            user {
                id
            }
            content
            privacy
            createdAt
            likes
            comments
        }
    }
`

const GET_POSTS = gql`
    query GetAllPost($limit: Int, $offset: Int) {
        getAllPost(limit: $limit, offset: $offset) {
            id
            user {
                id
                name
                dob
            }
            content
            privacy
            createdAt
            likes
            comments
        }
    }
`

const CREATE_LIKE = gql`
    mutation CreateLike($userID:String!, $postID:String!) {
        createLike(userID:$userID, postID:$postID) {
            id
        }
    }
`

const DELETE_LIKE = gql`
    mutation DeleteLike($userID:String!, $postID:String!) {
        deleteLike(userID:$userID, postID:$postID)
    }
`

const GET_LIKED_POSTS = gql`
    query GetLikedPost($token: String!) {
        getLikedPost(token: $token) {
            id
            post {
                id
            }
        }
    }
`

const CREATE_POST_IMAGE = gql`
    mutation CreatePostImage($postID: String!, $imageLink: String!) {
        createPostImage(postID: $postID, imageLink: $imageLink) {
            id
            post {
                id
            }
            imageLink
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

const DELETE_POST = gql`
    mutation DeletePost($id: String!) {
        deletePost(id: $id)
    }
`

const Home = () => {
    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    const navigate = useNavigate();

    useEffect(() => {
        if(!token) {
            navigate('/login');
        }
    }, [])

    const [isModalOpen, setModalOpen] = useState(false);
    const [isCommentModalOpen, setCommentModalOpen] = useState(false);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const openCommentModal = (postID) => {
        setSelectedPost(postsData?.getAllPost.find(post => post.id === postID));
        setCommentModalOpen(true);
    }

    const closeCommentModal = () => {
        setCommentModalOpen(false);
    }

    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    // const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const files = event.target.files;
    //     if (files) {
    //         const newImages = Array.from(files);
    //         setSelectedImages((prevImages) => [...prevImages, ...newImages]);
    //     }
    // };

    const [createPost, { data: postData, loading: postLoading, error: postError }] = useMutation(CREATE_POST);

    const { data, loading, error } = useQuery(FIND_USER, {
        variables: { token: token }
    });

    const { data: profileData } = useQuery(GET_ALL_PROFILE);

    // console.log(profileData);

    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : 'http://localhost:5173/profile.png';
    };

    const [itemsLoaded, setItemsLoaded] = useState(5);
    const limit = 5;

    const { data: postsData, loading: postsLoading, error: postsError, refetch: refetchPost, fetchMore } = useQuery(GET_POSTS, {
        variables: { limit: itemsLoaded, offset: 0 }
    });

    useEffect(() => {
        refetchPost();
    }, []);

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

    const [commentVisibility, setCommentVisibility] = useState({});

    const toggleCommentVisibility = (postID) => {
        setCommentVisibility((prevVisibility) => ({
            ...prevVisibility,
            [postID]: !prevVisibility[postID]
        }));
    };

    const [likedPosts, setLikedPosts] = useState({});
    const [createLike] = useMutation(CREATE_LIKE);
    const [deleteLike] = useMutation(DELETE_LIKE);

    const toggleLike = async (postID) => {
        const isPostLiked = likedPosts[postID] || false;

        try {
            if(isPostLiked) {
                await deleteLike({ variables: { postID, userID: data.getUserByToken.id } });
            } 
            else {
                await createLike({ variables: { postID, userID: data.getUserByToken.id } });
            }
            setLikedPosts((prevLiked) => ({
                ...prevLiked,
                [postID]: !isPostLiked
            }));
            refetchPost();
            setSelectedPost(postsData?.getAllPost.find(post => post.id === postID));
        } catch (error) {
            console.error('Error handling like:', error);
        }
    };

    const isEmptyObject = (obj) => {
        return JSON.stringify(obj) === '{}';
    };

    const { data: likedPostsData, loading: likedPostsLoading, error: likedPostsError } = useQuery(GET_LIKED_POSTS, {variables: {token}});

    useEffect(() => {
        if(likedPostsData) {
            // console.log(likedPostsData);
            // console.log(likedPosts);
            if(isEmptyObject(likedPosts)) {
                const likedPostsMap = {};
                likedPostsData.getLikedPost.forEach((likedPost) => {
                    likedPostsMap[likedPost.post.id] = true;
                });
                setLikedPosts(likedPostsMap);
            } 
            postsData?.getAllPost.map((post) => {
                return {
                    ...post,
                    isLiked: !!likedPosts[post.id],
                };
            });
        }
    }, [loading, postLoading, postsLoading, likedPostsLoading, error, postError, postsError, likedPostsError, postsData, likedPostsData]);
    

    const fullName = data?.getUserByToken.name;
    const firstName = fullName?.split(' ')[0];

    const inputPost = {
        userID: data?.getUserByToken.id,
        content: formData?.content,
        privacy: formData?.privacy,
        createdAt: new Date(),
        likes: 0,
        comments: 0
    };

    const handleSubmit = async(e) => {
        // console.log(formData);
        console.log(selectedImages);
        if(!formData.content || !formData.privacy) {
            alert('All fields must be filled');
        }
        else {
            e.preventDefault();
            // console.log("masuk");
            const { data: postResponse } = await createPost({
                variables: {
                  inputPost: inputPost,
                },
            });
            const postId = postResponse.createPost.id;
            // console.log(postId);

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
                    // console.log(response);
                    createPostImage({
                        variables: {
                            postID: postId,
                            imageLink: response.data.secure_url
                        }
                    });
                })
            );
            refetchPost();
            setSelectedImages([]);
            closeModal();
            // console.log(inputPost);
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

    const [selectedPost, setSelectedPost] = useState<{ id: string, content: string; likes: number; comments: number; createdAt: string } | null>(null);
    
    const [createPostImage] = useMutation(CREATE_POST_IMAGE);

    const { data: postImagesData } = useQuery(GET_ALL_IMAGES);

    // console.log(postImagesData.getAllPostImages);
    window.onscroll = async function () {
        if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            if(!postsLoading && postsData?.getAllPost.length >= itemsLoaded) {
                await fetchMore({
                    variables: { offset: itemsLoaded, limit: limit },
                    updateQuery: (prev, { fetchMoreResult }) => {
                        if(!fetchMoreResult) return prev;
                        return {
                            getAllPost: [
                                ...prev.getAllPost,
                                ...fetchMoreResult.getAllPost,
                            ],
                        };
                    },
                });
                setItemsLoaded(itemsLoaded + limit);
            }
        }
    };

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const createStory = () => {
        navigate('/createstory');
    }

    const viewStory = () => {
        navigate('/stories');
    }

    const viewProfile = (userID) => {
        navigate('/profile/'+userID);
    }

    const [deletePost] = useMutation(DELETE_POST);

    const handleDeletePost = async(postID) => {
        await deletePost({
            variables: {
                id: postID
            }
        })
        refetchPost();
    }

    const [profileHover, setProfileHover] = useState(false);

    const handleProfileMouseEnter = () => {
        setProfileHover(true);
    };

    const handleProfileMouseLeave = () => {
        setProfileHover(false);
    };
    
    return (
        <>
            <Header/>
            <body id={styles.root}>
                <div id={styles.flexContainer}>
                    <div id={styles.leftmenu}>
                        <div id={styles.profilemenu} onClick={() => viewProfile(data?.getUserByToken.id)}>
                            <div id={styles.profileframe}><Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} id={styles.homeprofilepic}/></div>
                            <div id={styles.profilename}>{data?.getUserByToken.name}</div>
                        </div>
                    </div>
                    <div id={styles.content}>
                        <div id={styles.storycontainer}>
                            <div id={styles.storyprofile}>
                                <div id={styles.storyprofileframe} onClick={viewStory}><Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} id={styles.storyprofilepic}/></div>
                                <div id={styles.createstorybtn} onClick={createStory}>+</div>
                                <div className={styles.storyTextStyle}>Create Story</div>
                            </div>
                        </div>
                        <div id={styles.postcontainer} onClick={openModal}>
                            <div id={styles.profileframe}>
                                <Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} id={styles.homeprofilepic}/>
                            </div>
                            <input id={styles.postfield} type="text" disabled placeholder={`What's on your mind, ${firstName}?`}></input>
                        </div>
                        {postsData?.getAllPost.map((post) => (
                            <div id={styles.posts} key={post.id}>
                                <div id={styles.postrow}>
                                    <div id={styles.profileframe} onMouseEnter={handleProfileMouseEnter} onMouseLeave={handleProfileMouseLeave}>
                                        <Image cloudName="dogiichep" publicId={getProfileImage(post.user.id)} id={styles.homeprofilepic}/>
                                    </div>
                                    {profileHover && (
                                        <div className={styles.profileHover}>
                                            <div id={styles.profileHoverFrame}>
                                                <Image cloudName="dogiichep" publicId={getProfileImage(post.user.id)} id={styles.hoverprofilepic}/>
                                            </div>
                                            <div>
                                                <h4 id={styles.postname}>{post.user.name}</h4>
                                                <div className={styles.hoverDob}>Born on {post.user.dob}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div id={styles.postdata}>
                                        <h4 id={styles.postname}>{post.user.name}</h4>
                                        <div id={styles.postdate}>{calculateTimeAgo(post.createdAt)}</div>
                                    </div>
                                    {post.user.id === data?.getUserByToken.id &&
                                        <div id={styles.postdelete} onClick={() => handleDeletePost(post.id)}>X</div>
                                    }
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
                                    <div id={styles.action} onClick={() => toggleLike(post.id)}>
                                        {likedPosts[post.id] ? (
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
                        {postsLoading && (
                            <>
                                <div id={styles.posts}>
                                    <Skeleton height={'20vh'} count={1} />
                                </div>
                                <div id={styles.posts}>
                                    <Skeleton height={'20vh'} count={1} />
                                </div>
                                <div id={styles.posts}>
                                    <Skeleton height={'20vh'} count={1} />
                                </div>
                            </>
                        )}
                    </div>
                    <div id={styles.rightmenu}>
                        <div id={styles.profile}><img id={styles.homeprofilepic} src="http://localhost:5173/profile.png"></img></div>
                    </div>
                </div>
            </body>
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
                {isCommentModalOpen && selectedPost && (
                   <CommentModal
                        selectedPost={selectedPost}
                        likedPosts={likedPosts}
                        toggleLike={toggleLike}
                        calculateTimeAgo={calculateTimeAgo}
                        closeCommentModal={closeCommentModal}
                        data={data}
                        refetchPost={refetchPost}
                    />
                )}
            </div>
        </>
    );
    
}

export default Home;