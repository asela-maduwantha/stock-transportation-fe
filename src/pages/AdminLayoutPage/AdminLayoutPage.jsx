import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader/AdminHeader'
import AdminSideMenu from '../../components/admin/AdminSideMenu/AdminSideMenu'


const AdminLayoutPage = () => {
  return (
    <div>
      <div className="admin-Header">
        <AdminHeader/>
      </div>
      <div className="body" style={{display:'flex', flexDirection:'row', width:'100%'}}>
        <div className="side-menu">
           <AdminSideMenu/>
        </div>
        <div className="admin-body-content" style={{width:'100%'}}>
            <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default AdminLayoutPage
