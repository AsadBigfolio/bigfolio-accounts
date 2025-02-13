"use client";
import React, { useState } from "react";
import {
    Badge,
    Button,
    Calendar,
    Card,
    Row,
    Col,
    Typography,
    Popover,
    List,
  Avatar,
  Descriptions,
  Statistic,
} from "antd";
import type { Dayjs } from "dayjs";
import { AttendanceRecord, AttendanceSummary, Employee, ErrorResponse } from "@/app/types";
import EditAttendanceModal from './editAttendanceModal';
import { ArrowDownOutlined, ArrowUpOutlined, RetweetOutlined } from '@ant-design/icons';
import { Pie } from "@ant-design/plots";
interface CalendarCompProps {
  attendanceDetails: AttendanceSummary;
  userData: Employee | ErrorResponse;
}

const getListData = (value: Dayjs, attendanceDetails: AttendanceSummary) => {
    const userMap: Record<string, { checkInTime: string; checkOutTime: string; breaks: string[] }> = {};

    const dateKey = `${value.date().toString().padStart(2, "0")}-${(value.month() + 1).toString().padStart(2, "0")}-${value.year()}`;

  if (attendanceDetails?.attendanceByDay[dateKey]) {
    attendanceDetails?.attendanceByDay[dateKey].forEach((entry: AttendanceRecord) => {
            const userName = entry.userName || "Unknown User";
            const checkInTime = entry.checkInTime
                ? new Date(entry.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "No Check-In";
            const checkOutTime = entry.checkOutTime
                ? new Date(entry.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "No Check-Out";

            if (!userMap[userName]) {
                userMap[userName] = { checkInTime, breaks: [], checkOutTime };
            }

            if (entry.breaks && entry.breaks.length > 0) {
                entry.breaks.forEach((br) => {
                    const breakStart = new Date(br.breakStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const breakEnd = br.breakEnd
                        ? new Date(br.breakEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Ongoing";
                    userMap[userName].breaks.push(`${breakStart} - ${breakEnd}`);
                });
            }
        });
    }

    return Object.entries(userMap).map(([userName, data]) => ({
        userName,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        breaks: data.breaks,
    }));
};

const CalendarComp: React.FC<CalendarCompProps> = ({ attendanceDetails, userData }) => {
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord | null>(null);
  const [attendanceModal, setAttendanceModal] = useState<boolean>(false);

  const onClose = (): void => {
    setAttendanceModal(!attendanceModal);
  };
  const isEmployee = (data: Employee | ErrorResponse): data is Employee => {
    return (data as Employee).email !== undefined;
  };
  const data = [
    { type: "Overtime Days", value: attendanceDetails.overtimeDays },
    { type: "Total Absents", value: attendanceDetails.totalAbsents },
    { type: "Total Present", value: attendanceDetails.totalPresent },
  ];

  const config = {
    data,
    angleField: "value",
    colorField: "type",
    color: ["#1890ff", "#ff4d4f", "#52c41a"],
    radius: 0.9,
    innerRadius: 0.6,
    interactions: [{ type: "element-active" }],
    legend: {
      color: {
        itemMarker: 'circe',
        cols: 3,
        colPadding: 4,
        title: false,
        position: "bottom",
        rowPadding: 25,
      },
    },
  };
    const dateCellRender = (value: Dayjs) => {
        const dateKey = `${value.date().toString().padStart(2, "0")}-${(value.month() + 1).toString().padStart(2, "0")}-${value.year()}`;
      const userData = getListData(value, attendanceDetails);

        return userData.length > 0 ? (
            <Popover
                content={
                    <>
                        <List
                            size="small"
                            dataSource={userData}
                            renderItem={(user) => (
                                <List.Item>
                                    <div>
                                        <Typography.Text strong>{user.userName}</Typography.Text>
                                        <div>
                                            <Badge status="success" text={`Checked in at ${user.checkInTime}`} />
                                        </div>
                                        {user.checkOutTime !== "No Check-Out" && (
                                            <div>
                                                <Badge status="warning" text={`Checked out at ${user.checkOutTime}`} />
                                            </div>
                                        )}
                                        {user.breaks.length > 0 && (
                                            <div>
                                                <Typography.Text type="secondary">Breaks:</Typography.Text>
                                                {user.breaks.map((br, index) => (
                                                    <div key={index}>
                                                        <Badge status="processing" text={br} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </List.Item>
                            )}
                        />
                        <Button size='small' onClick={() => {
                  setAttendanceData(attendanceDetails?.attendanceByDay[dateKey][0]);
                  onClose();
                        }} className='ml-3 mt-2' type='primary'>Change Attendance</Button>
                        <EditAttendanceModal visible={attendanceModal} onClose={onClose} attendance={attendanceData as AttendanceRecord & null} />
                    </>
                }
                title="Attendance Details"
                trigger="click"
            >
                <div style={{ cursor: "pointer" }}>
                    <ul className="events">
                        {userData.map((user, index) => (
                            <li key={index}>
                                <Badge status="success" text={user.userName} />
                            </li>
                        ))}
                    </ul>
                </div>
            </Popover>
        ) : null;
    };

    return (
        <Card title="Attendance Tracker" bordered={false} style={{ borderRadius: 10 }}>
        <Card className="!my-3">
          <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>
            Track Your Attendance
          </Typography.Title>
          <Row gutter={200} justify="center">
            <Col>
              <Statistic title="Overtime Days" prefix={<RetweetOutlined />} value={attendanceDetails.overtimeDays} valueStyle={{ color: "#1890ff" }} />
            </Col>
            <Col>
              <Statistic title="Total Absents" prefix={<ArrowDownOutlined />} value={attendanceDetails.totalAbsents} valueStyle={{ color: "#ff4d4f" }} />
            </Col>
            <Col>
              <Statistic title="Total Present" prefix={<ArrowUpOutlined />} value={attendanceDetails.totalPresent} valueStyle={{ color: "#52c41a" }} />
            </Col>
          </Row>
        </Card>

        {/* Attendance Chart */}
        <Card bordered={false} style={{ borderRadius: 10, marginTop: 20 }}>
          <Typography.Title level={4} style={{ textAlign: "center", marginBottom: 20 }}>
            Attendance Overview
          </Typography.Title>
        </Card>

        <Row gutter={16} style={{ marginTop: 20 }}>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 10, textAlign: "center" }}>
              {isEmployee(userData) && <Avatar size={128} src={userData.profileImage} />}
              {isEmployee(userData) ? (
                <>
                  <Descriptions title="User Info" column={1} size="small">
                    <Descriptions.Item label="Name">{userData.name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
                    <Descriptions.Item label="Personal Email">{userData.personalEmail}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{userData.phone}</Descriptions.Item>
                    <Descriptions.Item label="Designation">{userData.designation}</Descriptions.Item>
                    <Descriptions.Item label="Joining Date">{new Date(userData.joiningDate).toLocaleDateString()}</Descriptions.Item>
                    {userData.leavingDate && <Descriptions.Item label="Leaving Date">{new Date(userData.leavingDate).toLocaleDateString()}</Descriptions.Item>}
                  </Descriptions>
                  <div className='-mt-10'>
                    <Pie {...config} />
                  </div>
                </>
              ) : (
                <Typography.Text type="danger">{userData.message}</Typography.Text>
              )}
            </Card>
          </Col>
          <Col span={18}>
            <Card bordered={false} style={{ borderRadius: 10 }}>
              <Calendar cellRender={dateCellRender} />
            </Card>
          </Col>
        </Row>
      </Card>
    );
};

export default CalendarComp;