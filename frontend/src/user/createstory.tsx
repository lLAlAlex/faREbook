import React, { useEffect, useRef, useState } from 'react';
import Header from "../components/header";
import '../style/style.css'
import { FaFacebookMessenger } from 'react-icons/fa';
import { gql, useMutation, useQuery } from '@apollo/client';
import { BiLogOut } from 'react-icons/bi';
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

const CREATE_STORY = gql`
    mutation CreateStory($inputStory: NewStory!) {
        createStory(inputStory: $inputStory) {
            id
            user {
                id
            }
            privacy
            createdAt
        }
    }
`

const CREATE_STORY_MEDIA = gql`
    mutation CreateStoryMedia($storyID: String!, $mediaLink: String!) {
        createStoryMedia(storyID: $storyID, mediaLink: $mediaLink) {
            id
            story {
                id
            }
            mediaLink
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

const CreateStory = () => {
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

    // Create Story
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleDiscard = () => {
        setSelectedImage(null);
        setIsCreatingText(false);
    }

    const [isCreatingText, setIsCreatingText] = useState(false);

    const createTextStory = () => {
        setIsCreatingText(true);
    }

    const [textStory, setTextStory] = useState("");
    const [textStyle, setTextStyle] = useState("Simple");

    const getTextStyle = () => {
        switch (textStyle) {
            case "Simple":
                return { fontFamily: "Facebook Sans App" };
            case "Clean":
                return { fontFamily: "Facebook Narrow App" };
            case "Casual":
                return { fontFamily: "Facebook Script App Light" };
            case "Fancy":
                return { fontFamily: "Facebook Stencil" };
            case "Headline":
                return { fontFamily: "Facebook Sans App Heavy Italic" };
            default:
                return {};
        }
    };
    const [backgroundStyle, setBackgroundStyle] = useState("rgb(255, 68, 68)");

    const [createStory, { data: storyData }] = useMutation(CREATE_STORY);
    const [createStoryMedia, { data: storyMediaData }] = useMutation(CREATE_STORY_MEDIA);

    const inputStory = {
        userID: data?.getUserByToken.id,
        privacy: "Public",
        createdAt: new Date(),
    };

    const handleCreateImageStory = async(e) => {
        e.preventDefault();

        const { data: res } = await createStory({
            variables: {
                inputStory: inputStory,
            },
        });
        const storyID = res.createStory.id;

        const element = document.querySelector('.create-image-crop') as HTMLElement;
        const canvas = await html2canvas(element);
        const dataURL = canvas.toDataURL('image/png');

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/dogiichep/image/upload`,
            {
                file: dataURL,
                upload_preset: 'sd30tg2s',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        createStoryMedia({
            variables: {
                storyID: storyID,
                mediaLink: response.data.secure_url
            }
        });
        setSelectedImage(null);
        setIsCreatingText(false);
    }

    const handleCreateTextStory = async(e) => {
        e.preventDefault();

        const { data: res } = await createStory({
            variables: {
                inputStory: inputStory,
            },
        });
        const storyID = res.createStory.id;

        const element = document.querySelector('.create-text-crop') as HTMLElement;
        const canvas = await html2canvas(element);
        const dataURL = canvas.toDataURL('image/png');

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/dogiichep/image/upload`,
            {
                file: dataURL,
                upload_preset: 'sd30tg2s',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        createStoryMedia({
            variables: {
                storyID: storyID,
                mediaLink: response.data.secure_url
            }
        });
        setSelectedImage(null);
        setIsCreatingText(false);
    }

    const { data: profileData } = useQuery(GET_ALL_PROFILE);

    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : 'http://localhost:5173/profile.png';
    };
    
    return (
        <div className='story-container'>
            <div className='story-sidebar'>
                <div className='story-row'>
                    <div className='story-exit' onClick={closePage}><IoMdClose color='#ffffff' size={'3vh'}/></div>
                    <img id="logo" onClick={closePage} src="./facebook.png"></img>
                </div>
                <div className="divider"></div>
                <div className='story-setting-row'>
                    <h2 className='story-header'>Your Story</h2>
                    <div className='story-setting'><IoMdSettings size={'3vh'}/></div>
                </div>
                <div className='story-row'>
                    <Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} className="story-profile-pic"/>
                    <div className="story-profile-name">{data?.getUserByToken.name}</div>
                </div>
                <div className="divider"></div>
                {selectedImage && (
                    <div className='create-story-action'>
                        <div className='btn-group'>
                            <button className='discard-btn' onClick={handleDiscard}>Discard</button>
                            <button className='share-btn' onClick={handleCreateImageStory}>Share to story</button>
                        </div>
                    </div>
                )}
                {isCreatingText && (
                    <div className='create-story-action'>
                        <textarea className='create-story-input' placeholder="Start typing" onChange={(e) => setTextStory(e.target.value)}></textarea>
                        <select value={textStyle} onChange={(e) => setTextStyle(e.target.value)} className='create-story-dropdown'>
                            <option value="Simple">Simple</option>
                            <option value="Clean">Clean</option>
                            <option value="Casual">Casual</option>
                            <option value="Fancy">Fancy</option>
                            <option value="Headline">Headline</option>
                        </select>
                        <div className='create-story-background'>
                            <div className='story-background-header'>Backgrounds</div>
                            <div className='story-background-colours'>
                                <div className='color1' onClick={() => setBackgroundStyle('rgb(255, 68, 68)')}></div>
                                <div className='color2' onClick={() => setBackgroundStyle('rgb(0, 234, 0)')}></div>
                                <div className='color3' onClick={() => setBackgroundStyle('rgb(82, 183, 255)')}></div>
                                <div className='color4' onClick={() => setBackgroundStyle('rgb(73, 73, 255)')}></div>
                            </div>
                        </div>
                        <div className='btn-group'>
                            <button className='discard-btn' onClick={handleDiscard}>Discard</button>
                            <button className='share-btn' onClick={handleCreateTextStory}>Share to story</button>
                        </div>
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
                {selectedImage ? (
                    <div className='create-container'>
                        <div className='create-story-header'>Preview</div>
                        <div className='create-frame'>
                            <div className='create-image-crop'>
                                <img src={URL.createObjectURL(selectedImage)} alt="Selected" className='story-selected-image' />
                            </div>
                        </div>
                    </div>
                ) : isCreatingText ? (
                    <div className='create-container'>
                        <div className='create-story-header'>Preview</div>
                        <div className='create-frame'>
                            <div className='create-text-crop' style={{ backgroundColor: backgroundStyle }}>
                                <div className='preview-input' style={getTextStyle()}>{textStory ? textStory : "Start typing"}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div id="create-story-container">
                        <div
                            className="create-photo-story"
                            onClick={(e) => {
                                const inputElement = document.createElement('input');
                                inputElement.type = 'file';
                                inputElement.accept = 'image/*';
                                inputElement.multiple = false;
                                inputElement.addEventListener('change', (event) => {
                                    const fileInput = event.target as HTMLInputElement;
                                    const file = fileInput.files && fileInput.files[0];
                                    if (file) {
                                        setSelectedImage(file);
                                    }
                                });
                                inputElement.click();
                            }}
                        >
                            <div className="create-story-frame"><IoMdPhotos size={'3vh'} /></div>
                            <div className="create-story-text">Create a photo story</div>
                        </div>
                        <div className='create-text-story' onClick={createTextStory}>
                            <div className='create-story-frame'><PiTextAaDuotone size={'3vh'} /></div>
                            <div className='create-story-text'>Create a text story</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreateStory;