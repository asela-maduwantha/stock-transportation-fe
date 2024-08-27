import React from 'react';
import PropTypes from 'prop-types';
import { LoadScript } from '@react-google-maps/api';

const libraries = ['places']; 

const GoogleMapsLoader = ({ children }) => {
  const apiKey = 'AIzaSyCYciRolf7wRjfQln989Tk4REwSeZl0zlE'; 

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
    >
      {children}
    </LoadScript>
  );
};

GoogleMapsLoader.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GoogleMapsLoader;

