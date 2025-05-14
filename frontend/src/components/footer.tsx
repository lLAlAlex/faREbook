import React from 'react';

const Footer = () => {
  return (
    <>
      <div style={{marginTop: "20vh"}}></div>
      <footer style={{
        backgroundColor: '#ffffff',
        padding: '2vh',
        textAlign: 'center',
        position: 'fixed',
        left: '0',
        bottom: '0',
        width: '100%',
      }}>
        <p>© 2023 faREbook. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Footer;