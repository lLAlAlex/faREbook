import React from 'react';
import './App.css';
import Register from './user/guest/register';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Verification from './user/verification/verification';
import Login from './user/guest/login';
import Home from './user/home';
import Forgot from './user/guest/forgot';
import ChangePassword from './user/guest/changepassword';
import Messenger from './user/messenger';
import Notifications from './user/notifications';
import Profile from './user/profile';
import Friends from './user/friends';
import Groups from './user/groups';
import Stories from './user/stories';
import Reels from './user/reels';
import CreateReel from './user/createreel';
import CreateStory from './user/createstory';
import Notification from './user/notifications';
import Search from './user/search';
import CreateGroup from './user/creategroup';
import GroupProfile from './user/groupprofile';

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/verification/:id" element={<Verification/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/forgot" element={<Forgot/>} />
          <Route path="/changepassword/:id" element={<ChangePassword/>} />
          <Route path="/profile/:id" element={<Profile/>} />
          <Route path="/friends" element={<Friends/>} />
          <Route path="/groups" element={<Groups/>} />
          <Route path="/messenger" element={<Messenger/>} />
          <Route path="/notifications" element={<Notifications/>} />
          <Route path="/stories" element={<Stories/>} />
          <Route path="/createstory" element={<CreateStory/>} />
          <Route path="/reels" element={<Reels/>} />
          <Route path="/createreel" element={<CreateReel/>} />
          <Route path="/notification" element={<Notification/>} />
          <Route path="/search/:query" element={<Search/>} />
          <Route path="/creategroup" element={<CreateGroup/>} />
          <Route path="/groupprofile/:id" element={<GroupProfile/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;