import React, { useEffect, useRef, useState } from 'react';
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';
import { FaRegCommentAlt } from 'react-icons/fa';
import { BiShare } from 'react-icons/bi';
import styles from '../style/home.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { gql, useMutation, useQuery } from '@apollo/client';
import { IoMdSend } from 'react-icons/io';
import { Image, Video } from 'cloudinary-react';

const CREATE_COMMENT = gql`
    mutation CreateComment($userID:String!, $postID:String!, $comment:String!) {
        createComment(userID:$userID, postID:$postID, comment:$comment) {
            id
            user {
                id
            }
            post {
                id
            }
            comment
        }
    }
`

const GET_POST_COMMENTS = gql`
    query GetAllPostComments($postID: String!) {
        getAllPostComments(postID: $postID) {
            id
            user {
                id
                name
            }
            comment
            likes
            replies
            createdAt
        }
    }
`

const CREATE_COMMENT_LIKE = gql`
    mutation CreateCommentLike($userID:String!, $commentID:String!) {
        createCommentLike(userID:$userID, commentID:$commentID) {
            id
        }
    }
`

const DELETE_COMMENT_LIKE = gql`
    mutation DeleteCommentLike($userID:String!, $commentID:String!) {
        deleteCommentLike(userID:$userID, commentID:$commentID)
    }
`

