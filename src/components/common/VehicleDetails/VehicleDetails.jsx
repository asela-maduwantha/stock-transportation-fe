import React from 'react';
import { useParams } from 'react-router-dom';

// Sample vehicle data (you can replace this with actual data fetching logic)
const vehicles = [
  { id: 1, name: 'Freezer Truck XL', type: 'Freezer', capacity: '10000 kg', pricePerKm: '$3.50' },
  { id: 6, name: 'Freezer Truck XL', type: 'Freezer', capacity: '10000 kg', pricePerKm: '$3.50' },
  { id: 2, name: 'Cargo Van 2000', type: 'Van', capacity: '2000 kg', pricePerKm: '$2.00' },
  { id: 3, name: 'Container Carrier Max', type: 'Container', capacity: '20000 kg', pricePerKm: '$4.50' },
  { id: 4, name: 'City Lorry 5000', type: 'Lorry', capacity: '5000 kg', pricePerKm: '$2.75' },
  { id: 5, name: 'Refrigerated Van', type: 'Freezer', capacity: '3000 kg', pricePerKm: '$3.00' },
];

const VehicleDetails = () => {
  const { id } = useParams();
  const vehicle = vehicles.find(v => v.id === parseInt(id));

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  return (
    <div>
      <h1>{vehicle.name}</h1>
      <p>Type: {vehicle.type}</p>
      <p>Capacity: {vehicle.capacity}</p>
      <p>Price per km: {vehicle.pricePerKm}</p>
    </div>
  );
}

export default VehicleDetails;
