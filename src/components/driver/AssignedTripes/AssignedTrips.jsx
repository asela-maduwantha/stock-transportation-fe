import React, { useState } from 'react';
import { Calendar, Card, Badge, Modal, List } from 'antd';

const trips = [
  { id: 1, destination: 'Warehouse A', status: 'Pending', date: '2024-08-20' },
  { id: 2, destination: 'Warehouse B', status: 'In Progress', date: '2024-08-25' },
  { id: 3, destination: 'Warehouse C', status: 'Completed', date: '2024-08-30' },
];

const AssignedTrips = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getListData = (value) => {
    if (!value) return [];
    const dateString = value.format('YYYY-MM-DD');
    return trips.filter((trip) => trip.date === dateString);
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return listData.map((item) => (
      <Badge
        key={item.id}
        status={
          item.status === 'Completed'
            ? 'success'
            : item.status === 'In Progress'
            ? 'processing'
            : 'warning'
        }
        text={item.destination}
      />
    ));
  };

  const onSelect = (value) => {
    setSelectedDate(value);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Card
      title="Assigned Trips"
      style={{
        width: '70%',
        margin: '0 auto',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '10px',
        textAlign: 'center',
      }}
      bodyStyle={{ padding: '10px' }}
    >
      <Calendar
        dateCellRender={dateCellRender}
        onSelect={onSelect}
        fullscreen={false}
        headerRender={({ value, onChange }) => {
          const yearSelect = (
            <select
              value={value.year()}
              onChange={(e) => onChange(value.clone().year(Number(e.target.value)))}
            >
              {[...Array(10)].map((_, i) => (
                <option key={i} value={value.year() - 5 + i}>
                  {value.year() - 5 + i}
                </option>
              ))}
            </select>
          );
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {yearSelect}
            </div>
          );
        }}
        style={{ width: '100%', margin: '0 auto' }}
      />
      <Modal
        title={`Trips on ${selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}`}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        style={{ top: 20 }}
        bodyStyle={{ padding: '10px' }}
        width="20%"
      >
        <List
          dataSource={getListData(selectedDate)}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.destination}
                description={
                  <Badge
                    status={
                      item.status === 'Completed'
                        ? 'success'
                        : item.status === 'In Progress'
                        ? 'processing'
                        : 'warning'
                    }
                    text={item.status}
                  />
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </Card>
  );
};

export default AssignedTrips;
