import React from 'react'
import OwnerSideMenu from '../../components/owner/OwnerSideMenu/OwnerSideMenu'
import { Outlet } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader/AdminHeader'

const OwnerLayoutPage = () => {
  return (
    <div>
        <div className="admin-Header">
        <AdminHeader/>
      </div>
      <div className="owner-body" style={{display:'flex', flexDirection:'row', width:'100%'}}>
        <div className="side-menu">
            <OwnerSideMenu/>
        </div>
        <div className="body-content" style={{width:'100%'}}>
            <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default OwnerLayoutPage
