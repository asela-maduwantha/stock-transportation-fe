import React from 'react'
import { Outlet } from 'react-router-dom'
import DriverHeader from '../../components/driver/DriverHeader/DriverHeader'

const DriverLayoutPage = () => {
  return (
    <div>
    <div className="admin-Header">
      <DriverHeader/>
    </div>
    <div className="driver-body" style={{display:'flex', flexDirection:'row', width:'100%'}}>
      <div className="body-content" style={{width:'100%'}}>
          <Outlet/>
      </div>
    </div>
  </div>
  )
}

export default DriverLayoutPage
