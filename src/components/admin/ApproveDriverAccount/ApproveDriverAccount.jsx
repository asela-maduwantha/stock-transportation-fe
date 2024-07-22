import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Descriptions, message, Row, Col } from 'antd';
import httpService from '../../../services/httpService';

const ApproveDriverAccounts = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await httpService.get('/admin/getTempDrivers');
      const drivers = response.data.flatMap(owner =>
        owner.drivers.map(driver => ({ ...driver, owner }))
      );
      setData(drivers);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Error fetching drivers');
    }
  };

  const handleViewMore = (record) => {
    setSelectedDriver(record);
    setIsModalVisible(true);
  };

  const handleApprove = async () => {
    try {
      await httpService.post(`/admin/acceptDriver/${selectedDriver.id}`);
      message.success('Driver approved successfully');
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Error approving driver');
      console.error('Error approving driver:', error);
    }
  };

  const handleReject = async () => {
    try {
      await httpService.post(`/admin/rejectDriver/${selectedDriver.id}`);
      message.success('Driver rejected successfully');
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Error rejecting driver');
      console.error('Error rejecting driver:', error);
    }
  };

  const driverColumns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Address',
      dataIndex: 'addres',
      key: 'address',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button
          type="primary"
          style={{ backgroundColor: 'rgb(253, 185, 64)', borderColor: 'rgb(253, 185, 64)' }}
          onClick={() => handleViewMore(record)}
        >
          View More
        </Button>
      ),
    },
  ];

  return (
    <center>
      <div style={{ paddingTop: '2%', width: '100%', paddingLeft: '2%' }}>
        <h1>Driver Requests</h1><br />
        <Table columns={driverColumns} dataSource={data} rowKey="id" />
        {selectedDriver && (
          <Modal
            title="Driver Details"
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={800}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="First Name">{selectedDriver.firstName}</Descriptions.Item>
                  <Descriptions.Item label="Last Name">{selectedDriver.lastName}</Descriptions.Item>
                  <Descriptions.Item label="Phone Number">{selectedDriver.phoneNumber}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedDriver.email}</Descriptions.Item>
                  <Descriptions.Item label="Address">{selectedDriver.addres}</Descriptions.Item>
                  <Descriptions.Item label="Owner First Name">{selectedDriver.owner.firstName}</Descriptions.Item>
                  <Descriptions.Item label="Owner Last Name">{selectedDriver.owner.lastName}</Descriptions.Item>
                  <Descriptions.Item label="Owner Mobile Number">{selectedDriver.owner.mobNumber}</Descriptions.Item>
                  <Descriptions.Item label="Owner Email">{selectedDriver.owner.email}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12} style={{ textAlign: 'center' }}>
                <img
                  src={selectedDriver.policeCertiUrl}
                  alt="Police Certificate"
                  style={{ width: '90%', margin: '10px 0' }}
                />
                <img
                  src={selectedDriver.licenseUrl}
                  alt="License"
                  style={{ width: '90%', margin: '10px 0' }}
                />
              </Col>
            </Row>
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <Button type="primary" style={{ marginRight: '10px' }} onClick={handleApprove}>
                Approve
              </Button>
              <Button type="danger" onClick={handleReject}>
                Reject
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </center>
  );
};

export default ApproveDriverAccounts;
