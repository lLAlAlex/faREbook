import React, { useEffect, useRef, useState } from 'react';
import Header from "../components/header";
import { BsPencilSquare } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Image, Video } from 'cloudinary-react';
import { MdKeyboardVoice } from 'react-icons/md';
import { AiFillFileAdd } from 'react-icons/ai';
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

const GET_ALL_USERS = gql`
    query GetAllUser {
        getAllUser {
            id
            name
            email
            dob
            gender
            status
        }
    }
`

const CREATE_CONVERSATION = gql`
    mutation CreateConversation($newConversation: NewConversation!) {
        createConversation(newConversation: $newConversation) {
            id
            user {
                id
                name
            }
            user2 {
                id
                name
            }
            createdAt
        }
    }
`

const GET_USER_CONVERSATION = gql`
    query GetUserConversation($userID: String!) {
        getUserConversation(userID: $userID) {
            id
            user {
                id
                name
            }
            user2 {
                id
                name
            }
            createdAt
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

const CREATE_MESSAGE = gql`
    mutation CreateMessage($newMessage: NewMessage!) {
        createMessage(newMessage: $newMessage) {
            id
            conversation {
                id
            }
            user {
                id
                name
            }
            content
            createdAt
            hasMedia
        }
    }
`

const GET_CONVERSATION_MESSAGE = gql`
    query GetConversationMessage($conversationID: String!) {
        getConversationMessage(conversationID: $conversationID) {
            id
            conversation {
                id
            }
            user {
                id
                name
            }
            content
            createdAt
            hasMedia
        }
    }
`

const GET_MESSAGE_MEDIAS = gql`
    query GetMessageMedias {
        getMessageMedias {
            id
            message {
                id
            }
            mediaLink
        }
    }
`

const CREATE_MESSAGE_MEDIA = gql`
    mutation CreateMessageMedia($messageID: String!, $mediaLink: String!) {
        createMessageMedia(messageID: $messageID, mediaLink: $mediaLink) {
            id
            message {
                id
            }
            mediaLink
        }
    }
