"use client";
import React, { useState, useEffect } from "react";
import Backdrop from '@mui/material/Backdrop';

const LoadingBackdrop = ({ open }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Evita renderizar até o componente estar montado no cliente
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <div 
        style={{
          maxWidth: '300px', 
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          backgroundColor: '#fff', 
          borderRadius: '8px'
        }}
      >
        <h2 style={{ marginBottom: '8px' }} className="text-black">Clous Pos</h2>
        <img 
          src="/loader/cloudpos.gif" 
          alt="Loading..." 
          style={{ width: '100px', height: '100px', marginBottom: '16px' }} 
        />
        <p style={{ textAlign: 'center', marginTop: '0' }} className="text-black">Loading...</p>
      </div>
    </Backdrop>
  );
};

export default LoadingBackdrop;
