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
import CostCalculator from '../components/customer/CostCalculator/CostCalculator';
import CustomerDashboard from '../components/customer/CustomerDashboard/CustomerDashboard';
import ProfileSettings from '../components/customer/ProfileSettings/ProfileSettings';
import VehicleDetails from '../components/common/VehicleDetails/VehicleDetails';
import AboutUs from '../components/common/AboutUs/AboutUs';
import VehicleOwnerDashboard from '../components/owner/VehicleOwnerDashboard/VehicleOwnerDashboard';
import Payment from '../components/customer/Payment/Payment';
import OwnerVehicles from '../components/owner/OwnerVehicels/OwnerVehicles';
import PickupStock from '../components/customer/PickupStock/PickupStock';
import Contact from '../components/common/Contact/Conatct';
import AdminCreate from '../components/admin/AdminCreate/AdminCreate';
import AdminSignin from '../components/admin/AdminSignin/AdminSignin';
import ProtectedRoute from '../services/ProtectedRoute';
import DriverLayoutPage from '../pages/DriverLayoutPage/DriverLayoutPage';
import DriverDashboard from '../components/driver/DriverDashboard/DriverDashboard';
import BookingSummary from '../components/customer/BookingSummary/BookingSummary';
import DriverDetails from '../components/owner/DriverDetails/DriverDetails';
import BookingsList from '../components/owner/BookingList/BookingList';
import AssignedTrips from '../components/driver/AssignedTripes/AssignedTrips';
import Vehicles from '../components/driver/Vehicles/Vehicles';
import Help from '../components/driver/Help/Help';
import OwnerForgotPassword from '../components/owner/OwnerForgotPassword/OwnerForgotPassword';
import DriverForgotPassword from '../components/driver/DriverForgotPassword/DriverForgotPassword';
import CustomerForgotPassword from '../components/customer/CustomerForgotPassword/CustomerForgotPassword';
import SharedBookings from '../components/customer/SharedBookings/SharedBookings';
import SharedBookingDetails from '../components/customer/SharedBookingDetails/SharedBookingDetails';
import SharedBookingSummary from '../components/customer/SharedBookingSummary/SharedBookingSummary';
import SharedBookingsHistory from '../components/customer/SharedBookingsHistory/SharedBookingsHistory';
import BookingNavigation from '../components/driver/BookingNavigation/BookingNavigation';
import OwnerPasswordChange from '../components/owner/OwnerPasswordChange/OwnerPasswordChange';
import CustomerPasswordChange from '../components/customer/CustomerPasswordChange/CustomerPasswordChange';
import DriverPasswordChange from '../components/driver/DriverPasswordChange/DriverPasswordChange';
import WalletComponent from '../components/owner/WalletComponent/WalletComponent';
import CreateBankAccount from '../components/owner/CreateBankAccount/CreateBankAccount';
import BalancePayment from '../components/customer/BalancePayment/BalancePayment';
import OwnerProfileUpdate from '../components/owner/OwnerProfileUpdate/OwnerProfileUpdate';
import CustomerProfileUpdate from '../components/customer/CustomerProfileUpdate/CustomerProfileUpdate';
import DriverProfileUpdate from '../components/driver/DriverProfileUpdate/DriverProfileUpdate';
import RewardList from '../components/customer/RewardList/RewardList';
import StripePayment from '../components/customer/StripePayment/StripePayment';
import OwnerRewardList from '../components/owner/OwnerRewardsList/OwnerRewardList';
import AdminPasswordChange from '../components/admin/AdminPasswordChange/AdminPasswordChange';

const WebRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />}>
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="admin/create" element={<AdminCreate />} />
          <Route path="admin/signin" element={<AdminSignin />} />
          <Route path="vehicle-owner/reg" element={<VehicleOwnerRegistration />} />
          <Route path="customer/reg" element={<CustomerRegistration />} />
          <Route path="customer/signin" element={<CustomerSignin />} />
          <Route path="owner/signin" element={<OwnerSignin />} />
          <Route path="driver/signin" element={<DriverSignin />} />
          <Route path="vehicle/:id" element={<VehicleDetails />} />
          <Route path='/owner/forgot-password' element={<OwnerForgotPassword/>}/>
          <Route path='/customer/forgot-password' element={<CustomerForgotPassword/>}/>
          <Route path='/driver/forgot-password' element={<DriverForgotPassword/>}/>
          <Route path="/cost-calculator" element={<CostCalculator />} />
        </Route>
        <Route path="/payment" element={<Payment />} />
        <Route path="/customer/proceed-bal-payment" element={<StripePayment />} />

        <Route
          path="/admin/*"
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
          <Route path="password-change" element={<AdminPasswordChange />} />
        </Route>

        <Route
          path="/driver/*"
          element={
            <ProtectedRoute
              component={DriverLayoutPage}
              allowedRoles={['driver']}
            />
          }
        >
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="pickup-stock" element={<PickupStock />} />
         
      <Route path="assigned-trips" element={<AssignedTrips />} />
      <Route path="vehicles" element={<Vehicles />} />
      <Route path='booking-navigations' element={<BookingNavigation/>}/>
      <Route path='password-change' element={<DriverPasswordChange/>}/>
      <Route path="help" element={<Help />} />
      <Route path="profile-update" element={<DriverProfileUpdate />} />
 
        </Route>

        <Route
          path="/owner/*"
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
          <Route path='drivers' element={<DriverDetails/>}/>
          <Route path='my-bookings' element={<BookingsList/>}/>
          <Route path='password-change' element={<OwnerPasswordChange/>}/>
          <Route path='wallet' element={<WalletComponent/>}/>
          <Route path='create-bank-account' element={<CreateBankAccount/>}/>
          <Route path='profile-update' element={<OwnerProfileUpdate/>}/> 
          <Route path='reward-list' element={<OwnerRewardList/>}/>
          
        </Route>

        <Route
          path="/customer/*"
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
          <Route path="profile-settings" element={<ProfileSettings />} />
          <Route path="booking-summary" element={<BookingSummary />} />
          <Route path="shared-booking" element={<SharedBookings />} />
          <Route path="shared-booking-details" element={<SharedBookingDetails />} />
          <Route path="shared-booking-summary" element={<SharedBookingSummary />} />
          <Route path="shared-booking-history" element={<SharedBookingsHistory />} />
          <Route path='password-change' element={<CustomerPasswordChange/>}/>
          <Route path="pickup-stock" element={<PickupStock />} />
          <Route path="pay-balance" element={<BalancePayment />} />
          <Route path='profile-update' element={<CustomerProfileUpdate/>}/>
          <Route path='reward-list' element={<RewardList/>}/>

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default WebRoutes;