import React from 'react';
import PropTypes from 'prop-types';
import { LoadScript } from '@react-google-maps/api';

const libraries = ['places']; 

const GoogleMapsLoader = ({ children }) => {
  const apiKey = 'AIzaSyA4AnscOsaLsNUGrCnWrJH-k8XlBsltPgM';

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onLoad={() => console.log('Google Maps API loaded successfully')}
      onError={(e) => console.error('Google Maps API loading error:', e)}
    >
      {children}
    </LoadScript>
  );
};

GoogleMapsLoader.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GoogleMapsLoader;
