import React, { useEffect, useRef, useState } from 'react';
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';
import { FaRegCommentAlt } from 'react-icons/fa';
import { BiShare } from 'react-icons/bi';
import styles from '../style/home.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { gql, useMutation, useQuery } from '@apollo/client';
import { IoMdSend } from 'react-icons/io';
import { Image } from 'cloudinary-react';

const CREATE_REEL_COMMENT = gql`
    mutation CreateReelComment($userID:String!, $reelID:String!, $comment:String!) {
        createReelComment(userID:$userID, reelID:$reelID, comment:$comment) {
            id
            user {
                id
            }
            reel {
                id
            }
            comment
        }
    }
`

const GET_REEL_COMMENTS = gql`
    query GetReelComments($reelID: String!) {
        getReelComments(reelID: $reelID) {
            id
            user {
                id
                name
            }
            reel {
                id
            }
            comment
            likes
            replies
            createdAt
        }
    }
`

const CREATE_REEL_COMMENT_LIKE = gql`
    mutation CreateCommentLike($userID:String!, $commentID:String!) {
        createCommentLike(userID:$userID, commentID:$commentID) {
            id
        }
    }
`

const DELETE_REEL_COMMENT_LIKE = gql`
    mutation DeleteReelCommentLike($userID:String!, $commentID:String!) {
        deleteReelCommentLike(userID:$userID, commentID:$commentID)
    }
`

const CREATE_REEL_COMMENT_REPLY = gql`
    mutation CreateReelCommentReply($userID:String!, $commentID:String!, $reply:String!) {
        createReelCommentReply(userID:$userID, commentID:$commentID, reply:$reply) {
            id
            user {
                id
            }
            comment {
                id
            }
            reply
        }
    }
`

const GET_REEL_COMMENT_REPLIES = gql`
    query GetReelCommentReplies($commentID: String!) {
        getReelCommentReplies(commentID: $commentID) {
            id
            user {
                id
                name
            }
            reply
            likes
            createdAt
        }
    }
`

const GET_REEL_LIKED_COMMENTS = gql`
    query GetReelLikedComments($token: String!) {
        getReelLikedComments(token:$token) {
            id
            comment {
                id
            }
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

const GET_REEL_VIDEOS = gql`
    query GetReelVideos {
        getReelVideos {
            id
            reel {
                id
            }
            videoLink
        }
    }
