import React, { useEffect, useState } from 'react';
import '../style/style.css';
import { FaFacebookMessenger, FaPenSquare } from 'react-icons/fa';
import { IoIosNotifications } from 'react-icons/io';
import { BiLogOut, BiSolidComment, BiSolidShare } from 'react-icons/bi';
import { useLocation, useNavigate } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Image, Video } from 'cloudinary-react';
import { AiFillLike } from 'react-icons/ai';
import ReelComponent from '../components/reelComment';

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

const GET_PUBLIC_REELS = gql`
    query GetPublicReels {
        getPublicReels {
            id
            user {
                id
                name
            }
            title
            privacy
            createdAt
            likes
            comments
        }
    }
`

const GET_REEL_VIDEOS = gql`
    query GetReelVideos {
        getReelVideos {
            id
            reel {
                id
            }
            videoLink
        }
    }
`

const CREATE_REEL_LIKE = gql`
    mutation CreateReelLike($userID:String!, $reelID:String!) {
        createReelLike(userID:$userID, reelID:$reelID) {
            id
        }
    }
`

const DELETE_REEL_LIKE = gql`
    mutation DeleteReelLike($userID:String!, $reelID:String!) {
        deleteReelLike(userID:$userID, reelID:$reelID)
    }
`

const GET_LIKED_REELS = gql`
    query GetLikedReels($token: String!) {
        getLikedReels(token: $token) {
            id
            reel {
                id
            }
        }
    }
`

