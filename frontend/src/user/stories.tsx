import React, { useEffect, useRef, useState } from 'react';
import Header from "../components/header";
import '../style/style.css'
import { FaFacebookMessenger } from 'react-icons/fa';
import { IoIosNotifications, IoMdClose, IoMdSettings } from 'react-icons/io';
import { gql, useQuery } from '@apollo/client';
import { BiLogOut } from 'react-icons/bi';
import { Image } from 'cloudinary-react';
import { useNavigate } from 'react-router-dom';

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

const GET_USER_STORIES = gql`
    query GetUserStories($userID:String!) {
        getUserStories(userID:$userID) {
            id
            user {
                id
                name
            }
            privacy
            createdAt
        }
    }
`

const GET_STORIES_MEDIA = gql`
    query getAllStoriesMedia {
        getAllStoriesMedia {
            id
            mediaLink
            story {
                id
            }
        }
    }
`

const Stories = () => {
    // Header
    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    const navigate = useNavigate();

    useEffect(() => {
        if(!token) {
            navigate('/login');
        }
    }, [])
    
    const [dropdownVisible, setDropdownVisible] = React.useState(false);

    const logout = () => {
        localStorage.clear();
    }
    const renderDropdown = () => {
        if (dropdownVisible) {
            console.log("masuk");
            return (
                <div className="dropdown-content">
                    <div id="dropdownprofile">
                        <div id="dropdownprofileicon"><img style={{width:"7vh"}} src="http://localhost:5173/profile.png"></img></div>
                        <div id="dropdownprofilename">{data?.getUserByToken.name}</div>
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

    const { data } = useQuery(FIND_USER, {
        variables: { token: token },
    });

    // Stories
    const closePage = () => {
        navigate('/home');
    }
    const createStory = () => {
        navigate('/createstory');
    }

    const { data: profileData } = useQuery(GET_ALL_PROFILE);
    const { data: storiesData } = useQuery(GET_USER_STORIES, {variables: {
        userID: data?.getUserByToken.id
    }});
    const { data: storyMediaData } = useQuery(GET_STORIES_MEDIA);

    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : 'http://localhost:5173/profile.png';
    };

    const getStoryMedia = (storyID) => {
        const storyMedia = storyMediaData?.getAllStoriesMedia.find((m) => m.story.id === storyID);
        return storyMedia ? storyMedia.mediaLink : 'http://localhost:5173/profile.png';
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

    const encounteredUserIDs = new Set();

    const [selectedStories, setSelectedStories] = useState<Array<{ id: string, user: { id: string, name: string }, privacy: string, createdAt: String }>>([]);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number>(0);

    const handleStoryClick = (userID) => {
        const matchingStories = storiesData?.getUserStories.filter(s => s.user.id === userID);

        if (matchingStories && matchingStories.length > 0) {
            setSelectedStoryIndex(0);
            setSelectedStories(matchingStories);
        }
        setProgress(0);
    };

    const handleNextStory = () => {
        setSelectedStoryIndex(prevIndex => (prevIndex + 1) % selectedStories.length);
        setProgress(0);
    };
      
    const handlePreviousStory = () => {
        setSelectedStoryIndex(prevIndex => (prevIndex - 1 + selectedStories.length) % selectedStories.length);
        setProgress(0);
    };

    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let intervalId;
    
        if(selectedStories.length > 1) {
            intervalId = setInterval(() => {
                const newProgress = progress + 1000;
                if(newProgress >= 5000) {
                    handleNextStory();
                    setProgress(0);
                } 
                else {
                    setProgress(newProgress);
                }
            }, 1000);
        }
        return() => {
            clearInterval(intervalId);
        };
    }, [progress, selectedStories, selectedStoryIndex]);
    
    return (
        <div className='story-container'>
            <div className='story-sidebar'>
                <div className='story-row'>
                    <div className='story-exit' onClick={closePage}><IoMdClose color='#ffffff' size={'3vh'}/></div>
                    <img id="logo" onClick={closePage} src="./facebook.png"></img>
                </div>
                <div className="divider"></div>
                <div className='story-setting-row'>
                    <h2 className='story-title-header'>Stories</h2>
                    <div className='story-setting'><IoMdSettings size={'3vh'}/></div>
                </div>
                <div className='story-setting-row'>
                    <h4 className='story-header'>Your Story</h4>
                </div>
                <div className='story-header-row'>
                    <div className='add-story' onClick={createStory}>+</div>
                    <div className='story-menu'>
                        <div className="story-create-header">Create a story</div>
                        <div className='story-create-desc'>Share a photo while scrolling</div>
                    </div>
                </div>
                <div className='story-setting-row'>
                    <h4 className='story-header'>All stories</h4>
                </div>
                {storiesData?.getUserStories.map((story) => {
                    if(!encounteredUserIDs.has(story.user.id)) {
                        encounteredUserIDs.add(story.user.id);
                        return (
                            <div className='story-view-row' key={story.id} onClick={() => handleStoryClick(story.user.id)}>
                                <Image className='story-user-profile' cloudName="dogiichep" publicId={getProfileImage(story.user.id)} onClick={createStory}></Image>
                                <div className='story-menu'>
                                    <div className="story-create-header">{story.user.name}</div>
                                    <div className='story-create-desc'>{encounteredUserIDs.size+1} new - {calculateTimeAgo(story.createdAt)}</div>
                                </div>
                            </div>
                        );
                    } 
                    else {
                        return null;
                    }
                })}
            </div>
            <div style={{
                backgroundColor: 'black',
                padding: '1vh',
                display: 'flex',
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                zIndex: '1000'
            }}>
                <div id="menus">
                    <div id="messengericon"><FaFacebookMessenger size={25}/></div>
                    <div id="notificationicon"><IoIosNotifications size={25}/></div>
                    <div id="profileicon" onClick={toggleDropdown}>
                        <Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} id="profilepic"/>
                        {renderDropdown()}
                    </div>
                </div>
            </div>
            {selectedStories.length > 0 && selectedStoryIndex !== null && (
                <div className="story-content">
                    <div className='story-frame'>
                        {selectedStories.length > 1 ? (
                            <div className='story-button-frame'>
                                <div className='story-left-btn-frame'>
                                    <div className='story-left-btn' onClick={handlePreviousStory}>&lt;</div>
                                </div>
                                <div className='story-data-frame'>
                                    <div className='progress-bar-container'>
                                        <div className='progress-bar' style={{ width: `${(progress / 4000) * 100}%` }}></div>
                                    </div>
                                    <div className='story-profile-frame'>
                                        <Image cloudName="dogiichep" className="story-owner-profile" publicId={getProfileImage(selectedStories[selectedStoryIndex].user.id)}/>
                                        <div className='story-owner-name'>{selectedStories[selectedStoryIndex].user.name}</div>
                                    </div>
                                    <Image cloudName="dogiichep" publicId={getStoryMedia(selectedStories[selectedStoryIndex].id)} id="story-image"/>
                                </div>
                                <div className='story-right-btn-frame'>
                                    <div className='story-right-btn' onClick={handleNextStory}>&gt;</div>
                                </div>
                            </div>
                        ) : (
                            <div className='story-button-frame'>
                                <div className='story-data-frame'>
                                    <div className='progress-bar-container'>
                                        <div className='progress-bar' style={{ width: `${(progress / 4000) * 100}%` }}></div>
                                    </div>
                                    <div className='story-profile-frame'>
                                        <Image cloudName="dogiichep" className="story-owner-profile" publicId={getProfileImage(selectedStories[selectedStoryIndex].user.id)}/>
                                        <div className='story-owner-name'>{selectedStories[selectedStoryIndex].user.name}</div>
                                    </div>
                                    <Image cloudName="dogiichep" publicId={getStoryMedia(selectedStories[selectedStoryIndex].id)} id="story-image"/>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Stories;