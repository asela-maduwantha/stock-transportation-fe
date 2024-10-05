import React from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import PropTypes from 'prop-types';

const RouteMap = ({ mapRef, mapCenter, mapZoom, pickupCoords, dropoffCoords, directions }) => (
  <div style={{ height: '400px', width: '100%' }}>
    <GoogleMap
      mapContainerStyle={{ height: '100%', width: '100%' }}
      center={mapCenter}
      zoom={mapZoom}
      onLoad={(map) => {
        mapRef.current = map;
      }}
    >
      {pickupCoords && (
        <Marker
          position={pickupCoords}
          label="P"
        />
      )}
      {dropoffCoords && (
        <Marker
          position={dropoffCoords}
          label="D"
        />
      )}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#1890ff",
              strokeWeight: 5,
            },
          }}
        />
      )}
    </GoogleMap>
  </div>
);

RouteMap.propTypes = {
    mapRef: PropTypes.shape({ current: PropTypes.object }),
    mapCenter: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }).isRequired,
    mapZoom: PropTypes.number.isRequired,
    pickupCoords: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }),
    dropoffCoords: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }),
    directions: PropTypes.object,
  };

export default RouteMap;