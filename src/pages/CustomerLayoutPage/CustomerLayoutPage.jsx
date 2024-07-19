import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader/AdminHeader'
import CustomerSidemenu from '../../components/customer/CustomerSidemenu/CustomerSidemenu'


const CustomerLayoutPage = () => {
  return (
    <div>
      <div className="admin-Header">
        <AdminHeader/>
      </div>
      <div className="body" style={{display:'flex', flexDirection:'row', width:'100%'}}>
        <div className="side-menu">
           <CustomerSidemenu/>
        </div>
        <div className="body-content" style={{width:'100%'}}>
            <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default CustomerLayoutPage
