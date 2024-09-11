import React from 'react'
import { Outlet } from 'react-router-dom'
import OwnerHeader from '../../components/owner/OwnerHeader/OwnerHeader'

const OwnerLayoutPage = () => {
  return (
    <div>
        <div className="admin-Header">
        <OwnerHeader/>
      </div>
      <div className="owner-body" style={{display:'flex', flexDirection:'row', width:'100%'}}>
        
        <div className="body-content" style={{width:'100%'}}>
            <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default OwnerLayoutPage
