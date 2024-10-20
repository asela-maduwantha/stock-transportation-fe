import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Descriptions, message, Row, Col } from 'antd';
import httpService from '../../../services/httpService';

const ApproveOwnerAccounts = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await httpService.get('/admin/getTempOwners');
      setData(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        message.warning('No request available');
      } else {
        console.error('Error fetching data:', error);
        message.error('Error fetching owners');
      }
    }
  };

  const handleViewMore = (record) => {
    setSelectedOwner(record);
    setIsModalVisible(true);
  };

  const handleApprove = async () => {
    try {
      await httpService.post(`/admin/acceptOwner/${selectedOwner.id}`);
      message.success('Owner approved successfully');
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error approving owner:', error);
      message.error('Error approving owner');
    }
  };

  const handleReject = async () => {
    try {
      await httpService.delete(`/admin/rejectOwner/${selectedOwner.id}`);
      message.success('Owner rejected successfully');
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error rejecting owner:', error);
      message.error('Error rejecting owner');
    }
  };

  const columns = [
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
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
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
        <h1>Vehicle Owner Requests</h1><br />
        <Table columns={columns} dataSource={data} rowKey="id" />
        {selectedOwner && (
          <Modal
            title="Owner Details"
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={800}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="First Name">{selectedOwner.firstName}</Descriptions.Item>
                  <Descriptions.Item label="Last Name">{selectedOwner.lastName}</Descriptions.Item>
                  <Descriptions.Item label="NIC">{selectedOwner.nic}</Descriptions.Item>
                  <Descriptions.Item label="Mobile Number">{selectedOwner.mobNumber}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedOwner.email}</Descriptions.Item>
                  <Descriptions.Item label="Address">{selectedOwner.address}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12} style={{ textAlign: 'center' }}>
                <img
                  src={selectedOwner.gsCertiUrl}
                  alt="Certificate"
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

export default ApproveOwnerAccounts;
