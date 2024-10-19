import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  List,
  Button,
  Typography,
  message,
  Spin,
  Modal,
  Divider,
  Tooltip,
} from "antd";
import {
  EnvironmentOutlined,
  CompassOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import httpService from "../../../services/httpService";
import io from "socket.io-client";

const { Title, Text } = Typography;

const BookingNavigation = () => {
  // State declarations
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [coordinates, setCoordinates] = useState();
  const [isSharedBooking, setIsSharedBooking] = useState(false);
  const [rideStarted, setRideStarted] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentLocationAddress, setCurrentLocationAddress] = useState("");

  // States for original booking
  const [originalPickup, setOriginalPickup] = useState(null);
  const [originalDestination, setOriginalDestination] = useState(null);
  const [isLoadingOriginal, setIsLoadingOriginal] = useState(false);
  const [isUnloadingOriginal, setIsUnloadingOriginal] = useState(false);
  const [originalLoadingTimer, setOriginalLoadingTimer] = useState(0);
  const [originalUnloadingTimer, setOriginalUnloadingTimer] = useState(0);

  // States for shared booking
  const [sharedPickup, setSharedPickup] = useState(null);
  const [sharedDestination, setSharedDestination] = useState(null);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [isUnloadingShared, setIsUnloadingShared] = useState(false);
  const [sharedLoadingTimer, setSharedLoadingTimer] = useState(0);
  const [sharedUnloadingTimer, setSharedUnloadingTimer] = useState(0);

  // Current step tracking
  const [currentStep, setCurrentStep] = useState({
    type: 'original',
    stage: 'notStarted'
  });

  // Payment summary state
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState(null);

  // Refs
  const watchPositionId = useRef(null);
  const socketRef = useRef(null);
  const mapRef = useRef(null);

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCZai7VHlL_ERUPIvG3x-ztG6NJugx08Bo",
  });

  // Styles
  const buttonStyle = {
    backgroundColor: "#fdb940",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
    transition: "background-color 0.3s ease, opacity 0.3s ease",
    margin: "0 5px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#d9d9d9",
    color: "#fff",
    cursor: "not-allowed",
    opacity: 0.6,
  };

  // API calls
  const fetchCoordinates = useCallback(async () => {
    if (
      !location.state ||
      !location.state.originalBookingId ||
      !location.state.bookingType
    ) {
      message.error(
        "Booking information is missing. Redirecting to dashboard."
      );
      return;
    }
    localStorage.setItem("bookingId", location.state.originalBookingId);

    try {
      const response = await httpService.get(
        `driver/getCoordinates/${location.state.originalBookingId}`,
        {
          params: { bookingType: location.state.bookingType },
        }
      );
      setCoordinates(response.data);
      setIsSharedBooking(Object.keys(response.data).length === 8);
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      message.error("Failed to fetch booking coordinates. Please try again.");
      setLoading(false);
    }
  }, [location.state]);

  const sendCoordinates = async (location) => {
    try {
      await httpService.post("/driver/sendCoordinates", {
        bookingId: localStorage.getItem("bookingId"),
        longitude: location.lng,
        latitude: location.lat,
      });
    } catch (error) {
      console.error("Error sending coordinates:", error);
    }
  };

  // Location functions
  const requestLocationAccess = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          message.error(
            "Unable to access your location. Please enable location services."
          );
        },
        { enableHighAccuracy: true, timeout: 600000, maximumAge: 0 }
      );
    } else {
      message.error("Geolocation is not supported by your browser.");
    }
  };

  const startLocationTracking = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const initialLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(initialLocation);
          sendCoordinates(initialLocation);

          watchPositionId.current = navigator.geolocation.watchPosition(
            (position) => {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setUserLocation(newLocation);
              sendCoordinates(newLocation);
            },
            (error) => {
              console.error("Error tracking location:", error);
              message.error(
                "Failed to track location. Please check your device settings."
              );
            },
            { enableHighAccuracy: true, timeout: 600000, maximumAge: 0 }
          );
        },
        (error) => {
          console.error("Initial location fetch error:", error);
          message.error(
            "Unable to access your location. Please enable location services."
          );
        }
      );
    }
  };

  const stopLocationTracking = useCallback(() => {
    if (watchPositionId.current) {
      navigator.geolocation.clearWatch(watchPositionId.current);
      watchPositionId.current = null;
    }
  }, []);

  // Navigation functions
  const handleNavigate = useCallback(() => {
    if (!userLocation) {
      Modal.confirm({
        title: "Location Access Required",
        content: "Location access is required for navigation. Allow access?",
        onOk: () => requestLocationAccess(),
        onCancel: () => console.log("Location access denied"),
      });
      return;
    }

    let destination;
    if (isSharedBooking) {
      if (currentStep.type === 'original' && currentStep.stage === 'pickup') {
        destination = originalPickup;
      } else if (currentStep.type === 'shared' && currentStep.stage === 'pickup') {
        destination = sharedPickup;
      } else if (currentStep.type === 'shared' && currentStep.stage === 'destination') {
        destination = sharedDestination;
      } else if (currentStep.type === 'original' && currentStep.stage === 'destination') {
        destination = originalDestination;
      }
    } else {
      if (currentStep.stage === 'pickup') {
        destination = originalPickup;
      } else if (currentStep.stage === 'destination') {
        destination = originalDestination;
      }
    }

    if (destination) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(
            userLocation.lat,
            userLocation.lng
          ),
          destination: new window.google.maps.LatLng(
            destination.lat,
            destination.lng
          ),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            message.error("Failed to fetch directions. Please try again.");
          }
        }
      );
    } else {
      message.info("Navigation completed.");
    }
  }, [
    userLocation,
    isSharedBooking,
    currentStep,
    originalPickup,
    sharedPickup,
    sharedDestination,
    originalDestination,
  ]);

  const openInGoogleMaps = () => {
    let destination;
    if (isSharedBooking) {
      if (currentStep.type === 'original' && currentStep.stage === 'pickup') {
        destination = originalPickup;
      } else if (currentStep.type === 'shared' && currentStep.stage === 'pickup') {
        destination = sharedPickup;
      } else if (currentStep.type === 'shared' && currentStep.stage === 'destination') {
        destination = sharedDestination;
      } else if (currentStep.type === 'original' && currentStep.stage === 'destination') {
        destination = originalDestination;
      }
    } else {
      if (currentStep.stage === 'pickup') {
        destination = originalPickup;
      } else if (currentStep.stage === 'destination') {
        destination = originalDestination;
      }
    }

    if (destination) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
      window.open(url, "_blank");
    } else {
      message.info("Navigation completed.");
    }
  };

  // Ride control functions
  const startRide = async () => {
    if (!userLocation) {
      message.error(
        "Unable to access your location. Please enable location services."
      );
      return;
    }

    const driverId = localStorage.getItem("driverId");
    if (!driverId) {
      message.error("Driver ID not found. Please log in again.");
      return;
    }

    if (
      !location.state ||
      !location.state.originalBookingId ||
      !location.state.bookingType
    ) {
      message.error("Booking information is missing. Please start over.");
      return;
    }

    try {
      const response = await httpService.post("/driver/startRide", {
        id: driverId,
        bookingId: location.state.originalBookingId,
        bookingType: location.state.bookingType,
        longitude: userLocation.lng,
        latitude: userLocation.lat,
      });

      if (response.status === 200) {
        message.success("Ride started successfully!");
        setRideStarted(true);
        startLocationTracking();
        handleNavigate();
        setCurrentStep({ type: 'original', stage: 'pickup' });
      }
    } catch (error) {
      console.error("Error starting ride:", error);
      message.error("Failed to start the ride. Please try again.");
    }
  };

  const stopRideForLocation = useCallback(
    async (location, type) => {
      const driverId = localStorage.getItem("driverId");
      let bookingId = localStorage.getItem("bookingId");

      if (!driverId || !bookingId) {
        message.error(
          "Driver ID or Booking ID not found. Please log in again."
        );
        return;
      }

      try {
        const [bookingType, stage] = type.split('_');
        let currentBookingType = bookingType;
        let currentBookingId = bookingId;
        let rideType = stage;

        if (isSharedBooking && bookingType === 'shared') {
          currentBookingId = localStorage.getItem("sharedBookingId");
        }

        const response = await httpService.put(`/driver/stopRide/${driverId}`, {
          bookingId: currentBookingId,
          bookingType: currentBookingType,
          rideType: rideType,
        });

        if (response.status === 200) {
          message.success(`Ride stopped for ${location.label}`);

          let nextStep;
          if (isSharedBooking) {
            if (bookingType === 'original' && stage === 'pickup') {
              nextStep = { type: 'original', stage: 'loading' };
            } else if (bookingType === 'shared' && stage === 'pickup') {
              nextStep = { type: 'shared', stage: 'loading' };
            } else if (bookingType === 'shared' && stage === 'destination') {
              nextStep = { type: 'shared', stage: 'unloading' };
            } else if (bookingType === 'original' && stage === 'destination') {
              nextStep = { type: 'original', stage: 'unloading' };
            }
          } else {
            if (stage === 'pickup') {
              nextStep = { type: 'original', stage: 'loading' };
            } else if (stage === 'destination') {
              nextStep = { type: 'original', stage: 'unloading' };
            }
          }

          setCurrentStep(nextStep);
        }
      } catch (error) {
        console.error("Error stopping ride:", error);
        message.error("Failed to stop the ride. Please try again.");
      }
    },
    [isSharedBooking]
  );

  // Loading/Unloading functions
  const startLoading = async (stockId) => {
    try {
      await httpService.post(
        `/driver/startLoading/${location.state.originalBookingId}`,
        { stockId }
      );
      if (stockId === "stock1") {
        setIsLoadingOriginal(true);
        setCurrentStep({ type: 'original', stage: 'loading' });
      } else {
        setIsLoadingShared(true);
        setCurrentStep({ type: 'shared', stage: 'loading' });
      }
      message.success(`Loading started for ${stockId}`);
    } catch (error) {
      console.error("Error starting loading:", error);
      message.error("Failed to start loading");
    }
  };

  const stopLoading = async (stockId) => {
    try {
      await httpService.put(
        `/driver/stopLoading/${location.state.originalBookingId}`,
        {
          bookingType:
            isSharedBooking && stockId === "stock2" ? "shared" : "original",
          stockId,
        }
      );
      if (stockId === "stock1") {
        setIsLoadingOriginal(false);
        setCurrentStep(isSharedBooking ? { type: 'shared', stage: 'pickup' } : { type: 'original', stage: 'destination' });
      } else {
        setIsLoadingShared(false);
        setCurrentStep({ type: 'shared', stage: 'destination' });
      }
      message.success(`Loading stopped for ${stockId}`);
      handleNavigate();
    } catch (error) {
      console.error("Error stopping loading:", error);
      message.error("Failed to stop loading");
    }
  };

  const startUnloading = async (stockId) => {
    try {
      await httpService.post(
        `/driver/startUnloading/${location.state.originalBookingId}`,
        { stockId }
      );
      if (stockId === "stock1") {
        setIsUnloadingOriginal(true);
        setCurrentStep({ type: 'original', stage: 'unloading' });
      } else {
        setIsUnloadingShared(true);
        setCurrentStep({ type: 'shared', stage: 'unloading' });
      }
      message.success(`Unloading started for ${stockId}`);
    } catch (error) {
      console.error("Error starting unloading:", error);
      message.error("Failed to start unloading");
    }
  };

  const stopUnloading = async (stockId) => {
    try {
      await httpService.put(
        `/driver/stopUnloading/${location.state.originalBookingId}`,
        {
          bookingType:
            isSharedBooking && stockId === "stock2" ? "shared" : "original",
          stockId,
        }
      );
      if (stockId === "stock1") {
        setIsUnloadingOriginal(false);
        setCurrentStep({ type: 'original', stage: 'completed' });
      } else {
        setIsUnloadingShared(false);
        setCurrentStep({ type: 'original', stage: 'destination' });
      }
      message.success(`Unloading stopped for ${stockId}`);
      fetchPaymentSummary(stockId);
    } catch (error) {
      console.error("Error stopping unloading:", error);
      message.error("Failed to stop unloading");
    }
  };

  // Payment summary function
  const fetchPaymentSummary = async (stockId) => {
    let currentBookingId = localStorage.getItem("bookingId");

    if (isSharedBooking && stockId === "stock2") {
      currentBookingId = localStorage.getItem("sharedBookingId");
    }

    try {
      const bookingType = isSharedBooking && stockId === "stock2" ? "shared" : "original";

      const response = await httpService.get(
        `/common/paymentSummery/${currentBookingId}`,
        {
          params: {
            type: bookingType,
          },
        }
      );

      setPaymentSummary(response.data);
      setShowPaymentSummary(true);
    } catch (error) {
      console.error("Error fetching payment summary:", error);
      message.error("Failed to fetch payment summary");
    }
  };

  // Finish ride
  const finishRide = async () => {
    try {
      setRideStarted(false);
      stopLocationTracking();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      message.success("Ride finished successfully!");
      navigate("/driver/assigned-trips");
    } catch (error) {
      console.error("Error finishing ride:", error);
      message.error("Failed to finish the ride. Please try again.");
    }
  };

  // useEffect hooks
  useEffect(() => {
    const socket = io("https://stocktrans.azurewebsites.net/", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      cors: {
        origin: "*",
      },
    });

    socket.on("connect", () => {
      console.log("WebSocket connected with id:", socket.id);
      setSocketConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      message.error(
        "Failed to establish WebSocket connection. Please try again."
      );
      setSocketConnected(false);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setSocketConnected(false);
    });

    socketRef.current = socket;

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.emit(
        "joinLoadingRoom",
        localStorage.getItem("bookingId")
      );
      socketRef.current.emit(
        "joinUnloadingRoom",
        localStorage.getItem("bookingId")
      );

      socketRef.current.on("timerUpdate", (data) => {
        if (data.loadingTime) {
          if (isLoadingOriginal) {
            console.log(data.loadingTime);
            setOriginalLoadingTimer(data.loadingTime);
          } else {
            setSharedLoadingTimer(data.loadingTime);
          }
        }
        if (data.unloadingTime) {
          if (isUnloadingOriginal) {
            setOriginalUnloadingTimer(data.unloadingTime);
          } else {
            setSharedUnloadingTimer(data.unloadingTime);
          }
        }
      });

      return () => {
        socketRef.current.emit(
          "leaveLoadingRoom",
          localStorage.getItem("bookingId")
        );
        socketRef.current.emit(
          "leaveUnloadingRoom",
          localStorage.getItem("bookingId")
        );
      };
    }
  }, [socketRef, isLoadingOriginal, isUnloadingOriginal]);

  useEffect(() => {
    if (isLoaded) {
      requestLocationAccess();
      fetchCoordinates();
    }
  }, [isLoaded, fetchCoordinates]);

  useEffect(() => {
    if (coordinates && isLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      const getAddress = async (lat, lng) => {
        try {
          const result = await geocoder.geocode({ location: { lat, lng } });
          return result.results[0].formatted_address;
        } catch (error) {
          console.error("Geocoding error:", error);
          return "Address not found";
        }
      };

      const processLocations = async () => {
        if (isSharedBooking) {
          const originalPickupAddress = await getAddress(
            coordinates.firstLat,
            coordinates.firstLong
          );
          const sharedPickupAddress = await getAddress(
            coordinates.thirdLat,
            coordinates.thirdLong
          );
          const sharedDestinationAddress = await getAddress(
            coordinates.fourthLat,
            coordinates.fourthLong
          );
          const originalDestinationAddress = await getAddress(
            coordinates.secondLat,
            coordinates.secondLong
          );

          setOriginalPickup({
            lat: coordinates.firstLat,
            lng: coordinates.firstLong,
            type: "pickup",
            label: "Original Stock Pickup",
            address: originalPickupAddress,
            stockId: "stock1",
          });
          setSharedPickup({
            lat: coordinates.thirdLat,
            lng: coordinates.thirdLong,
            type: "pickup",
            label: "Shared Stock Pickup",
            address: sharedPickupAddress,
            stockId: "stock2",
          });
          setSharedDestination({
            lat: coordinates.fourthLat,
            lng: coordinates.fourthLong,
            type: "destination",
            label: "Shared Stock Destination",
            address: sharedDestinationAddress,
            stockId: "stock2",
          });
          setOriginalDestination({
            lat: coordinates.secondLat,
            lng: coordinates.secondLong,
            type: "destination",
            label: "Original Stock Destination",
            address: originalDestinationAddress,
            stockId: "stock1",
          });
          setLoading(false);
        } else {
          const pickupAddress = await getAddress(
            coordinates.firstLat,
            coordinates.firstLong
          );
          const destinationAddress = await getAddress(
            coordinates.secondLat,
            coordinates.secondLong
          );

          setOriginalPickup({
            lat: coordinates.firstLat,
            lng: coordinates.firstLong,
            type: "pickup",
            label: "Pickup",
            address: pickupAddress,
            stockId: "stock1",
          });
          setOriginalDestination({
            lat: coordinates.secondLat,
            lng: coordinates.secondLong,
            type: "destination",
            label: "Destination",
            address: destinationAddress,
            stockId: "stock1",
          });
          setLoading(false);
        }
      };

      processLocations();
    }
  }, [coordinates, isSharedBooking, isLoaded, fetchCoordinates]);

  useEffect(() => {
    if (isLoaded && userLocation) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: userLocation }, (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            setCurrentLocationAddress(results[0].formatted_address);
          } else {
            setCurrentLocationAddress("Address not found");
          }
        } else {
          console.error("Geocoder failed due to: " + status);
          setCurrentLocationAddress("Unable to retrieve address");
        }
      });
    }
  }, [isLoaded, userLocation]);

  useEffect(() => {
    if (rideStarted) {
      handleNavigate();
    }
  }, [rideStarted, handleNavigate]);

  // Render functions
  const renderLocationItem = (location, type) => {
    const icon =
      location.type === "pickup" ? (
        <EnvironmentOutlined />
      ) : (
        <CompassOutlined />
      );

    const renderActionButtons = () => {
      const getTimer = () => {
        if (location.type === "pickup") {
          return type === "original_pickup"
            ? originalLoadingTimer
            : sharedLoadingTimer;
        } else if (location.type === "destination") {
          return type === "original_destination"
            ? originalUnloadingTimer
            : sharedUnloadingTimer;
        }
        return null;
      };

      const timer = getTimer();

      const [bookingType, stage] = type.split('_');
      const isStopRideEnabled = rideStarted && currentStep.type === bookingType && currentStep.stage === stage;
      const isLoadingEnabled = currentStep.type === bookingType && currentStep.stage === 'loading';
      const isUnloadingEnabled = currentStep.type === bookingType && currentStep.stage === 'unloading';

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Tooltip
            title={!isStopRideEnabled ? "Complete previous steps first" : ""}
          >
            <Button
              onClick={() => stopRideForLocation(location, type)}
              style={
                !isStopRideEnabled
                  ? disabledButtonStyle
                  : { ...buttonStyle, backgroundColor: "#ff4d4f" }
              }
              disabled={!isStopRideEnabled}
            >
              Stop Ride for {location.label}
            </Button>
          </Tooltip>

          {location.type === "pickup" ? (
            <>
              {(
                type === "original_pickup" ? isLoadingOriginal : isLoadingShared
              ) ? (
                <Button
                  onClick={() => stopLoading(location.stockId)}
                  style={{ ...buttonStyle, backgroundColor: "#ff4d4f" }}
                >
                  Stop Loading {timer}
                </Button>
              ) : (
                <Tooltip
                  title={
                    !isLoadingEnabled ? "Stop ride at this location first" : ""
                  }
                >
                  <Button
                    onClick={() => startLoading(location.stockId)}
                    style={
                      !isLoadingEnabled ? disabledButtonStyle : buttonStyle
                    }
                    disabled={!isLoadingEnabled}
                  >
                    Start Loading
                  </Button>
                </Tooltip>
              )}
            </>
          ) : (
            <>
              {(
                type === "original_destination"
                  ? isUnloadingOriginal
                  : isUnloadingShared
              ) ? (
                <Button
                  onClick={() => stopUnloading(location.stockId)}
                  style={{ ...buttonStyle, backgroundColor: "#ff4d4f" }}
                >
                  Stop Unloading {timer}
                </Button>
              ) : (
                <Tooltip
                  title={
                    !isUnloadingEnabled
                      ? "Stop ride at this location first"
                      : ""
                  }
                >
                  <Button
                    onClick={() => startUnloading(location.stockId)}
                    style={
                      !isUnloadingEnabled ? disabledButtonStyle : buttonStyle
                    }
                    disabled={!isUnloadingEnabled}
                  >
                    Start Unloading
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </div>
      );
    };

    const renderTimer = () => {
      const timer =
        location.type === "pickup"
          ? type === "original_pickup"
            ? originalLoadingTimer
            : sharedLoadingTimer
          : type === "original_destination"
          ? originalUnloadingTimer
          : sharedUnloadingTimer;

      if (timer > 0) {
        return (
          <Text style={{ marginLeft: 10 }}>
            <ClockCircleOutlined /> {timer}
          </Text>
        );
      }
    };

    return (
      <List.Item>
        <List.Item.Meta
          avatar={icon}
          title={`${location.label}: ${location.address}`}
          description={`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
        />
        {renderActionButtons()}
        {renderTimer()}
      </List.Item>
    );
  };

  if (loading || !isLoaded || !coordinates) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
        <Text style={{ marginLeft: 10 }}>Loading navigation details...</Text>
      </div>
    );
  }

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  const allLocations = [
    {
      lat: userLocation?.lat,
      lng: userLocation?.lng,
      type: "current",
      label: "Current Location",
      address: currentLocationAddress,
    },
    originalPickup,
    ...(isSharedBooking ? [sharedPickup, sharedDestination] : []),
    originalDestination,
  ].filter(Boolean);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <Card
        title={<Title level={3}>Booking Navigation</Title>}
        style={{
          width: "100%",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: "12px",
        }}
      >
        <Text
          strong
          style={{ fontSize: "18px",marginBottom: "20px", display: "block" }}
        >
          {isSharedBooking ? "Shared Booking" : "Single Booking"}
        </Text>

        <Text
          style={{
            marginBottom: "10px",
            display: "block",
            color: socketConnected ? "green" : "red",
          }}
        >
          {socketConnected ? "Connected" : "Disconnected"}
        </Text>

        <div
          style={{
            height: "400px",
            marginBottom: "20px",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={
              userLocation ||
              (allLocations[1]
                ? { lat: allLocations[1].lat, lng: allLocations[1].lng }
                : { lat: 0, lng: 0 })
            }
            zoom={12}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            {directions && <DirectionsRenderer directions={directions} />}
            {allLocations.map((location, index) =>
              location && location.lat && location.lng ? (
                <Marker
                  key={index}
                  position={{
                    lat: parseFloat(location.lat),
                    lng: parseFloat(location.lng),
                  }}
                  label={location.type === "current" ? "" : `${index}`}
                  icon={{
                    url:
                      location.type === "current"
                        ? "../../../assets/icons/driver_icon.png"
                        : location.type === "pickup"
                        ? "../../../assets/icons/location_icon.png"
                        : "../../../assets/icons/location_icon.png",
                    scaledSize: new window.google.maps.Size(
                      location.type === "current" ? 40 : 30,
                      location.type === "current" ? 40 : 30
                    ),
                  }}
                />
              ) : null
            )}
          </GoogleMap>
        </div>

        <List
          style={{
            marginTop: 16,
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            padding: "16px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
          header={<div>Current Location</div>}
        >
          <List.Item>
            <List.Item.Meta
              avatar={<EnvironmentOutlined style={{ color: "blue" }} />}
              title="Current Location"
              description={currentLocationAddress || "Fetching address..."}
            />
            <Tooltip title={rideStarted ? "Ride has already started" : ""}>
              <Button
                onClick={startRide}
                style={
                  rideStarted
                    ? disabledButtonStyle
                    : { ...buttonStyle, backgroundColor: "#52c41a" }
                }
                disabled={rideStarted}
              >
                Start Ride
              </Button>
            </Tooltip>
          </List.Item>
        </List>

        <List
          style={{
            marginTop: 16,
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            padding: "16px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
          header={<div>Pickup and Destination Locations</div>}
        >
          {renderLocationItem(originalPickup, "original_pickup")}
          {isSharedBooking && renderLocationItem(sharedPickup, "shared_pickup")}
          {isSharedBooking &&
            renderLocationItem(sharedDestination, "shared_destination")}
          {renderLocationItem(originalDestination, "original_destination")}
        </List>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={openInGoogleMaps}
            style={buttonStyle}
            icon={<PlayCircleOutlined />}
          >
            Open in Google Maps
          </Button>
          <Tooltip
            title={
              currentStep.stage !== "completed"
                ? "Complete all steps before finishing the ride"
                : ""
            }
          >
            <Button
              onClick={finishRide}
              style={
                currentStep.stage !== "completed"
                  ? disabledButtonStyle
                  : { ...buttonStyle, backgroundColor: "#ff4d4f" }
              }
              disabled={currentStep.stage !== "completed"}
            >
              Finish Ride
            </Button>
          </Tooltip>
        </div>
      </Card>
      <Modal
        title="Payment Summary"
        visible={showPaymentSummary}
        onOk={() => setShowPaymentSummary(false)}
        onCancel={() => setShowPaymentSummary(false)}
        footer={[
          <Button key="back" onClick={() => setShowPaymentSummary(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {paymentSummary && (
          <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <Title level={4}>Payment Details</Title>
            <Divider />
            <div style={{ marginBottom: "15px" }}>
              <Text strong>Vehicle Charge:</Text>{" "}
              <Text>LKR {paymentSummary.vehicleCharge}</Text>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <Text strong>Service Charge:</Text>{" "}
              <Text>LKR {paymentSummary.serviceCharge}</Text>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <Text strong>Handling Charge:</Text>{" "}
              <Text>LKR {paymentSummary.handlingCharge}</Text>
            </div>
            <Divider />
            <div style={{ marginBottom: "15px" }}>
              <Text strong>Total Amount:</Text>{" "}
              <Text>LKR {paymentSummary.total}</Text>
            </div>
            {paymentSummary.sharedDiscount && (
              <div style={{ marginBottom: "15px" }}>
                <Text strong>Shared Discount:</Text>{" "}
                <Text>{paymentSummary.sharedDiscount}</Text>
              </div>
            )}
            <Divider />
            <div style={{ marginBottom: "15px" }}>
              <Text strong>Advance Payment:</Text>{" "}
              <Text>LKR {paymentSummary.advancePayment}</Text>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <Text strong>Balance Payment:</Text>{" "}
              <Text>LKR {paymentSummary.balPayment}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingNavigation;