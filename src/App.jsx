import React from 'react';
import WebRoutes from './routes/WebRoutes';
import GoogleMapsLoader from './services/GoogleMapsLoader';

function App() {
  return (
    <div className="App">
      <GoogleMapsLoader><WebRoutes/></GoogleMapsLoader>
      
    </div>
  );
}

export default App;