const CREATE_COMMENT_REPLY = gql`
    mutation CreateCommentReply($userID:String!, $commentID:String!, $reply:String!) {
        createCommentReply(userID:$userID, commentID:$commentID, reply:$reply) {
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

const GET_COMMENT_REPLIES = gql`
    query GetCommentReplies($commentID: String!) {
        getCommentReplies(commentID: $commentID) {
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

const GET_LIKED_COMMENTS = gql`
    query GetLikedComments($token: String!) {
        getLikedComments(token:$token) {
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

const GET_ALL_IMAGES = gql`
    query GetAllPostImages {
        getAllPostImages {
            id
            post {
                id
            }
            imageLink
        }
    }
`

const CommentModal = ({ selectedPost, likedPosts, toggleLike, calculateTimeAgo, closeCommentModal, data, refetchPost }) => {
    const [createComment] = useMutation(CREATE_COMMENT);
    const [createCommentLike] = useMutation(CREATE_COMMENT_LIKE);
    const [createCommentReply] = useMutation(CREATE_COMMENT_REPLY);
    const [deleteCommentLike] = useMutation(DELETE_COMMENT_LIKE);

    console.log(selectedPost.id);

    const [commentInput, setCommentData] = useState({
        comment: '',
    });

    const {data: commentsData, refetch} = useQuery(GET_POST_COMMENTS, {
        variables: {
            postID: selectedPost.id
        }
    });

    console.log(commentsData)

    const token = localStorage.getItem('jwtToken');
    const { data: likedCommentsData } = useQuery(GET_LIKED_COMMENTS, {variables: {token}});

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
            await createComment({
                variables: {
                    userID: data.getUserByToken.id,
                    postID: selectedPost.id,
                    comment: commentInput.comment
                }
            });
            refetch();
            refetchPost();
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
        // console.log(commentID);
        try {
            if(isCommentLiked) {
                await deleteCommentLike({ variables: { commentID, userID: data.getUserByToken.id } });
            } 
            else {
                await createCommentLike({ variables: { commentID, userID: data.getUserByToken.id } });
            }
            setLikedComments((prevLiked) => ({
                ...prevLiked,
                [commentID]: !isCommentLiked
            }));
            refetch();
            refetchReplies();
            setSelectedComment(commentsData?.getAllPostComments.find(c => c.id === commentID));
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
                likedCommentsData.getLikedComments.forEach((likedComment) => {
                    likedCommentsMap[likedComment.comment.id] = true;
                });
                setLikedComments(likedCommentsMap);
            } 
            commentsData?.getAllPostComments.map((comment) => {
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
        setSelectedComment(commentsData?.getAllPostComments.find(c => c.id === commentID));
        // console.log(selectedComment?.id);
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
            await createCommentReply({
                variables: {
                    userID: data.getUserByToken.id,
                    commentID: selectedComment?.id,
                    reply: replyInput.reply
                }
            })
            refetchReplies();
            refetch();
            if(replyInputRef.current) {
                replyInputRef.current.value = '';
            }
        } catch(error) {
            console.error("Error", error);
        }
    }

    const {data: repliesData, refetch: refetchReplies} = useQuery(GET_COMMENT_REPLIES, {
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
        return userProfile ? userProfile.imageLink : 'http://localhost:5173/profile.png';
    };

    const { data: postImagesData } = useQuery(GET_ALL_IMAGES);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    return (
        <div id={styles.myModal}>
            <div className={styles.commentModalContent}>
                <span className={styles.close} onClick={closeCommentModal}>&times;</span>
                <h3 id={styles.postheader}>Comments</h3>
                <div className={styles.divider}></div>
                <div className={styles.scrollable}>
                    <div id={styles.postrow}>
                        <div id={styles.profileframe}><Image cloudName="dogiichep" publicId={getProfileImage(selectedPost.user.id)} id={styles.homeprofilepic}/></div>
                        <div id={styles.postdata}>
                            <h4 id={styles.postname}>{selectedPost.user.name}</h4>
                            <div id={styles.postdate}>{calculateTimeAgo(selectedPost.createdAt)}</div>
                        </div>
                    </div>
                    <div id={styles.postrow}>
                        <div id={styles.postedcontent}>
                            {(() => {
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = selectedPost.content;
                                return tempDiv.textContent || tempDiv.innerText || '';
                            })()}
                        </div>
                    </div>
                    <div id={styles.postImages}>
                        {postImagesData?.getAllPostImages.filter((image) => image.post.id === selectedPost.id).length > 1 ? (
                            <div className={styles.Imagecarousel}>
                                {postImagesData?.getAllPostImages.filter((image) => image.post.id === selectedPost.id)[currentImageIndex].imageLink.endsWith('.mp4') || postImagesData?.getAllPostImages.filter((image) => image.post.id === selectedPost.id)[currentImageIndex].imageLink.endsWith('.mkv') ? (
                                    <Video
                                        cloudName="dogiichep"
                                        publicId={postImagesData?.getAllPostImages.filter((image) => image.post.id === selectedPost.id)[currentImageIndex].imageLink}
                                        controls
                                        className={styles.postimage}
                                    />
                                ) : (
                                    <Image
                                        cloudName="dogiichep"
                                        publicId={postImagesData?.getAllPostImages.filter((image) => image.post.id === selectedPost.id)[currentImageIndex].imageLink}
                                        className={styles.postimage}
                                    />
                                )}
                                <div id={styles.carouselrow}>
                                    <div className={styles.carouselLeftButton} onClick={() => {if(currentImageIndex > 0) {setCurrentImageIndex(currentImageIndex - 1)}}}>
                                        &lt;
                                    </div>
                                    <div className={styles.carouselRightButton} onClick={() => {if(currentImageIndex < postImagesData?.getAllPostImages.filter((image) => image.post.id === selectedPost.id).length - 1) {setCurrentImageIndex(currentImageIndex + 1)}}}>
                                        &gt;
                                    </div>
                                </div>
                            </div>
                        ) : (
                            postImagesData?.getAllPostImages.filter((image) => image.post.id === selectedPost.id).map((image, index) => (
                                image.imageLink.endsWith('.mp4') || image.imageLink.endsWith('.mkv') ? (
                                    <Video key={index} cloudName="dogiichep" publicId={image.imageLink} controls className={styles.postimage} />
                                ) : (
                                    <Image key={index} cloudName="dogiichep" publicId={image.imageLink} className={styles.postimage} />
                                )
                            ))
                        )}
                    </div>
                    <div id={styles.postrow}>
                        <AiFillLike size={20} color="black" />
                        <div id={styles.likecount}>{selectedPost.likes}</div>
                        <div id={styles.commentcount}>{selectedPost.comments} comments</div>
                    </div>
                    <div className={styles.divider}></div>
                    <div id={styles.postaction}>
                        <div id={styles.action} onClick={() => toggleLike(selectedPost.id)}>
                            {likedPosts[selectedPost.id] ? (
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
                    {commentsData && commentsData.getAllPostComments.map(comment => (
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
                            {comment.id === selectedComment?.id && repliesData && repliesData.getCommentReplies.map(reply => (
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

export default CommentModal;
