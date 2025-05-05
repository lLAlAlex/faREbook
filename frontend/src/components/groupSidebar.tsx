import React from 'react';
import { IoMdSettings } from 'react-icons/io';
import { MdFeed, MdGroups } from 'react-icons/md';
import { AiFillCompass } from 'react-icons/ai';
import { Image } from 'cloudinary-react';

const GroupSidebar = ({ handleCreateGroup, userGroupsData, getGroupProfile, handleGroupProfile }) => {
    return (
        <div className='groups-sidebar'>
            <div className='groups-sidebar-initial'>
                <div className='groups-sidebar-header'>Groups</div>
                <div className='groups-setting'><IoMdSettings size={'3vh'}/></div>
            </div>
            <div className='groups-search-row'>
                <input className='groups-search-bar' placeholder='Search groups'></input>
            </div>
            <div className='groups-active-row'>
                <div className='groups-active-icon'><MdFeed size={'3vh'} color='white'/></div>
                <div className='groups-menu-text'>Your feed</div>
            </div>
            <div className='groups-interactive-row'>
                <div className='groups-menu-icon'><AiFillCompass size={'3vh'}/></div>
                <div className='groups-menu-text'>Discover</div>
            </div>
            <div className='groups-interactive-row'>
                <div className='groups-menu-icon'><MdGroups size={'3vh'}/></div>
                <div className='groups-menu-text'>Your groups</div>
            </div>
            <div className='groups-row'>
                <button className='create-group-btn' onClick={handleCreateGroup}>+ Create new group</button>
            </div>
            <div className='divider'></div>
            
            <div className='user-groups-header'>Groups you've joined</div>
            {userGroupsData && userGroupsData?.getUserGroups.map(g => (
                <div className='groups-interactive-row' onClick={() => handleGroupProfile(g.id)}>
                    <Image className='group-profile-pic' cloudName="dogiichep" publicId={getGroupProfile(g.id)}/>
                    <div className='group-name'>{g.name}</div>
                </div>
            ))}
        </div>
    );
}

export default GroupSidebar;