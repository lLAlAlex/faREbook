import React, { useRef, useState } from 'react';
import '../../style/register.css';
import { gql, useMutation, useQuery } from '@apollo/client'
import emailjs from 'emailjs-com'

const mutation = gql`
    mutation CreateUser($inputUser:NewUser!) {
        createUser(inputUser: $inputUser) {
            id
            name
            email
            dob
            gender
        }
    }
`

const Register = () => {
    const [createUser, { data, loading, error }] = useMutation(mutation)

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        day: '',
        month: '',
        year: '',
        gender: '',
        status: 'Unverified'
    });

    const inputUser = {
        name: formData.firstname + " " + formData.lastname,
        email: formData.email,
        password: formData.password,
        dob: formData.day + "-" + formData.month + "-" + formData.year,
        gender: formData.gender,
        status: formData.status
    };

    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        if(!formData.firstname || !formData.lastname || !formData.email || !formData.password || !formData.day || !formData.month || !formData.year || !formData.gender) {
            setErrorMsg('All fields must be filled');
        }
        else {
            createUser({
                variables: {
                    inputUser: inputUser
                },
            })
            setErrorMsg('');
        }
    };

    function sendEmail(e) {
        e.preventDefault();

        emailjs.send("gmail","template_v90vrja",{
            name: formData.firstname + " " + formData.lastname,
            email: formData.email,
            password: formData.password,
        }, "7CiWl2FnVdmPW0yMF");
    }

    return (
        <body>
            <div id="flex-container">
                <img id="header" src="./public/header.png"></img>
                <div className="register-container">
                    <h2>Create a new account</h2>
                    <form onSubmit={sendEmail}>
                        {errorMsg && <div className="error-message">{errorMsg}</div>}
                        <div className="form-group">
                            <label htmlFor="firstname">First Name:</label>
                            <input
                                type="text"
                                id="firstname"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastname">Last Name:</label>
                            <input
                                type="text"
                                id="lastname"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="day">Day:</label>
                                <input
                                    type="number"
                                    id="day"
                                    name="day"
                                    value={formData.day}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="month">Month:</label>
                                <input
                                    type="number"
                                    id="month"
                                    name="month"
                                    value={formData.month}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="year">Year:</label>
                                <input
                                    type="number"
                                    id="year"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
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
                        <button type="submit" onClick={handleSubmit}>Register</button>
                    </form>
                </div>
            </div>
        </body>
    );
};

export default Register;