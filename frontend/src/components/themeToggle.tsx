import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
    const [darkMode, setDarkMode] = useState(false);

    const toggleMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);

        if(newMode) {
            document.body.classList.add('dark-mode');
        } 
        else {
            document.body.classList.remove('dark-mode');
        }
    };

    return (
        <div className="toggle-container">
            <button onClick={toggleMode}>
                {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
        </div>
    );
};

export default ThemeToggle;