import React, { useEffect, useRef, useState } from 'react';
import '../../style/style.css';
import { gql, useMutation, useQuery } from '@apollo/client'
import Footer from '../../components/footer';
import { useNavigate, useParams } from "react-router-dom";

const UPDATE_PASSWORD = gql`
    mutation ForgotPassword($id: ID!, $password: String!) {
        forgotPassword(id: $id, password: $password) {
            id
            password
        }
    }
`;

const GET_USER = gql`
    query GetUser($id: ID!) {
        getUser(id: $id) {
            id
            name
            email
            dob
            gender
            status
        }
    }
`

const ChangePassword = () => {
    const encryptedData = localStorage.getItem('jwtToken');
    // const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'nc').toString(CryptoJS.enc.Utf8);
    const token = encryptedData;

    const navigate = useNavigate();

    useEffect(() => {
        if(token) {
            navigate('/home');
        }
    }, [])

    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        newpassword: '',
        confpassword: '',
    });

    const params = useParams();
    const id = JSON.stringify(params.id).replace(/"/g, '');

    const [updatePassword] = useMutation(UPDATE_PASSWORD);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const {data: userData} = useQuery(GET_USER, {variables: {id}})

    const handleSubmit = async(e) => {
        if(!formData.newpassword || !formData.confpassword) {
            setErrorMsg('All fields must be filled');
        }
        else if(formData.newpassword != formData.confpassword) {
            setErrorMsg('Password does not match');
        }
        else if(userData?.getUser.password === formData.newpassword) {
            setErrorMsg('New password cannot be the same');
        }
        else {
            e.preventDefault();
            updatePassword({
                variables: {
                    id,
                    password: formData.newpassword
                }
            }).then((result) => {
                setIsError(false);
            }).catch((error) => {
                setIsError(true)
            });
            setErrorMsg('');
        }
    };

    return (
        <body>
            <div id="flex-container">
                <img id="header" src="../header.png"></img>
                <div className="register-container">
                    <h2 id="headertitle">Change Your Password</h2>
                    <>
                        {errorMsg && <div className="error-message">{errorMsg}</div>}
                        <div className="form-group">
                            <input
                                type="password"
                                id="newpassword"
                                name="newpassword"
                                value={formData.newpassword}
                                onChange={handleChange}
                                placeholder='New Password'
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                id="confpassword"
                                name="confpassword"
                                value={formData.confpassword}
                                onChange={handleChange}
                                placeholder='Confirm Password'
                            />
                        </div>
                        <button id='submitbtn' type="submit" onClick={handleSubmit}>Submit</button>
                    </>
                </div>
            </div>
            <Footer />
        </body>
    );
}

export default ChangePassword;