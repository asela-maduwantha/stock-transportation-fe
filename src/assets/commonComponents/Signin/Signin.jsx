import React from 'react';
import { MailOutlined , LockOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import './SignIn.css'; 

const SignIn = ({ onSignIn , title}) => {
  const handleSignIn = () => {
    // You can add your sign-in logic here
    onSignIn();
  };

  return (
    <div className="signin-card">
      <div className="signin-form">
        <h1>{title}</h1><br></br>
        <Input
          prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="E-mail"
          size="large"
          style={{marginBottom:'10%'}}
        />
        <Input
         type='password'
          prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="Password"
          size="large"
          style={{marginBottom:'10%'}}
        />
        <Button
          type="primary"
          size="large"
          style={{ backgroundColor: '#fdb940', border: 'none', width:'80%', height:'50px' }}
          onClick={handleSignIn}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default SignIn;
