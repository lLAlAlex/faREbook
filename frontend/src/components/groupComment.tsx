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

const CREATE_GROUP_COMMENT = gql`
    mutation CreateGroupComment($userID:String!, $groupPostID:String!, $comment:String!) {
        createGroupComment(userID:$userID, groupPostID:$groupPostID, comment:$comment) {
            id
            user {
                id
            }
            groupPost {
                id
            }
            comment
        }
    }
`

const GET_GROUP_POST_COMMENTS = gql`
    query GetGroupPostComments($groupPostID: String!) {
        getGroupPostComments(groupPostID: $groupPostID) {
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

const CREATE_GROUP_COMMENT_LIKE = gql`
    mutation CreateGroupCommentLike($userID:String!, $groupCommentID:String!) {
        createGroupCommentLike(userID:$userID, groupCommentID:$groupCommentID) {
            id
        }
    }
`

const DELETE_GROUP_COMMENT_LIKE = gql`
    mutation DeleteGroupCommentLike($userID:String!, $groupCommentID:String!) {
        deleteGroupCommentLike(userID:$userID, groupCommentID:$groupCommentID)
    }
`

const CREATE_GROUP_COMMENT_REPLY = gql`
    mutation CreateGroupCommentReply($userID:String!, $groupCommentID:String!, $reply:String!) {
        createGroupCommentReply(userID:$userID, groupCommentID:$groupCommentID, reply:$reply) {
            id
            user {
                id
            }
            groupComment {
                id
            }
            reply
        }
    }
