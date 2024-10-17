import React, { useState, useEffect } from 'react';
import { Layout, Table, Tag, Button, message, Tabs, Typography, Spin } from 'antd';
import { CheckCircleOutlined,  DeleteOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const primaryColor = '#fdb940';

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await httpService.get('/admin/feedbacks');
      setFeedbacks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      message.error('Failed to fetch feedbacks');
      setLoading(false);
    }
  };

  const handleApproveFeedback = async (id) => {
    try {
      await httpService.put(`/admin/approveFeedback/${id}`);
      message.success('Feedback approved successfully');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error approving feedback:', error);
      message.error('Failed to approve feedback');
    }
  };

  const handleDeleteFeedback = async (id) => {
    try {
      await httpService.delete(`/admin/deleteFeedback/${id}`);
      message.success('Feedback deleted successfully');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      message.error('Failed to delete feedback');
    }
  };

  const columns = [
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Feedback',
      dataIndex: 'feedback',
      key: 'feedback',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Status',
      key: 'isApproved',
      dataIndex: 'isApproved',
      render: (isApproved) => (
        <Tag color={isApproved ? 'green' : 'volcano'}>
          {isApproved ? 'Approved' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          {!record.isApproved && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApproveFeedback(record.id)}
              style={{ marginRight: '8px', backgroundColor: primaryColor, borderColor: primaryColor }}
            >
              Approve
            </Button>
          )}
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteFeedback(record.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const pendingFeedbacks = feedbacks.filter(feedback => !feedback.isApproved);
  const approvedFeedbacks = feedbacks.filter(feedback => feedback.isApproved);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{ color: primaryColor, marginBottom: '24px' }}>Admin Feedback Dashboard</Title>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Tabs defaultActiveKey="1">
            <TabPane tab="All Feedbacks" key="1">
              <Table columns={columns} dataSource={feedbacks} rowKey="id" />
            </TabPane>
            <TabPane tab={`Pending Feedbacks (${pendingFeedbacks.length})`} key="2">
              <Table columns={columns} dataSource={pendingFeedbacks} rowKey="id" />
            </TabPane>
            <TabPane tab={`Approved Feedbacks (${approvedFeedbacks.length})`} key="3">
              <Table columns={columns} dataSource={approvedFeedbacks} rowKey="id" />
            </TabPane>
          </Tabs>
        )}
      </Content>
    </Layout>
  );
};

export default AdminFeedback;