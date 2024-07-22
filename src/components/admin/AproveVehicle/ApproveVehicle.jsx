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
      const vehicleId = selectedVehicle.id;
      console.log(vehicleId);
      await httpService.post(`admin/acceptVehicle/${vehicleId}`);
      message.success('Vehicle approved successfully');
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error approving vehicle:', error);
      message.error(`Error approving vehicle: ${error.response?.data || error.message}`);
    }
  };

  const handleReject = async () => {
    try {
      const vehicleId = selectedVehicle.id;
      console.log(vehicleId);
      await httpService.post(`admin/rejectVehicle/${vehicleId}`);
      message.success('Vehicle rejected successfully');
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error rejecting vehicle:', error);
      message.error(`Error rejecting vehicle: ${error.response?.data || error.message}`);
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
      title: 'Driver Name',
      dataIndex: 'driverName',
      key: 'driverName',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Vehicle Type',
      dataIndex: ['vehicles', '0', 'type'],
      key: 'type',
    },
    {
      title: 'Registration Number',
      dataIndex: ['vehicles', '0', 'regNo'],
      key: 'regNo',
    },
    {
      title: 'Preferred Area',
      dataIndex: ['vehicles', '0', 'preferredArea'],
      key: 'preferredArea',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (_, record) => `${record.vehicles[0].capacity} ${record.vehicles[0].capacityUnit}`,
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
            title="Vehicle and Owner Details"
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={800}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions bordered column={1} title="Owner Information">
                  <Descriptions.Item label="Owner Name">{`${selectedVehicle.firstName} ${selectedVehicle.lastName}`}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedVehicle.email}</Descriptions.Item>
                  <Descriptions.Item label="Mobile Number">{selectedVehicle.mobNumber}</Descriptions.Item>
                </Descriptions>
                <Descriptions bordered column={1} title="Vehicle Information" style={{ marginTop: '20px' }}>
                  <Descriptions.Item label="Vehicle Type">{selectedVehicle.vehicles[0].type}</Descriptions.Item>
                  <Descriptions.Item label="Registration Number">{selectedVehicle.vehicles[0].regNo}</Descriptions.Item>
                  <Descriptions.Item label="Preferred Area">{selectedVehicle.vehicles[0].preferredArea}</Descriptions.Item>
                  <Descriptions.Item label="Capacity">{`${selectedVehicle.vehicles[0].capacity} ${selectedVehicle.vehicles[0].capacityUnit}`}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12} style={{ textAlign: 'center' }}>
                <h3>Vehicle Photo</h3>
                <img
                  src={selectedVehicle.vehicles[0].photoUrl}
                  alt="Vehicle"
                  style={{ width: '90%', margin: '10px 0' }}
                />
                <h3>Vehicle Book Photo</h3>
                <img
                  src={selectedVehicle.vehicles[0].vehicleBookUrl}
                  alt="Vehicle Book"
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