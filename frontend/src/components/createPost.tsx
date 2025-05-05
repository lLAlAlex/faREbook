import React, { useState } from 'react';
import { Image } from 'cloudinary-react';
import styles from '../style/home.module.css';

const CreatePost = ({ isModalOpen, closeModal, data, handleChange, firstName, selectedImages, setSelectedImages, handleSubmit, getProfileImage }) => {
    const handleRemoveImage = (index) => {
        const updatedImages = selectedImages.filter((_, i) => i !== index);
        setSelectedImages(updatedImages);
    };

    return (
        <div>
            {isModalOpen && (
                <div id={styles.myModal}>
                    <div className={styles.modalContent}>
                        <span className={styles.close} onClick={closeModal}>&times;</span>
                        <h3 id={styles.postheader}>Create Post</h3>
                        <div className={styles.divider}></div>
                        <div className={styles.row}>
                            <div id={styles.profileframe}><Image cloudName="dogiichep" publicId={getProfileImage(data?.getUserByToken.id)} id={styles.homeprofilepic}/></div>
                            <div id={styles.profilegroup}>
                                <div id={styles.profilename}>{data.getUserByToken.name}</div>
                                <select className={styles.privacyDropdown} name='privacy' onChange={(e) => handleChange(e)}>
                                    <option value="public">Public</option>
                                    <option value="friends">Friends</option>
                                    <option value="specificFriends">Specific Friends</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.row}>
                            <textarea
                                id={styles.postcontent}
                                placeholder={`What's on your mind, ${firstName}?`}
                                rows={1}
                                name='content'
                                onChange={(e) => {
                                    e.target.rows = 1;
                                    const computedRows = Math.floor(e.target.scrollHeight / 20);
                                    e.target.rows = computedRows;
                                    handleChange(e);
                                }}
                            ></textarea>
                            {/* <ReactQuill theme="snow" value={value} onChange={setValue} /> */}
                        </div>
                        <div className={styles.row} id={styles.imageCarousel}>
                            {selectedImages.map((image, index) => (
                                <img key={index} src={URL.createObjectURL(image)} onClick={() => handleRemoveImage(index)} alt={`Image ${index}`} />
                            ))}
                        </div>
                        <div className={styles.row} id={styles.attachments}>
                            <h4>Add to your post</h4>
                            <img
                                src="../img.png"
                                className={styles.imageIcon}
                                onClick={(e) => {
                                    const inputElement = document.createElement('input');
                                    inputElement.type = 'file';
                                    inputElement.accept = 'image/*, video/*';
                                    inputElement.multiple = true;
                                    inputElement.addEventListener('change', (event) => {
                                        const fileInput = event.target as HTMLInputElement;
                                        const files = Array.from(fileInput.files || []);
                                        setSelectedImages(files);
                                    });
                                    inputElement.click();
                                }}
                            />
                        </div>
                        <button id={styles.postbtn} onClick={handleSubmit}>Post</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreatePost;