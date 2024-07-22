import React from 'react'
import DriverSideMenu from '../../components/driver/DriverSideMenu/DriverSideMenu'
import AdminHeader from '../../components/admin/AdminHeader/AdminHeader'
import { Outlet } from 'react-router-dom'

const DriverLayoutPage = () => {
  return (
    <div>
    <div className="admin-Header">
      <AdminHeader/>
    </div>
    <div className="driver-body" style={{display:'flex', flexDirection:'row', width:'100%'}}>
      <div className="side-menu">
         <DriverSideMenu/>
      </div>
      <div className="body-content" style={{width:'100%'}}>
          <Outlet/>
      </div>
    </div>
  </div>
  )
}

export default DriverLayoutPage