`

const Messenger = () => {
    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    const navigate = useNavigate();

    useEffect(() => {
        if(!token) {
            navigate('/login');
        }
    }, [])

    const { data: currUserData } = useQuery(FIND_USER, {
        variables: { token: token }
    });

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

    const { data: userData } = useQuery(GET_ALL_USERS);

    const [createDialog, setCreateDialog] = useState(false);
    const toggleCreateDialog = () => {
        setCreateDialog(prevValue => !prevValue);
    }

    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const filteredUsers = userData?.getAllUser.filter(
        (user) => user.id !== currUserData?.getUserByToken.id
    );

    // console.log(filteredUsers);
    const { data: conversationData, refetch: refetchConversations } = useQuery(GET_USER_CONVERSATION, {variables: {userID: currUserData?.getUserByToken.id}});
    const [createConversation] = useMutation(CREATE_CONVERSATION);

    const handleCreateConversation = async() => {
        await createConversation(
            {variables: {newConversation: {userID: currUserData?.getUserByToken.id, user2ID: selectedUser}
        }})
        // handleCreateNotification(currUserData?.getUserByToken.id, selectedUser, "You have made a new conversation with "+selectedUser);
        // handleCreateNotification(selectedUser, currUserData?.getUserByToken.id, "You have made a new conversation with "+selectedUser);
        refetchConversations();
    }

    const { data: profileData } = useQuery(GET_ALL_PROFILE);
    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : 'http://localhost:5173/profile.png';
    };

    const [selectedConversation, setSelectedConversation] = useState<{ id: string, user: {id: string, name: string}, user2: {id: string, name: string}, createdAt: string } | null>(null);
    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
    }

    const [createMessage] = useMutation(CREATE_MESSAGE);
    const [createMessageMedia] = useMutation(CREATE_MESSAGE_MEDIA);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleCreateMessage = async() => {
        if(!inputRef.current) return;
        const content = inputRef.current.value.trim();
        if(content === '') return;

        await createMessage({
            variables: {
                newMessage: {
                    conversationID: selectedConversation?.id,
                    userID: currUserData?.getUserByToken.id,
                    content: content,
                    hasMedia: false,
                },
            },
        });
        inputRef.current.value = '';
        refetchMessages();
    }

    const [selectedMedia, setSelectedMedia] = useState<File | null>(null);

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        setSelectedMedia(file);
        console.log(file);
    };

    const handleCreateMessageMedia = async() => {
        if(!inputRef.current) return;
        const content = inputRef.current === null ? '' : inputRef.current.value.trim();

        const { data: msgData } = await createMessage({
            variables: {
                newMessage: {
                    conversationID: selectedConversation?.id,
                    userID: currUserData?.getUserByToken.id,
                    content: content,
                    hasMedia: true,
                },
            },
        });
        inputRef.current.value = '';

        let uploadEndpoint = 'https://api.cloudinary.com/v1_1/dogiichep/image/upload';
        if(selectedMedia?.type.startsWith('video')) {
            uploadEndpoint = 'https://api.cloudinary.com/v1_1/dogiichep/video/upload';
        }
        else if(selectedMedia?.type.startsWith('application')) {
            uploadEndpoint = 'https://api.cloudinary.com/v1_1/dogiichep/raw/upload';
        }

        if(selectedMedia) {
            const formData = new FormData();
            formData.append('file', selectedMedia);
            formData.append('upload_preset', 'sd30tg2s');
    
            const response = await axios.post(uploadEndpoint, formData);

            console.log(msgData.createMessage.id);
            console.log(response.data.secure_url);
    
            await createMessageMedia({
                variables: {
                    messageID: msgData.createMessage.id,
                    mediaLink: response.data.secure_url,
                },
            });
        }
        setSelectedMedia(null);
        refetchMessages();
    }
    
    const handleKeyDown = (e) => {
        if(e.key === 'Enter' && !selectedMedia) {
            handleCreateMessage();
        }
        else if(e.key === 'Enter' && selectedMedia) {
            handleCreateMessageMedia();
        }
    };

    const { data: messageData, refetch: refetchMessages } = useQuery(GET_CONVERSATION_MESSAGE, {variables: {conversationID: selectedConversation?.id}});
    const { data: messageMediaData } = useQuery(GET_MESSAGE_MEDIAS);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);

    const handleSearch = (query) => {
        if(query.trim() === "") {
            setSearchResults(null);
        } 
        else {
            const filteredConversations = conversationData?.getUserConversation.filter(
                conversation => conversation.user2.name.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filteredConversations);
        }
    };

    useEffect(() => {
        handleSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080/websocket');

        ws.onopen = () => {
            console.log('WebSocket connection opened');
        };

        ws.onmessage = async(event) => {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            if(ws) {
                ws.close();
            }
        };
    }, []);

    // console.log(searchResults);

    const getMessageMedia = (messageID) => {
        const messageMedia = messageMediaData?.getMessageMedias.find((m) => m.message.id === messageID);
        // console.log(messageMedia);
        return messageMedia ? messageMedia.mediaLink : '';
    };
    
    return (
        <>
            <Header/>
            <div className='messenger-page'>
                <div className='messenger-page-content'>
                    <div className='messenger-left-sidebar'>
                        <div className='messenger-row'>
                            <div className='messenger-header'>Chats</div>
                            <div className='create-message-icon' onClick={toggleCreateDialog}><BsPencilSquare size={"4vh"}/></div>
                        </div>
                        <div className='messenger-row'>
                            <input className='messenger-search-bar' placeholder='Search Messenger' value={searchQuery} onChange={e => setSearchQuery(e.target.value)}></input>
                        </div>
                        {(searchResults || conversationData?.getUserConversation)?.map(conversation => (
                            <div className='messenger-conversation-row' onClick={() => handleSelectConversation(conversation)}>
                                <Image className='conversation-friend' cloudName="dogiichep" publicId={getProfileImage(conversation.user2.id === currUserData?.getUserByToken.id ? conversation?.user.id : conversation?.user2.id)}/>
                                <div className='conversation-friend-name'>{conversation.user2.name === currUserData?.getUserByToken.name ? conversation?.user.name : conversation?.user2.name}</div>
                            </div>
                        ))}
                    </div>
                    {createDialog && (
                        <div className='create-conversation-container'>
                            <div className='create-conversation-dialog'>
                                <div className='close-create-conversation' onClick={toggleCreateDialog}>X</div>
                                <div className='create-conversation-header'>Create Conversation</div>
                                <select
                                    className="create-conversation-user-dropdown"
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                >
                                    <option value="">Select a user</option>
                                    {filteredUsers?.map((user) => (
                                        <option key={user.id} value={user.id} label={user.name}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                                <button className='create-conversation-btn' onClick={handleCreateConversation}>Create</button>
                            </div>
                        </div>
                    )}
                    {selectedConversation &&
                        <div className='conversation-container'>
                            <div className='conversation-header'>
                                <Image className='conversation-friend' cloudName="dogiichep" publicId={getProfileImage(selectedConversation?.user2.id === currUserData?.getUserByToken.id ? selectedConversation?.user.id : selectedConversation?.user2.id)}/>
                                <div className='conversation-friend-name'>{selectedConversation?.user2.name === currUserData?.getUserByToken.name ? selectedConversation?.user.name : selectedConversation?.user2.name}</div>
                            </div>
                            <div className='conversation-log'>
                                {messageData?.getConversationMessage.map((msg) => (
                                    <>
                                        <div className={msg.user.id === currUserData?.getUserByToken.id ? 'user-message-media' : 'user2-message-media'}>
                                            {msg.hasMedia && (getMessageMedia(msg.id).endsWith('.mp4') || getMessageMedia(msg.id).endsWith('.mkv')) ? (
                                                <Video className='message-media' cloudName="dogiichep" publicId={getMessageMedia(msg.id)} controls />
                                            ) : (
                                                <Image className='message-media' cloudName="dogiichep" publicId={getMessageMedia(msg.id)} />
                                            )}
                                        </div>
                                        <div className={msg.user.id === currUserData?.getUserByToken.id ? 'user-message' : 'user2-group'}>
                                            {msg.user.id !== currUserData?.getUserByToken.id && (
                                                <Image className='user2-icon' cloudName="dogiichep" publicId={getProfileImage(selectedConversation?.user2.id === currUserData?.getUserByToken.id ? selectedConversation?.user.id : selectedConversation?.user2.id)} />
                                            )}
                                            <div className={msg.user.id === currUserData?.getUserByToken.id ? 'user-message' : 'user2-message'}>{msg.content}</div>
                                        </div>
                                    </>
                                ))}
                            </div>
                            <div className='conversation-input-group'>
                                <div className='mic-icon'><MdKeyboardVoice size={'4vh'}/></div>
                                <div className='file-icon' onClick={(e) => {
                                    const inputElement = document.createElement('input');
                                    inputElement.type = 'file';
                                    inputElement.accept = 'image/*, video/*';
                                    inputElement.addEventListener('change', handleFileInputChange);
                                    inputElement.click();
                                }}>
                                    <AiFillFileAdd size={'4vh'}/></div>
                                <input className='conversation-input' placeholder='Type a message...' ref={inputRef} onKeyDown={handleKeyDown}></input>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </>
    );
}

export default Messenger;