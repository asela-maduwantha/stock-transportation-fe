import React from 'react';
import PropTypes from 'prop-types';
import { LoadScript } from '@react-google-maps/api';

const libraries = ['places']; 

const GoogleMapsLoader = ({ children }) => {
    const apiKey = 'AIzaSyAyRG15a19j3uqI_7uEbQ6CZrp-h2KP0eM'; 

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
