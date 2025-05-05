import React, { useEffect, useRef, useState } from 'react';
import Header from "../components/header";
import { IoMdSettings } from 'react-icons/io';
import { MdFeed, MdGroups } from 'react-icons/md';
import { AiFillCompass } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';
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

const CREATE_GROUP = gql`
    mutation CreateGroup($inputGroup: NewGroup!) {
        createGroup(inputGroup: $inputGroup) {
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

const CREATE_GROUP_PROFILE = gql`
    mutation CreateGroupProfile($groupID: String!, $imageLink: String!) {
        createGroupProfile(groupID: $groupID, imageLink: $imageLink) {
            id
            group {
                id
                name
            }
            imageLink
        }
    }
`

const CREATE_MEMBER = gql`
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

const CreateGroup = () => {
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
        variables: { token: token },
    });
    const { data: profileData, refetch: refetchProfile } = useQuery(GET_ALL_PROFILE);
    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : './profile.png';
    };

    const [groupName, setGroupName] = useState('');
    const [privacyOption, setPrivacyOption] = useState('Public');

    const [createGroup] = useMutation(CREATE_GROUP);
    const [createMember] = useMutation(CREATE_MEMBER);
    const [createGroupProfile] = useMutation(CREATE_GROUP_PROFILE);

    const inputGroup = {
        name: groupName,
        creatorID: data?.getUserByToken.id,
        description: "",
        status: privacyOption,
        createdAt: new Date(),
    };

    const handleCreateGroup = async(e) => {
        e.preventDefault();

        // console.log(inputGroup);
        const { data: res } = await createGroup({
            variables: {
                inputGroup: inputGroup,
            },
        });

        await createMember({
            variables: {
                userID: data?.getUserByToken.id,
                groupID: res?.createGroup.id,
                role: "Admin"
            }
        })
        alert('Group created successfully!');
        await createGroupProfile({
            variables: {
                groupID: res?.createGroup.id,
                imageLink: "https://res.cloudinary.com/dogiichep/image/upload/v1691980787/profile_xy1yuo.png"
            }
        })
    }
    
    return (
        <>
            <Header/>
            <div className='groups-page'>
            <Header/>
            <div className='groups-sidebar'>
                <div className='groups-sidebar-initial'>
                    <div className='groups-sidebar-header'>Create group</div>
                </div>
                <div className='groups-search-row'>
                <Image className='group-owner-profile' cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)}/>
                    <div className='group-owner-info'>
                        <div className='group-owner-name'>{data?.getUserByToken.name}</div>
                        <div className='group-owner-role'>Admin</div>
                    </div>
                </div>
                <input className='create-group-input' placeholder='Group name' onChange={(e) => setGroupName(e.target.value)}></input>
                <select
                        className='create-group-input'
                        value={privacyOption}
                        onChange={(e) => setPrivacyOption(e.target.value)}
                    >
                        <option value='Public'>Public</option>
                        <option value='Private'>Private</option>
                </select>
                {groupName && privacyOption ? (
                    <div className='create-group-btn-div'>
                        <button className='create-group-button' onClick={handleCreateGroup}>Create</button>
                    </div>
                ) : (
                    <div className='create-group-btn-div'>
                        <button className='disabled-create-group-btn' disabled>Create</button>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}

export default CreateGroup;