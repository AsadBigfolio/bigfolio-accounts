"use client";
import React, { useEffect, useState } from "react";
import {
    Badge,
    Button,
    Calendar,
    Card,
    message,
    Row,
    Col,
    Typography,
    Space,
    Popover,
    List,
} from "antd";
import type { Dayjs } from "dayjs";
import { getSession } from "next-auth/react";
import { AttendanceByDay, AttendanceRecord, SessionUser } from "@/app/types";
import { useRouter } from "next/navigation";
import {
    CheckCircleOutlined,
    LogoutOutlined,
    CoffeeOutlined,
    ArrowLeftOutlined
} from "@ant-design/icons";
import { trpc } from '@/utils/trpcClient';

interface CalendarCompProps {
    attendanceDetails: AttendanceByDay;
}

const getListData = (value: Dayjs, attendanceDetails: AttendanceByDay) => {
    const userMap: Record<string, { checkInTime: string; checkOutTime: string; breaks: string[] }> = {};

    const dateKey = `${value.date().toString().padStart(2, "0")}-${(value.month() + 1).toString().padStart(2, "0")}-${value.year()}`;

    if (attendanceDetails[dateKey]) {
        attendanceDetails[dateKey].forEach((entry: AttendanceRecord) => {
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

const CalendarComp: React.FC<CalendarCompProps> = ({ attendanceDetails }) => {
    const router = useRouter();
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        getSession().then((session) => {
            const user: SessionUser = session?.user as SessionUser;
            setUserId(user?.id ?? "");
        });
    }, []);

    const checkInMutation = trpc.attendance.checkIn.useMutation({
        onSuccess: (res) => {
            res.attendance ? message.success(res.message) : message.warning(res.message);
            router.refresh();
        },
        onError: () => message.error("Error during check-in"),
    });

    const checkOutMutation = trpc.attendance.checkOut.useMutation({
        onSuccess: (res) => {
            res.attendance ? message.success(res.message) : message.warning(res.message);
            router.refresh();
        },
        onError: () => message.error("Error during check-out"),
    });

    const startBreakMutation = trpc.attendance.startBreak.useMutation({
        onSuccess: (res) => {
            res.attendance ? message.success(res.message) : message.warning(res.message);
            router.refresh();
        },
        onError: () => message.error("Error starting break"),
    });

    const endBreakMutation = trpc.attendance.endBreak.useMutation({
        onSuccess: (res) => {
            res.attendance ? message.success(res.message) : message.warning(res.message);
            router.refresh();
        },
        onError: () => message.error("Error ending break"),
    });

    const dateCellRender = (value: Dayjs) => {
        const userData = getListData(value, attendanceDetails);

        return userData.length > 0 ? (
            <Popover
                content={
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
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Typography.Title level={4}>Track Your Attendance</Typography.Title>
                </Col>
                <Col>
                    <Space>
                        <Button type="primary" loading={checkInMutation.isLoading} icon={<CheckCircleOutlined />} onClick={() => checkInMutation.mutate({ userId })}>
                            Check In
                        </Button>
                        <Button type="default" loading={startBreakMutation.isLoading} icon={<CoffeeOutlined />} onClick={() => startBreakMutation.mutate({ userId })}>
                            Break
                        </Button>
                        <Button type="dashed" loading={endBreakMutation.isLoading} icon={<ArrowLeftOutlined />} onClick={() => endBreakMutation.mutate({ userId })}>
                            Back
                        </Button>
                        <Button type="primary" danger loading={checkOutMutation.isLoading} icon={<LogoutOutlined />} onClick={() => checkOutMutation.mutate({ userId })}>
                            Check Out
                        </Button>
                    </Space>
                </Col>
            </Row>
            <Calendar cellRender={dateCellRender} />
        </Card>
    );
};

export default CalendarComp;
