import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const FIND_USER = gql`
    mutation ActivateUser($id: ID!) {
        activateUser(id: $id) {
            id
            status
        }
    }
`;

const Verification = () => {
    const [isError, setIsError] = useState(false);
    const [findUser, {data: userData}] = useMutation(FIND_USER)
    const params = useParams();
    const id = JSON.stringify(params.id).replace(/"/g, '');

    useEffect(() => {
        findUser({
            variables: {
                id
            }
        }).then((result) => {
            setIsError(false);
        }).catch((error) => {
            setIsError(true)
        });
        console.log(id);
    }, []);

    if(!isError){
        return (
            <div>
                <h1>Account Activated Successfully!</h1>
                <p>Your account has been successfully activated.</p>
            </div>
        )
    }   
};

export default Verification;