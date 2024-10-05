import React from 'react';
import { Card, Typography, Space } from 'antd';
import PropTypes from 'prop-types';

const { Title, Text } = Typography;

const VehicleDetailsCard = ({ vehicle, booking }) => (
  <Card
    cover={
      <img
        alt={vehicle.type}
        src={vehicle.photoUrl}
        style={{ objectFit: "cover", height: "300px" }}
      />
    }
  >
    <Card.Meta
      title={<Title level={3}>{vehicle.type}</Title>}
      description={
        <Space direction="vertical" size="small">
          <Text><strong>Type:</strong> {vehicle.type}</Text>
          <Text><strong>Preferred Area:</strong> {vehicle.preferredArea}</Text>
          <Text><strong>Capacity:</strong> {vehicle.capacity} {vehicle.capacityUnit}</Text>
          <Text><strong>Free Capacity:</strong> {booking.freeCapacity} {vehicle.capacityUnit}</Text>
          <Text><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</Text>
          <Text><strong>Pickup Time:</strong> {booking.pickupTime}</Text>
          <Text><strong>End Time:</strong> {booking.endTime}</Text>
          <Text><strong>Nearby Cities:</strong> {booking.nearbyCities.join(", ")}</Text>
        </Space>
      }
    />
  </Card>
);

VehicleDetailsCard.propTypes = {
    vehicle: PropTypes.shape({
      type: PropTypes.string.isRequired,
      photoUrl: PropTypes.string.isRequired,
      preferredArea: PropTypes.string.isRequired,
      capacity: PropTypes.number.isRequired,
      capacityUnit: PropTypes.string.isRequired,
    }).isRequired,
    booking: PropTypes.shape({
      freeCapacity: PropTypes.number.isRequired,
      bookingDate: PropTypes.string.isRequired,
      pickupTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
      nearbyCities: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
  };
  

export default VehicleDetailsCard;