const Reels = () => {
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
    const [dropdownVisible, setDropdownVisible] = React.useState(false);

    const logout = () => {
        localStorage.clear();
    }

    const renderDropdown = () => {
        if(dropdownVisible) {
            console.log("masuk");
            return (
                <div className="dropdown-content">
                    <div id="dropdownprofile">
                        <div id="dropdownprofileicon"><Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} style={{width: "100%"}}/></div>
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

    const toggleDropdown = () => {
        setDropdownVisible(prevVisible => !prevVisible);
    };

    const { data, loading, error } = useQuery(FIND_USER, {
        variables: { token: token },
    });

    const { data: profileData } = useQuery(GET_ALL_PROFILE);

    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : 'http://localhost:5173/profile.png';
    };

    const closePage = () => {
        navigate('/home');
    }

    const { data: reelsData, refetch: refetchReels } = useQuery(GET_PUBLIC_REELS);
    const { data: reelsVideoData } = useQuery(GET_REEL_VIDEOS);

    const getReelVideo = (reelID) => {
        const reelVideo = reelsVideoData?.getReelVideos.find((v) => v.reel.id === reelID);
        console.log(reelID);
        console.log(reelVideo);
        return reelVideo ? reelVideo.videoLink : '';
    };

    const [selectedReels, setSelectedReels] = useState<Array<{ id: string, user: { id: string, name: string }, privacy: string, createdAt: String, likes: number, comments: number }>>([]);
    const [currentReelIndex, setCurrentReelIndex] = useState(0);

    const handlePrevVideo = () => {
        setCurrentReelIndex((prevIndex) => (prevIndex - 1 + selectedReels.length) % selectedReels.length);
    };

    const handleNextVideo = () => {
        setCurrentReelIndex((prevIndex) => (prevIndex + 1) % selectedReels.length);
    };

    const redirectToCreate = () => {
        navigate('/createreel')
    };

    const [likedReels, setLikedReels] = useState({});
    const [createReelLike] = useMutation(CREATE_REEL_LIKE);
    const [deleteReelLike] = useMutation(DELETE_REEL_LIKE);
    
    const toggleLike = async(reelID) => {
        const isReelLiked = likedReels[reelID] || false;

        try {
            if(isReelLiked) {
                await deleteReelLike({ variables: { reelID, userID: data.getUserByToken.id } });
            } 
            else {
                await createReelLike({ variables: { reelID, userID: data.getUserByToken.id } });
            }
            setLikedReels((prevLiked) => ({
                ...prevLiked,
                [reelID]: !isReelLiked
            }));
            refetchReels();
        } catch (error) {
            console.error('Error handling like:', error);
        }
    };

    const isEmptyObject = (obj) => {
        return JSON.stringify(obj) === '{}';
    };

    const { data: likedReelsData } = useQuery(GET_LIKED_REELS, {variables: {token}});

    useEffect(() => {
        if(likedReelsData) {
            if(isEmptyObject(likedReels)) {
                const likedReelsMap = {};
                likedReelsData.getLikedReels.forEach((likedReel) => {
                    likedReelsMap[likedReel.reel.id] = true;
                });
                setLikedReels(likedReelsMap);
            } 
            reelsData?.getPublicReels.map((reel) => {
                return {
                    ...reel,
                    isLiked: !!likedReels[reel.id],
                };
            });
        }
    }, [reelsData, likedReelsData]);

    useEffect(() => {
        if(reelsData) {
            setSelectedReels(reelsData.getPublicReels);
            setCurrentReelIndex(0);
        }
    }, [reelsData]);

    const [isCommentModalOpen, setCommentModalOpen] = useState(false);

    const openCommentModal = (reelID) => {
        setSelectedReels(reelsData?.getPublicReels.find(reel => reel.id === reelID));
        setCommentModalOpen(true);
    }

    const closeCommentModal = () => {
        setCommentModalOpen(false);
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

    return (
        <div className='reel-page'>
            <div className='reel-container'>
                <div className='left-header'>
                    <img className="reel-logo" src="./facebook.png" onClick={closePage}></img>
                </div>
                <div className='reel-content'>
                    <div className='reel-content-frame'>
                        {selectedReels.length > 0 && currentReelIndex !== null && (
                            <>
                                <div className='left-reel-btngroup'>
                                    {selectedReels.length > 1 && (
                                        <>
                                            <button className='left-reel-btn' onClick={handlePrevVideo}>&#10094;</button>
                                        </>
                                    )}
                                </div>
                                <div className='reel-content-user'>
                                    <div className='reel-user-pic'>
                                        <Image cloudName="dogiichep" publicId={getProfileImage(selectedReels[currentReelIndex].user.id)} className="reel-user-pic" />
                                    </div>
                                    <div className='reel-user-name'>{selectedReels[currentReelIndex].user.name}</div>
                                </div>
                                <div className='reel-content-video-frame'>
                                    <Video
                                        cloudName='dogiichep'
                                        publicId={getReelVideo(selectedReels[currentReelIndex].id)}
                                        autoPlay
                                        loop
                                        className="reel-content-video"
                                    />
                                </div>
                                <div className='right-reel-btngroup'>
                                    {selectedReels.length > 1 && (
                                        <>
                                            <button className='right-reel-btn' onClick={handleNextVideo}>&#10095;</button>
                                        </>
                                    )}
                                    <div className='reel-like-btn' onClick={() => toggleLike(selectedReels[currentReelIndex].id)}>
                                        {likedReels[selectedReels[currentReelIndex].id] ? (
                                            <AiFillLike size={20} color="skyblue" />
                                        ) : (
                                            <AiFillLike size={20} color="white" />
                                        )}
                                    </div>
                                    <div className='reel-like-count'>{selectedReels[currentReelIndex].likes}</div>
                                    <div className='reel-comment-btn' onClick={() => openCommentModal(selectedReels[currentReelIndex].id)}><BiSolidComment color='white'/></div>
                                    <div className='reel-comment-count'>{selectedReels[currentReelIndex].comments}</div>
                                    <div className='reel-share-btn'><BiSolidShare color='white'/></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className='right-header'>
                    <div className="reel-menus">
                        <div id="messengericon"><FaFacebookMessenger size={25}/></div>
                        <div id="notificationicon"><IoIosNotifications size={25}/></div>
                        <div id="profileicon" onClick={toggleDropdown}>
                            <Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} id="profilepic"/>
                            {renderDropdown()}
                        </div>
                    </div>
                    <div className='create-reel-redirect' onClick={redirectToCreate}>
                        <FaPenSquare size={35} color='white'/>
                    </div>
                </div>
            </div>
            {/* <div> */}
                {isCommentModalOpen && selectedReels && (
                   <ReelComponent
                        selectedReel={selectedReels}
                        likedReels={likedReels}
                        toggleLike={toggleLike}
                        calculateTimeAgo={calculateTimeAgo}
                        closeCommentModal={closeCommentModal}
                        data={data}
                        refetchReel={refetchReels}
                    />
                )}
            {/* </div> */}
        </div>
    );
}

export default Reels;