`

const ReelComment = ({ selectedReel, likedReels, toggleLike, calculateTimeAgo, closeCommentModal, data, refetchReel }) => {
    const [createReelComment] = useMutation(CREATE_REEL_COMMENT);
    const [createReelCommentLike] = useMutation(CREATE_REEL_COMMENT_LIKE);
    const [createReelCommentReply] = useMutation(CREATE_REEL_COMMENT_REPLY);
    const [deleteReelCommentLike] = useMutation(DELETE_REEL_COMMENT_LIKE);

    console.log(selectedReel.id);

    const [commentInput, setCommentData] = useState({
        comment: '',
    });

    const {data: commentsData, loading, error, refetch} = useQuery(GET_REEL_COMMENTS, {
        variables: {
            reelID: selectedReel.id
        }
    });

    console.log(commentsData)

    const token = localStorage.getItem('jwtToken');
    const { data: likedCommentsData } = useQuery(GET_REEL_LIKED_COMMENTS, {variables: {token}});

    const [selectedComment, setSelectedComment] = useState<{ id: string, reply: string; likes: number; replies: number; createdAt: string } | null>(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCommentData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const postComment = async(e) => {
        e.preventDefault();
        try {
            await createReelComment({
                variables: {
                    userID: data.getUserByToken.id,
                    reelID: selectedReel.id,
                    comment: commentInput.comment
                }
            });
            refetch();
            refetchReel();
            if(commentInputRef.current) {
                commentInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    }

    const [likedComments, setLikedComments] = useState({});

    const handleLike = async(commentID) => {
        const isCommentLiked = likedComments[commentID] || false;
        try {
            if(isCommentLiked) {
                await deleteReelCommentLike({ variables: { commentID, userID: data.getUserByToken.id } });
            } 
            else {
                await createReelCommentLike({ variables: { commentID, userID: data.getUserByToken.id } });
            }
            setLikedComments((prevLiked) => ({
                ...prevLiked,
                [commentID]: !isCommentLiked
            }));
            refetch();
            refetchReplies();
            setSelectedComment(commentsData?.getReelComments.find(c => c.id === commentID));
        } catch (error) {
            console.error('Error handling like:', error);
        }
    }

    const isEmptyObject = (obj) => {
        return JSON.stringify(obj) === '{}';
    };

    useEffect(() => {
        if(likedCommentsData) {
            console.log(likedCommentsData);
            console.log(likedComments);
            if(isEmptyObject(likedComments)) {
                const likedCommentsMap = {};
                likedCommentsData.getReelLikedComments.forEach((likedComment) => {
                    likedCommentsMap[likedComment.comment.id] = true;
                });
                setLikedComments(likedCommentsMap);
            } 
            commentsData?.getReelComments.map((comment) => {
                return {
                    ...comment,
                    isLiked: !!likedComments[comment.id],
                };
            });
        }
    }, [commentsData, likedCommentsData]);

    const [replyVisibility, setReplyVisibility] = useState({});

    const toggleReplyVisibility = (commentID) => {
        setReplyVisibility((prevVisibility) => ({
            ...prevVisibility,
            [commentID]: !prevVisibility[commentID]
        }));
        setSelectedComment(commentsData?.getReelComments.find(c => c.id === commentID));
    };

    const [replyInput, setReplyData] = useState({
        reply: '',
    });

    const handleReplyChange = (e) => {
        const { name, value } = e.target;
        setReplyData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleReply = async(e) => {
        e.preventDefault();

        try {
            await createReelCommentReply({
                variables: {
                    userID: data.getUserByToken.id,
                    commentID: selectedComment?.id,
                    reply: replyInput.reply
                }
            })
            if(replyInputRef.current) {
                replyInputRef.current.value = '';
            }
        } catch(error) {
            console.error("Error", error);
        }
        refetchReplies();
        refetch();
    }

    const {data: repliesData, refetch: refetchReplies} = useQuery(GET_REEL_COMMENT_REPLIES, {
        variables: {
            commentID: selectedComment?.id
        }
    });

    const getRevealRepliesText = (commentID) => {
        return replyVisibility[commentID] ? 'Hide' : '';
    };

    const commentInputRef = useRef<HTMLInputElement>(null);
    const replyInputRef = useRef<HTMLInputElement>(null);
    const { data: profileData } = useQuery(GET_ALL_PROFILE);

    const getProfileImage = (userID) => {
        const userProfile = profileData?.getAllUserProfile.find((profile) => profile.user.id === userID);
        return userProfile ? userProfile.imageLink : './profile.png';
    };

    const { data: reelsVideoData } = useQuery(GET_REEL_VIDEOS);

    const getReelVideo = (reelID) => {
        const reelVideo = reelsVideoData?.getReelVideos.find((v) => v.reel.id === reelID);
        return reelVideo;
    };

    return (
        <div id={styles.myModal}>
            <div className={styles.commentModalContent}>
                <span className={styles.close} onClick={closeCommentModal}>&times;</span>
                <h3 id={styles.postheader}>Comments</h3>
                <div className={styles.divider}></div>
                <div className={styles.scrollable}>
                    <div id={styles.postrow}>
                        <div id={styles.profileframe}><Image cloudName="dogiichep" publicId={getProfileImage(selectedReel.user.id)} id={styles.homeprofilepic}/></div>
                        <div id={styles.postdata}>
                            <h4 id={styles.postname}>{selectedReel.user.name}</h4>
                            <div id={styles.postdate}>{calculateTimeAgo(selectedReel.createdAt)}</div>
                        </div>
                    </div>
                    <div id={styles.postrow}>
                        <div id={styles.postedcontent}>{selectedReel.content}</div>
                    </div>
                    {/* <div id={styles.postImages}>
                        {reelsVideoData?.getReelVideos.filter((video) => video.reel.id === selectedReel.id).length > 1 ? (
                            <div className={styles.Imagecarousel}>
                                <Image
                                    cloudName="dogiichep"
                                    publicId={reelsVideoData?.getReelVideos.filter((video) => video.reel.id === selectedReel.id)[currentVideoIndex].imageLink}
                                    className={styles.postimage}
                                />
                                <div id={styles.carouselrow}>
                                    <div className={styles.carouselLeftButton} onClick={() => {if(currentVideoIndex > 0) {setCurrentVideoIndex(currentVideoIndex - 1)}}}>
                                        &lt;
                                    </div>
                                    <div className={styles.carouselRightButton} onClick={() => {if(currentVideoIndex < reelsVideoData?.getReelVideos.filter((video) => video.reel.id === selectedReel.id).length - 1) {setCurrentVideoIndex(currentVideoIndex + 1)}}}>
                                        &gt;
                                    </div>
                                </div>
                            </div>
                        ) : (
                            reelsVideoData?.getReelVideos.filter((video) => video.reel.id === selectedReel.id).map((video, index) => (
                                <Image key={index} cloudName="dogiichep" publicId={video.videoLink} className={styles.postimage} />
                            ))
                        )}
                    </div> */}
                    <div id={styles.postrow}>
                        <AiFillLike size={20} color="black" />
                        <div id={styles.likecount}>{selectedReel.likes}</div>
                        <div id={styles.commentcount}>{selectedReel.comments} comments</div>
                    </div>
                    <div className={styles.divider}></div>
                    <div id={styles.postaction}>
                        <div id={styles.action} onClick={() => toggleLike(selectedReel.id)}>
                            {likedReels[selectedReel.id] ? (
                                <AiFillLike size={20} color="blue" />
                            ) : (
                                <AiOutlineLike size={20} color="black" />
                            )}
                            <div id={styles.like}>Like</div>
                        </div>
                        <div id={styles.action}>
                            <FaRegCommentAlt size={18}/>
                            <div id={styles.comment}>Comment</div>
                        </div>
                        <div id={styles.action}>
                            <BiShare size={20}/>
                            <div id={styles.share}>Share</div>
                        </div>
                    </div>
                    {commentsData && commentsData.getReelComments.map(comment => (
                        <div id={styles.commentlayout} key={comment.id}>
                            <div id={styles.commentrow}>
                                <div className={styles.commentPicFrame}><Image cloudName="dogiichep" publicId={getProfileImage(comment.user.id)} className={styles.commentPic}/></div>
                                <div className={styles.commentData}>
                                    <h5 className={styles.commentName}>{comment.user.name}</h5>
                                    <div className={styles.commentText}>{comment.comment}</div>
                                </div>
                                <div className={styles.commentLikeGroup}>
                                    {likedComments[comment.id] ? (
                                        <AiFillLike size={20} color="blue" />
                                    ) : (
                                        <AiOutlineLike size={20} color="black" />
                                    )}
                                    <div className={styles.commentLikeCount}>{comment.likes}</div>
                                </div>
                            </div>
                            <div className={styles.commentActions}>
                                <div className={styles.commentLike} onClick={() => handleLike(comment.id)}>Like</div>
                                <div className={styles.commentReply} onClick={() => toggleReplyVisibility(comment.id)}>Reply</div>
                                <div className={styles.commentCreatedAt}>{calculateTimeAgo(comment.createdAt)}</div>
                            </div>
                            {comment.replies > 0 && (
                                <div className={styles.revealReplies} onClick={() => toggleReplyVisibility(comment.id)}>
                                    {getRevealRepliesText(comment.id) } {comment.replies} Replies
                                </div>
                            )}
                            {comment.id === selectedComment?.id && repliesData && repliesData.getReelCommentReplies.map(reply => (
                                <div className={styles.commentrow} style={{ display: replyVisibility[comment.id] ? 'flex' : 'none' }} key={reply.id}>
                                    <div className={styles.replyprofileframe}><Image cloudName="dogiichep" publicId={getProfileImage(reply.user.id)} className={styles.replyprofilepic}/></div>
                                    <div className={styles.replyData}>
                                        <h5 className={styles.replyName}>{reply.user.name}</h5>
                                        <div className={styles.replyText}>{reply.reply}</div>
                                    </div>
                                </div>
                            ))}
                            {replyVisibility[comment.id] && (
                                <div className={styles.commentrow}>
                                    <div className={styles.replyprofileframe}><Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} className={styles.replyprofilepic}/></div>
                                    <input className={styles.replyfield} ref={replyInputRef} name='reply' type="text" placeholder='Write a comment...' onChange={(e) => handleReplyChange(e)}></input>
                                    <div className={styles.sendicon} onClick={handleReply}><IoMdSend size={"3vh"}/></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div id={styles.postactionrow}>
                    <div id={styles.profileframe}><Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} id={styles.homeprofilepic}/></div>
                    <input id={styles.postfield} ref={commentInputRef} name='comment' type="text" placeholder='Write a comment...' onChange={(e) => handleChange(e)}></input>
                    {/* <ReactQuill theme="snow"/> */}
                </div>
                <button id={styles.postbtn} onClick={postComment}>Post</button>
            </div>
        </div>
    );
}

export default ReelComment;
