import React, { useEffect, useState } from 'react';

const AdminBookingDetails = () => {
  const [bookings, setBookings] = useState([]);

  // Fetch data from the API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('https://stocktrans.azurewebsites.net/admin/bookings', {
          headers: {
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div>
      <h1>Booking Details</h1>
      {bookings.length > 0 ? (
        <div>
          {bookings.map((booking) => (
            <div key={booking.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <p><strong>Booking ID:</strong> {booking.id}</p>
              <p><strong>Booking Type:</strong> {booking.sharedBooking.length > 0 ? 'Shared' : 'Original'}</p>
              <p><strong>Status:</strong> {booking.status}</p>

              {booking.sharedBooking.length > 0 && (
                <div style={{ marginLeft: '20px' }}>
                  <h4>Shared Bookings</h4>
                  {booking.sharedBooking.map((shared) => (
                    <div key={shared.id} style={{ borderTop: '1px dashed #ddd', paddingTop: '10px' }}>
                      <p><strong>Shared Booking ID:</strong> {shared.id}</p>
                      <p><strong>Status:</strong> {shared.status}</p>
                      <p><strong>Travelling Time:</strong> {shared.travellingTime} mins</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Loading bookings...</p>
      )}
    </div>
  );
};

export default AdminBookingDetails;
