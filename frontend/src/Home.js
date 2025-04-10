import React, { useEffect, useState } from "react";
import API from "./api";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Card,
  Typography,
  Space,
  message,
} from "antd";

const { Title } = Typography;
const { Option } = Select;

const statusOptions = ["Applied", "Interview", "Offer", "Rejected"];

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [form] = Form.useForm();

  const fetchJobs = async () => {
    try {
      const res = await API.get("/");
      setJobs(res.data);
    } catch (err) {
      message.error("Failed to fetch jobs.");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const res = await API.post("/", {
        ...values,
        appliedDate: values.appliedDate.format("YYYY-MM-DD"),
      });
      setJobs([res.data, ...jobs]);
      form.resetFields();
      message.success("Job added!");
    } catch (err) {
      message.error("Failed to add job.");
    }
  };

  const deleteJob = async (id) => {
    try {
      await API.delete(`/${id}`);
      setJobs(jobs.filter((job) => job._id !== id));
      message.success("Job deleted!");
    } catch {
      message.error("Failed to delete job.");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await API.put(`/${id}`, { status: newStatus });
      setJobs(jobs.map((job) => (job._id === id ? res.data : job)));
      message.success("Status updated!");
    } catch {
      message.error("Failed to update status.");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      <Title level={2}>🎯 Job Application Tracker</Title>

      <Card title="Add New Job" bordered style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="company" label="Company" rules={[{ required: true }]}>
            <Input placeholder="e.g. Google" />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Input placeholder="e.g. Frontend Developer" />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="Applied">
            <Select>
              {statusOptions.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="appliedDate" label="Applied Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="link" label="Job Link">
            <Input placeholder="https://example.com/job-posting" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Job
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {jobs.map((job) => (
        <Card
          key={job._id}
          title={`${job.company} — ${job.role}`}
          style={{ marginBottom: 16 }}
          actions={[
            <Button danger onClick={() => deleteJob(job._id)}>
              Delete
            </Button>,
          ]}
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <strong>Status:</strong>{" "}
              <Select
                value={job.status}
                onChange={(value) => updateStatus(job._id, value)}
              >
                {statusOptions.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <strong>Applied Date:</strong>{" "}
              {new Date(job.appliedDate).toLocaleDateString()}
            </div>
            {job.link && (
              <div>
                <a href={job.link} target="_blank" rel="noreferrer">
                  View Job Posting
                </a>
              </div>
            )}
          </Space>
        </Card>
      ))}
    </div>
  );
};

export default Home;
