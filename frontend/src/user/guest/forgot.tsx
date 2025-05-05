import React, { useEffect, useRef, useState } from 'react';
import '../../style/style.css';
import { gql, useMutation, useQuery } from '@apollo/client'
import Footer from '../../components/footer';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com'

const GET_USER = gql`
    query GetUserByEmail($email:String!) {
        getUserByEmail(email: $email) {
            id
            name
            email
            dob
            gender
            status
        }
    }
`

const Forgot = () => {
    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    const navigate = useNavigate();

    useEffect(() => {
        if(token) {
            navigate('/home');
        }
    }, [])

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
    });

    const { data, loading, error } = useQuery(GET_USER, {
        variables: { email: formData.email },
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        if (!formData.email) {
            setErrorMsg('All fields must be filled');
        } 
        else {
            e.preventDefault();

            if(data) {
                try {
                    emailjs.send("gmail","template_fcl94o9",{
                        name: data.getUserByEmail.name,
                        email: data.getUserByEmail.email,
                        link: "https://localhost:5173/changepassword/"+data.getUserByEmail.id
                    }, "h-H8nUHmTI8Lq0AHE");
                } catch (error) {
                    console.error('Mutation error:', error);
                }
                setSuccessMsg('Email sent');
                setErrorMsg('');
            } 
            else {
                setErrorMsg('User not found');
            }
        }
    };

    return (
        <body>
            <div id="flex-container">
                <img id="header" src="./public/header.png"></img>
                <div className="register-container">
                    <h2 id="headertitle">Find Your Account</h2>
                    <h4>Please enter your email address to search for your account</h4>
                    <>
                        {errorMsg && <div className="error-message">{errorMsg}</div>}
                        <div className="form-group">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder='Email address'
                            />
                        </div>
                        <a href="/login"><button id="cancelbtn">Cancel</button></a>
                        <button id='submitbtn' type="submit" onClick={handleSubmit}>Submit</button>
                    </>
                </div>
            </div>
            <Footer />
        </body>
    );
}

export default Forgot;