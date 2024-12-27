import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    checkInTime: Date;
    checkOutTime?: Date;
    date: Date;
}

const AttendanceSchema: Schema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date },
    date: { type: Date, required: true },
});

const Attendance =
    mongoose.models?.Attendance ||
    mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;