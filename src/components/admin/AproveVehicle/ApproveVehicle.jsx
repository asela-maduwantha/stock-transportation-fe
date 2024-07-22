import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Descriptions, message, Row, Col, Select } from 'antd';
import httpService from '../../../services/httpService';

const { Option } = Select;

const ApproveVehicle = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);

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
    setSelectedOwner(record);
    setSelectedVehicleIndex(0);
    setIsModalVisible(true);
  };

  const handleApprove = async () => {
    try {
      const vehicleId = selectedOwner.vehicles[selectedVehicleIndex].id;
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
      const vehicleId = selectedOwner.vehicles[selectedVehicleIndex].id;
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
      title: 'Number of Vehicles',
      dataIndex: 'vehicles',
      key: 'vehicleCount',
      render: (vehicles) => vehicles.length,
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
        {selectedOwner && (
          <Modal
            title="Vehicle and Owner Details"
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={800}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Descriptions bordered column={1} title="Owner Information">
                  <Descriptions.Item label="Owner Name">{`${selectedOwner.firstName} ${selectedOwner.lastName}`}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedOwner.email}</Descriptions.Item>
                  <Descriptions.Item label="Mobile Number">{selectedOwner.mobNumber}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '20px' }}>
              <Col span={24}>
                <Select
                  style={{ width: '100%' }}
                  value={selectedVehicleIndex}
                  onChange={(value) => setSelectedVehicleIndex(value)}
                >
                  {selectedOwner.vehicles.map((vehicle, index) => (
                    <Option key={index} value={index}>
                      Vehicle {index + 1} - {vehicle.type} ({vehicle.regNo})
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '20px' }}>
              <Col span={12}>
                <Descriptions bordered column={1} title="Vehicle Information">
                  <Descriptions.Item label="Vehicle Type">{selectedOwner.vehicles[selectedVehicleIndex].type}</Descriptions.Item>
                  <Descriptions.Item label="Registration Number">{selectedOwner.vehicles[selectedVehicleIndex].regNo}</Descriptions.Item>
                  <Descriptions.Item label="Preferred Area">{selectedOwner.vehicles[selectedVehicleIndex].preferredArea}</Descriptions.Item>
                  <Descriptions.Item label="Capacity">{`${selectedOwner.vehicles[selectedVehicleIndex].capacity} ${selectedOwner.vehicles[selectedVehicleIndex].capacityUnit}`}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12} style={{ textAlign: 'center' }}>
                <h3>Vehicle Photo</h3>
                <img
                  src={selectedOwner.vehicles[selectedVehicleIndex].photoUrl}
                  alt="Vehicle"
                  style={{ width: '90%', margin: '10px 0' }}
                />
                <h3>Vehicle Book Photo</h3>
                <img
                  src={selectedOwner.vehicles[selectedVehicleIndex].vehicleBookUrl}
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