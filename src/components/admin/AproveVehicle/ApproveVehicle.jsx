// ApproveVehicleAccounts.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Descriptions, message, Row, Col } from 'antd';
import httpService from '../../../services/httpService';

const ApproveVehicle = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await httpService.get('admin/getTempVehicles');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Error fetching vehicles');
    }
  };

  const handleViewMore = (record) => {
    setSelectedVehicle(record);
    setIsModalVisible(true);
  };

  const handleApprove = async () => {
    try {
      await httpService.post(`admin/acceptVehicle/${selectedVehicle.id}`);
      message.success('Vehicle approved successfully');
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Error approving vehicle');
      console.error('Error approving vehicle:', error);
    }
  };

  const handleReject = async () => {
    try {
      await httpService.post(`admin/rejectVehicle/${selectedVehicle.id}`);
      message.success('Vehicle rejected successfully');
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Error rejecting vehicle');
      console.error('Error rejecting vehicle:', error);
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
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Make',
      dataIndex: 'make',
      key: 'make',
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'License Plate',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
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
        <h1>Vehicle Requests</h1><br />
        <Table columns={columns} dataSource={data} rowKey="id" />
        {selectedVehicle && (
          <Modal
            title="Vehicle Details"
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={800}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Model">{selectedVehicle.model}</Descriptions.Item>
                  <Descriptions.Item label="Make">{selectedVehicle.make}</Descriptions.Item>
                  <Descriptions.Item label="Year">{selectedVehicle.year}</Descriptions.Item>
                  <Descriptions.Item label="License Plate">{selectedVehicle.licensePlate}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12} style={{ textAlign: 'center' }}>
                <img
                  src={selectedVehicle.imageUrl}
                  alt="Vehicle"
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

export default ApproveVehicle;
