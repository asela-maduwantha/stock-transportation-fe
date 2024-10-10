import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Spin, Button, message } from 'antd';
import httpService from '../../../services/httpService';

const BalancePayment = () => {
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, bookingType } = location.state || {};

  useEffect(() => {
    const fetchPaymentSummary = async () => {
      if (!bookingId || !bookingType) {
        message.error('Booking information is missing');
        return;
      }
      try {
        setLoading(true);
        console.log(bookingId, bookingType)
        const response = await httpService.get(`/common/paymentSummery/${bookingId}?type=${bookingType}`);
        setPaymentSummary(response.data);
      } catch (error) {
        console.error('Error fetching payment summary:', error);
        message.error('Failed to fetch payment summary');
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentSummary();

    // Prevent back navigation
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', preventBackNavigation);

    // Prevent page refresh
    window.addEventListener('beforeunload', preventRefresh);

    return () => {
      window.removeEventListener('popstate', preventBackNavigation);
      window.removeEventListener('beforeunload', preventRefresh);
    };
  }, [bookingId, bookingType]);

  const preventBackNavigation = (event) => {
    window.history.pushState(null, document.title, window.location.href);
    event.preventDefault();
    message.warning('Back navigation is disabled on this page.');
  };

  const preventRefresh = (event) => {
    event.preventDefault();
    event.returnValue = '';
  };

  const handleProceedPayment = () => {
    if (paymentSummary) {
      navigate('/customer/proceed-bal-payment', {
        state: {
          bookingId,
          bookingType,
          serviceCharge: paymentSummary.serviceCharge,
          balancePayment: paymentSummary.balPayment
        }
      });
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!paymentSummary) {
    return <div>No payment summary available</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Payment Summary" style={{ maxWidth: 400, margin: '0 auto' }}>
        <p><strong>Vehicle Charge:</strong> ${paymentSummary.vehicleCharge.toFixed(2)}</p>
        <p><strong>Service Charge:</strong> ${paymentSummary.serviceCharge.toFixed(2)}</p>
        <p><strong>Handling Charge:</strong> ${paymentSummary.handlingCharge.toFixed(2)}</p>
        <p><strong>Total:</strong> ${paymentSummary.total.toFixed(2)}</p>
        {paymentSummary.sharedDiscount && (
          <p><strong>Shared Discount:</strong> {paymentSummary.sharedDiscount}</p>
        )}
        <p><strong>Advance Payment:</strong> ${paymentSummary.advancePayment.toFixed(2)}</p>
        <p><strong>Balance Payment:</strong> ${paymentSummary.balPayment.toFixed(2)}</p>
        <Button
          type="primary"
          onClick={handleProceedPayment}
          style={{ width: '100%', marginTop: '16px' }}
        >
          Proceed to Balance Payment
        </Button>
      </Card>
    </div>
  );
};

export default BalancePayment;