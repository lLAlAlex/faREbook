import React, { useEffect, useRef, useState } from 'react';
import Header from "../components/header";
import '../style/style.css'
import { FaFacebookMessenger } from 'react-icons/fa';
import { gql, useMutation, useQuery } from '@apollo/client';
import { BiLogOut, BiSolidVideoPlus } from 'react-icons/bi';
import { IoIosNotifications, IoMdClose, IoMdSettings, IoMdPhotos } from 'react-icons/io';
import { PiTextAaDuotone } from 'react-icons/pi';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

const CREATE_REEL = gql`
    mutation CreateReel($newReel: NewReel!) {
        createReel(newReel: $newReel) {
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

const CREATE_REEL_VIDEO = gql`
    mutation CreateReelVideo($reelID: String!, $videoLink: String!) {
        createReelVideo(reelID: $reelID, videoLink: $videoLink) {
            id
            reel {
                id
            }
            videoLink
        }
    }
`

const CreateReel = () => {
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
        if(dropdownVisible) {
            console.log("masuk");
            return (
                <div className="dropdown-content">
                    <div id="dropdownprofile">
                        <div id="dropdownprofileicon"><Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} id="profilepic"/></div>
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
    
    const closePage = () => {
        navigate('/home');
    }

    const { data: profileData } = useQuery(GET_ALL_PROFILE);

    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : 'http://localhost:5173/profile.png';
    };

    // Create Reel
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

    const handleVideoSelect = (event) => {
        const selectedFile = event.target.files[0];
        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(selectedFile);
        videoElement.onloadedmetadata = () => {
            const videoDuration = videoElement.duration;
            if(videoDuration >= 1 && videoDuration <= 60) {
                setSelectedVideo(selectedFile);
            } 
            else {
                alert('Please select a video with a duration between 1 and 60 seconds.');
            }
            videoElement.remove();
        };
    };
    const [createPhase, setCreatePhase] = useState(0);

    const changeIndex = (action) => {
        if(action === 'next') {
            setCreatePhase(createPhase+1);
        }
        else if(action === 'prev') {
            setCreatePhase(createPhase-1);
        }
    }

    const [reelText, setReelText] = useState('');

    const [createReel] = useMutation(CREATE_REEL);
    const [createReelVideo] = useMutation(CREATE_REEL_VIDEO);

    const newReel = {
        userID: data?.getUserByToken.id,
        title: reelText,
        privacy: "public",
        createdAt: new Date(),
        likes: 0,
        comments: 0
    };

    const handleCreateReel = async(e) => {
        e.preventDefault();

        if(!selectedVideo) {
            console.error('No video selected for upload.');
            return;
        }

        const { data: res } = await createReel({
            variables: {
                newReel: newReel,
            },
        });
        const reelID = res.createReel.id;

        try {
            const formData = new FormData();
            formData.append('file', selectedVideo);
            formData.append('upload_preset', 'sd30tg2s');
    
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/dogiichep/video/upload`,
                formData
            );
    
            const videoLink = response.data.secure_url;
    
            await createReelVideo({
                variables: {
                    reelID: reelID,
                    videoLink: videoLink,
                },
            });
    
            setSelectedVideo(null);
            setReelText('');
    
            console.log('Reel video uploaded and created successfully:', videoLink);
        } catch (error) {
            console.error('Error uploading and creating reel video:', error);
        }
    }
    
    return (
        <div className='story-container'>
            <div className='reel-sidebar'>
                <div className='story-row'>
                    <div className='story-exit' onClick={closePage}><IoMdClose color='#ffffff' size={'3vh'}/></div>
                    <img id="logo" onClick={closePage} src="./facebook.png"></img>
                </div>
                <div className="divider"></div>
                {createPhase === 0 ? (
                    <div className='reel-setting-row'>
                        <div className='create-reel-desc'>Create a reel</div>
                        <h2 className='create-reel-title'>Upload video</h2>
                    </div>
                ) : (
                    <div className='reel-setting-row'>
                        <div className='create-reel-desc'>Create a reel</div>
                        <h2 className='create-reel-title'>Add details</h2>
                    </div>
                )}
                {selectedVideo && createPhase === 0 ? (
                    <div className='create-reel-insert'
                        onClick={(e) => {
                            const inputElement = document.createElement('input');
                            inputElement.type = 'file';
                            inputElement.accept = 'video/*';
                            inputElement.multiple = false;
                            inputElement.addEventListener('change', handleVideoSelect);
                            inputElement.click();
                        }}>
                        <div className='create-reel-icon'><BiSolidVideoPlus size={'4vh'}/></div>
                        <div className='create-reel-text'>Uploading video</div>
                        <div className='create-reel-minitext'>Or drag and drop</div>
                    </div>
                ) : createPhase === 0 ? (
                    <div className='create-reel-insert'
                        onClick={(e) => {
                            const inputElement = document.createElement('input');
                            inputElement.type = 'file';
                            inputElement.accept = 'video/*';
                            inputElement.multiple = false;
                            inputElement.addEventListener('change', handleVideoSelect);
                            inputElement.click();
                        }}>
                        <div className='create-reel-icon'><BiSolidVideoPlus size={'4vh'}/></div>
                        <div className='create-reel-text'>Add video</div>
                        <div className='create-reel-minitext'>Or drag and drop</div>
                    </div>
                ) : (
                    <textarea onChange={(e) => setReelText(e.target.value)} placeholder='Describe your reel...' className='create-reel-insert-text'></textarea>
                )}
                {selectedVideo && createPhase === 0 ? (
                    <button className='next-btn' onClick={() => changeIndex("next")}>Next</button>
                ) : createPhase === 0 ? (
                    <button className='disabled-next-btn' disabled>Next</button>
                ) : reelText === "" ? (
                    <div className='create-reel-btngroup'>
                        <button className='prev-btn' onClick={() => changeIndex("prev")}>Previous</button>
                        <button className='disabled-publish-btn' disabled>Publish</button>
                    </div>
                ) : (
                    <div className='create-reel-btngroup'>
                        <button className='prev-btn' onClick={() => changeIndex("prev")}>Previous</button>
                        <button className='publish-btn' onClick={handleCreateReel}>Publish</button>
                    </div>
                )}
            </div>
            <div style={{
                backgroundColor: '#ededed',
                padding: '1vh',
                display: 'flex',
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%'
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
            <div id="story-content">
                <div className='create-reel-container'>
                    <div className='create-reel-header'>Preview</div>
                    {selectedVideo ? (
                        <div className='create-reel-frame-dark'>
                            <div className='create-reel-crop'>
                                <video key={URL.createObjectURL(selectedVideo)} controls className='create-video-preview' muted autoPlay>
                                    <source src={URL.createObjectURL(selectedVideo)} type={selectedVideo.type} />
                                </video>
                            </div>
                        </div>
                    ) : (
                        <div className='create-reel-frame-light'>
                            <div className='create-reel-placeholder'>
                                <div className='create-reel-placeholder-header'>Your Video Preview</div>
                                <div className='create-reel-placeholder-content'>Upload your video in order to see a preview here.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateReel;