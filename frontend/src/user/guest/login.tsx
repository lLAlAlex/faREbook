import React, { useEffect, useRef, useState } from 'react';
import '../../style/style.css';
import { gql, useMutation, useQuery } from '@apollo/client'
import emailjs from 'emailjs-com'
import Footer from '../../components/footer';
import {useNavigate} from 'react-router-dom';
import CryptoJS from 'crypto-js';

const mutation = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password)
    }
`

const Login = () => {
    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    useEffect(() => {
        if(token) {
            navigate('/home');
        }
    }, [])

    const [auth, { data, loading, error }] = useMutation(mutation)
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errorMsg, setErrorMsg] = useState('');

    // const encryptedData = CryptoJS.AES.encrypt(data, 'nc').toString();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = async(e) => {
        if(!formData.email || !formData.password) {
            setErrorMsg('All fields must be filled');
        }
        else {
            e.preventDefault();
            try {
                await auth({ variables: { email: formData.email, password: formData.password } })
            } catch (e) {
                setErrorMsg('Error')
            }
            console.log(data.login)
            if(data.login != "") {
                localStorage.setItem('jwtToken', data.login);
                navigate('/home');
            }
            setErrorMsg('');
        }
    };

    return (
        <body>
            <div id="flex-container">
                <img id="header" src="./public/header.png"></img>
                <div className="register-container">
                    <h2 id="headertitle">Log in to faREbook</h2>
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
                                style={{borderRadius: "0.5rem", backgroundColor: "white"}}
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
                                style={{borderRadius: "0.5rem", backgroundColor: "white"}}
                            />
                        </div>
                        <button id='loginbtn' type="submit" onClick={handleSubmit}>Log In</button>
                        <a id="forgotlink" href="/forgot">Forgotten account?</a>
                        <br></br>
                        <span className="or-divider">or</span>
                        <a href="/register"><button id='createbtn' type="button">Create new account</button></a>
                    </>
                </div>
            </div>
            <Footer />
        </body>
    );
}

export default Login;