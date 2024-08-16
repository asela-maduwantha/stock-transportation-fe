import React from 'react';
import { List, Card, Tag } from 'antd';

const vehicles = [
  { id: 1, name: 'Truck 101', type: 'Heavy' },
  { id: 2, name: 'Van 202', type: 'Light' },
];

const Vehicles = () => {
  return (
    <Card title="Vehicles">
      <List
        itemLayout="horizontal"
        dataSource={vehicles}
        renderItem={(vehicle) => (
          <List.Item>
            <List.Item.Meta
              title={vehicle.name}
              description={<Tag color="blue">{vehicle.type}</Tag>}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Vehicles;
