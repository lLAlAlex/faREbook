import React, { useEffect, useRef, useState } from 'react';
import '../../style/style.css';
import { gql, useMutation, useQuery } from '@apollo/client'
import emailjs from 'emailjs-com'
import Footer from '../../components/footer';
import {Navigate, useNavigate} from 'react-router-dom';

const mutation = gql`
    mutation CreateUser($inputUser:NewUser!) {
        createUser(inputUser: $inputUser) {
            id
            name
            email
            dob
            gender
            status
        }
    }
`

const CREATE_USER_PROFILE = gql`
    mutation CreateUserProfile($userID: String!, $imageLink: String!) {
        createUserProfile(userID: $userID, imageLink: $imageLink) {
            id
            imageLink
        }
    }
`

const CREATE_USER_PROFILE_COVER = gql`
    mutation CreateUserProfileCover($userID: String!, $imageLink: String!) {
        createUserProfileCover(userID: $userID, imageLink: $imageLink) {
            id
            imageLink
        }
    }
`

const Register = () => {
    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    const navigate = useNavigate();

    useEffect(() => {
        if(token) {
            navigate('/home');
        }
    }, [])
    
    const [createUser] = useMutation(mutation)
    const [createUserProfile] = useMutation(CREATE_USER_PROFILE)
    const [createUserProfileCover] = useMutation(CREATE_USER_PROFILE_COVER)

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        day: '',
        month: '',
        year: '',
        gender: '',
    });

    const inputUser = {
        name: formData.firstname + " " + formData.lastname,
        email: formData.email,
        password: formData.password,
        dob: formData.day + "-" + formData.month + "-" + formData.year,
        gender: formData.gender,
        status: 'Unverified'
    };

    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const minPasswordLength = 8;
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /[0-9]/.test(formData.password);
    const currentDate = new Date();
const selectedDate = new Date(`${formData.year}-${formData.month}-${formData.day}`);

    const handleSubmit = async(e) => {
        if(!formData.firstname || !formData.email || !formData.password || !formData.day || !formData.month || !formData.year || !formData.gender) {
            setErrorMsg('All fields must be filled');
        }
        else if(!emailPattern.test(formData.email)) {
            setErrorMsg('Invalid email format');
        }
        else if(formData.password.length < minPasswordLength || !hasUpperCase || !hasLowerCase || !hasNumbers) {
            setErrorMsg('Password must be at least 8 characters long and contain upper and lowercase letters, as well as numbers');
        }
        else if (selectedDate > currentDate) {
            setErrorMsg('Date of birth cannot be in the future');
        }
        else {
            e.preventDefault();
            try {
                const response = await createUser({
                    variables: {
                        inputUser: inputUser
                    },
                });
                emailjs.send("gmail","template_fcl94o9",{
                    name: formData.firstname + " " + formData.lastname,
                    email: formData.email,
                    link: "https://localhost:5173/verification/"+response.data.createUser.id
                }, "h-H8nUHmTI8Lq0AHE");
                
                const imageLink = "https://res.cloudinary.com/dogiichep/image/upload/v1691980787/profile_xy1yuo.png";
                await createUserProfile({
                    variables: {
                        userID: response.data.createUser.id,
                        imageLink: imageLink
                    },
                });

                const coverImageLink = "https://res.cloudinary.com/dogiichep/image/upload/v1692268510/windows-10-default-k4s3pap71thyjavb_plsmas.jpg"
                await createUserProfileCover({
                    variables: {
                        userID: response.data.createUser.id,
                        imageLink: coverImageLink
                    },
                });
            } catch (error) {
                console.error('Mutation error:', error);
            }
            setErrorMsg('');
        }
        alert('Register successful, check your emails to activate your account');
    };

    return (
        <body>
            <div id="flex-container">
                <img id="header" src="./public/header.png"></img>
                <div className="register-container">
                    <h2>Create a new account</h2>
                    <>
                        {errorMsg && <div className="error-message">{errorMsg}</div>}
                        <div className="form-group">
                            <input
                                type="text"
                                id="firstname"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleChange}
                                placeholder='First Name'
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                id="lastname"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                                placeholder='Last Name'
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder='Email'
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder='Password'
                            />
                        </div>
                        <div className="form-row">
                            {/* <label>Gender:</label> */}
                            <div className="form-group">
                                <input
                                    type="number"
                                    id="day"
                                    name="day"
                                    value={formData.day}
                                    onChange={handleChange}
                                    placeholder='Day'
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="number"
                                    id="month"
                                    name="month"
                                    value={formData.month}
                                    onChange={handleChange}
                                    placeholder='Month'
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="number"
                                    id="year"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    placeholder='Year'
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <label>Gender:</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={formData.gender === 'male'}
                                        onChange={handleChange}
                                    />
                                    Male
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={formData.gender === 'female'}
                                        onChange={handleChange}
                                    />
                                    Female
                                </label>
                                {/* <label>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="custom"
                                        checked={formData.gender === 'custom'}
                                        onChange={handleChange}
                                    />
                                    Custom
                                </label> */}
                            </div>
                        </div>
                        <button id="registerbtn" type="submit" onClick={handleSubmit}>Register</button>
                    </>
                </div>
            </div>
            <Footer />
        </body>
    );
};

export default Register;