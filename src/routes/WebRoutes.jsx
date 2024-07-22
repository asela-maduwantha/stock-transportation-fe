import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import VehicleOwnerRegistration from '../components/owner/VehicleOwnerRegistration/VehicleOwnerRegistration';
import CustomerRegistration from '../components/customer/CustomerRegistration/CustomerRegistration';
import CustomerSignin from '../components/customer/CustomerSignin/CustomerSignin';
import OwnerSignin from '../components/owner/OwnerSignin/OwnerSignin';
import DriverSignin from '../components/driver/DriverSignin/DriverSignin';
import ApproveOwnerAccounts from '../components/admin/ApproveOwnerAccounts/ApproveOwnerAccounts';
import AdminLayoutPage from '../pages/AdminLayoutPage/AdminLayoutPage';
import OwnerLayoutPage from '../pages/OwnerLayoutPage/OwnerLayoutPage';
import AddDriver from '../components/owner/AddDriver/AddDriver';
import AddVehicle from '../components/owner/AddVehicle/AddVehicle';
import ApproveDriverAccounts from '../components/admin/ApproveDriverAccount/ApproveDriverAccount';
import ApproveVehicle from '../components/admin/AproveVehicle/ApproveVehicle';
import VehicleBooking from '../components/customer/VehicleBooking/VehicleBooking';
import CustomerLayoutPage from '../pages/CustomerLayoutPage/CustomerLayoutPage';
import BookingHistory from '../components/customer/BookingHistory/BookingHistory';
import DriverDetails from '../components/customer/DriverDetails/DriverDetails';
import CostCalculator from '../components/customer/CostCalculator/CostCalculator';
import CustomerDashboard from '../components/customer/CustomerDashboard/CustomerDashboard';
import ProfileSettings from '../components/customer/ProfileSettings/ProfileSettings';
import VehicleDetails from '../components/common/VehicleDetails/VehicleDetails';
import AboutUs from '../components/common/AboutUs/AboutUs';
import VehicleOwnerDashboard from '../components/owner/VehicleOwnerDashboard/VehicleOwnerDashboard';
import Payment from '../components/customer/Payment/Payment';
import OwnerVehicles from '../components/owner/OwnerVehicels/OwnerVehicles';
import PickupStock from '../components/driver/PickupStock/PickupStock';
import Conatct from '../components/common/Contact/Conatct';
import CustomerView from '../components/customer/CustomerView/CustomerView';
import AdminCreate from '../components/admin/AdminCreate/AdminCreate';
import AdminSignin from '../components/admin/AdminSignin/AdminSignin';
import ProtectedRoute from '../services/ProtectedRoute'
import DriverLayoutPage from '../pages/DriverLayoutPage/DriverLayoutPage';
import DriverDashboard from '../components/driver/DriverDashboard/DriverDashboard';

const WebRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />}>
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<Conatct />} />
          <Route path="admin/create" element={<AdminCreate />} />
          <Route path="admin/signin" element={<AdminSignin />} />
          <Route path="vehicle-owner/reg" element={<VehicleOwnerRegistration />} />
          <Route path="customer/reg" element={<CustomerRegistration />} />
          <Route path="customer/signin" element={<CustomerSignin />} />
          <Route path="owner/signin" element={<OwnerSignin />} />
          <Route path="driver/signin" element={<DriverSignin />} />
          <Route path="vehicle/:id" element={<VehicleDetails />} />
          <Route path="payment" element={<Payment />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              component={AdminLayoutPage}
              allowedRoles={['admin']}
            />
          }
        >
          <Route path="owner-requests" element={<ApproveOwnerAccounts />} />
          <Route path="driver-requests" element={<ApproveDriverAccounts />} />
          <Route path="vehicle-requests" element={<ApproveVehicle />} />
        </Route>
        <Route
          path="/driver"
          element={
            <ProtectedRoute
              component={DriverLayoutPage}
              allowedRoles={['driver']}
            />
          }
        >
          <Route path='dashboard' element={<DriverDashboard/>}/>
          <Route path='pickup-stock' element={<PickupStock/>}/>
        </Route>
        <Route
          path="/owner"
          element={
            <ProtectedRoute
              component={OwnerLayoutPage}
              allowedRoles={['owner']}
            />
          }
        >
          <Route path="dashboard" element={<VehicleOwnerDashboard />} />
          <Route path="add-vehicle" element={<AddVehicle />} />
          <Route path="add-driver" element={<AddDriver />} />
          <Route path="vehicles" element={<OwnerVehicles />} />
        </Route>
        <Route
          path="/customer"
          element={
            <ProtectedRoute
              component={CustomerLayoutPage}
              allowedRoles={['customer']}
            />
          }
        >
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="booking" element={<VehicleBooking />} />
          <Route path="booking-history" element={<BookingHistory />} />
          <Route path="drivers" element={<DriverDetails />} />
          <Route path="cost-calculator" element={<CostCalculator />} />
          <Route path="stock-pickup" element={<CustomerView />} />
          <Route path="profile-settings" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default WebRoutes;
