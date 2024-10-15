import React from 'react';
import PropTypes from 'prop-types';
import { LoadScript } from '@react-google-maps/api';

const libraries = ['places']; 

const GoogleMapsLoader = ({ children }) => {
  const apiKey = 'AIzaSyCZai7VHlL_ERUPIvG3x-ztG6NJugx08Bo';

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onLoad={() => console.log('')}
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