`

const GET_GROUP_COMMENT_REPLIES = gql`
    query GetGroupCommentReplies($groupCommentID: String!) {
        getGroupCommentReplies(groupCommentID: $groupCommentID) {
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

const GET_LIKED_GROUP_COMMENTS = gql`
    query GetLikedGroupComments($token: String!) {
        getLikedGroupComments(token:$token) {
            id
            groupComment {
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

const GET_GROUP_POST_MEDIAS = gql`
    query GetGroupPostMedias {
        getGroupPostMedias {
            id
            groupPost {
                id
            }
            mediaLink
        }
    }
`

const GroupCommentModal = ({ selectedGroupPost, likedGroupPosts, toggleLike, calculateTimeAgo, closeCommentModal, data, refetchGroupPost }) => {
    const [createGroupComment] = useMutation(CREATE_GROUP_COMMENT);
    const [createGroupCommentLike] = useMutation(CREATE_GROUP_COMMENT_LIKE);
    const [createGroupCommentReply] = useMutation(CREATE_GROUP_COMMENT_REPLY);
    const [deleteGroupCommentLike] = useMutation(DELETE_GROUP_COMMENT_LIKE);

    const [commentInput, setCommentData] = useState({
        comment: '',
    });

    const {data: commentsData, refetch} = useQuery(GET_GROUP_POST_COMMENTS, {
        variables: {
            groupPostID: selectedGroupPost.id
        }
    });

    // console.log(selectedGroupPost);

    const token = localStorage.getItem('jwtToken');
    const { data: likedCommentsData } = useQuery(GET_LIKED_GROUP_COMMENTS, {variables: {token}});

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
            await createGroupComment({
                variables: {
                    userID: data.getUserByToken.id,
                    groupPostID: selectedGroupPost.id,
                    comment: commentInput.comment
                }
            });
            refetch();
            refetchGroupPost();
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
                await deleteGroupCommentLike({ variables: { groupCommentID: commentID, userID: data.getUserByToken.id } });
            } 
            else {
                await createGroupCommentLike({ variables: { groupCommentID: commentID, userID: data.getUserByToken.id } });
            }
            setLikedComments((prevLiked) => ({
                ...prevLiked,
                [commentID]: !isCommentLiked
            }));
            refetch();
            refetchReplies();
            setSelectedComment(commentsData?.getGroupPostComments.find(c => c.id === commentID));
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
                likedCommentsData.getLikedGroupComments.forEach((likedComment) => {
                    likedCommentsMap[likedComment.groupComment.id] = true;
                });
                setLikedComments(likedCommentsMap);
            } 
            commentsData?.getGroupPostComments.map((comment) => {
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
        setSelectedComment(commentsData?.getGroupPostComments.find(c => c.id === commentID));
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
            await createGroupCommentReply({
                variables: {
                    userID: data?.getUserByToken.id,
                    groupCommentID: selectedComment?.id,
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

    const {data: repliesData, refetch: refetchReplies} = useQuery(GET_GROUP_COMMENT_REPLIES, {
        variables: {
            groupCommentID: selectedComment?.id
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

    const { data: postImagesData } = useQuery(GET_GROUP_POST_MEDIAS);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    return (
        <div id={styles.myModal}>
            <div className={styles.commentModalContent}>
                <span className={styles.close} onClick={closeCommentModal}>&times;</span>
                <h3 id={styles.postheader}>Comments</h3>
                <div className={styles.divider}></div>
                <div className={styles.scrollable}>
                    <div id={styles.postrow}>
                        <div id={styles.profileframe}><Image cloudName="dogiichep" publicId={getProfileImage(selectedGroupPost.user.id)} id={styles.homeprofilepic}/></div>
                        <div id={styles.postdata}>
                            <h4 id={styles.postname}>{selectedGroupPost.user.name}</h4>
                            <div id={styles.postdate}>{calculateTimeAgo(selectedGroupPost.createdAt)}</div>
                        </div>
                    </div>
                    <div id={styles.postrow}>
                        <div id={styles.postedcontent}>{selectedGroupPost.content}</div>
                    </div>
                    <div id={styles.postImages}>
                        {postImagesData?.getGroupPostMedias.filter((image) => image.groupPost.id === selectedGroupPost.id).length > 1 ? (
                            <div className={styles.Imagecarousel}>
                                {postImagesData?.getGroupPostMedias.filter((image) => image.groupPost.id === selectedGroupPost.id)[currentImageIndex].mediaLink.endsWith('.mp4') || postImagesData?.getGroupPostMedias.filter((image) => image.groupPost.id === selectedGroupPost.id)[currentImageIndex].mediaLink.endsWith('.mkv') ? (
                                    <Video
                                        cloudName="dogiichep"
                                        publicId={postImagesData?.getGroupPostMedias.filter((image) => image.groupPost.id === selectedGroupPost.id)[currentImageIndex].mediaLink}
                                        controls
                                        className={styles.postimage}
                                    />
                                ) : (
                                    <Image
                                        cloudName="dogiichep"
                                        publicId={postImagesData?.getGroupPostMedias.filter((image) => image.groupPost.id === selectedGroupPost.id)[currentImageIndex].mediaLink}
                                        className={styles.postimage}
                                    />
                                )}
                                <div id={styles.carouselrow}>
                                    <div className={styles.carouselLeftButton} onClick={() => {if(currentImageIndex > 0) {setCurrentImageIndex(currentImageIndex - 1)}}}>
                                        &lt;
                                    </div>
                                    <div className={styles.carouselRightButton} onClick={() => {if(currentImageIndex < postImagesData?.getGroupPostMedias.filter((image) => image.groupPost.id === selectedGroupPost.id).length - 1) {setCurrentImageIndex(currentImageIndex + 1)}}}>
                                        &gt;
                                    </div>
                                </div>
                            </div>
                        ) : (
                            postImagesData?.getGroupPostMedias.filter((image) => image.groupPost.id === selectedGroupPost.id).map((image, index) => (
                                image.mediaLink.endsWith('.mp4') || image.mediaLink.endsWith('.mkv') ? (
                                    <Video key={index} cloudName="dogiichep" publicId={image.mediaLink} controls className={styles.postimage} />
                                ) : (
                                    <Image key={index} cloudName="dogiichep" publicId={image.mediaLink} className={styles.postimage} />
                                )
                            ))
                        )}
                    </div>
                    <div id={styles.postrow}>
                        <AiFillLike size={20} color="black" />
                        <div id={styles.likecount}>{selectedGroupPost.likes}</div>
                        <div id={styles.commentcount}>{selectedGroupPost.comments} comments</div>
                    </div>
                    <div className={styles.divider}></div>
                    <div id={styles.postaction}>
                        <div id={styles.action} onClick={() => toggleLike(selectedGroupPost.id)}>
                            {likedGroupPosts[selectedGroupPost.id] ? (
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
                    {commentsData && commentsData.getGroupPostComments.map(comment => (
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
                            {comment.id === selectedComment?.id && repliesData && repliesData.getGroupCommentReplies.map(reply => (
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

export default GroupCommentModal;