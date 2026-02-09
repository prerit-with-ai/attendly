import { relations } from "drizzle-orm";
import { user } from "./auth";
import { company } from "./company";
import { location } from "./location";
import { department } from "./department";
import { employee } from "./employee";
import { camera } from "./camera";
import { attendanceLog } from "./attendance-log";
import { shift } from "./shift";
import { leaveType } from "./leave-type";
import { leave } from "./leave";
import { leaveBalance } from "./leave-balance";
import { notification } from "./notification";

export const companyRelations = relations(company, ({ many }) => ({
  users: many(user),
  locations: many(location),
  departments: many(department),
  employees: many(employee),
  cameras: many(camera),
  attendanceLogs: many(attendanceLog),
  shifts: many(shift),
  leaveTypes: many(leaveType),
  leaves: many(leave),
  notifications: many(notification),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  company: one(company, {
    fields: [user.companyId],
    references: [company.id],
  }),
  notifications: many(notification),
}));

export const locationRelations = relations(location, ({ one, many }) => ({
  company: one(company, {
    fields: [location.companyId],
    references: [company.id],
  }),
  employees: many(employee),
  cameras: many(camera),
  attendanceLogs: many(attendanceLog),
}));

export const departmentRelations = relations(department, ({ one, many }) => ({
  company: one(company, {
    fields: [department.companyId],
    references: [company.id],
  }),
  manager: one(user, {
    fields: [department.managerId],
    references: [user.id],
  }),
  employees: many(employee),
}));

export const employeeRelations = relations(employee, ({ one, many }) => ({
  company: one(company, {
    fields: [employee.companyId],
    references: [company.id],
  }),
  location: one(location, {
    fields: [employee.locationId],
    references: [location.id],
  }),
  department: one(department, {
    fields: [employee.departmentId],
    references: [department.id],
  }),
  shift: one(shift, {
    fields: [employee.shiftId],
    references: [shift.id],
  }),
  attendanceLogs: many(attendanceLog),
  leaves: many(leave),
  leaveBalances: many(leaveBalance),
}));

export const cameraRelations = relations(camera, ({ one, many }) => ({
  company: one(company, {
    fields: [camera.companyId],
    references: [company.id],
  }),
  location: one(location, {
    fields: [camera.locationId],
    references: [location.id],
  }),
  attendanceLogs: many(attendanceLog),
}));

export const attendanceLogRelations = relations(attendanceLog, ({ one }) => ({
  company: one(company, {
    fields: [attendanceLog.companyId],
    references: [company.id],
  }),
  employee: one(employee, {
    fields: [attendanceLog.employeeId],
    references: [employee.id],
  }),
  location: one(location, {
    fields: [attendanceLog.locationId],
    references: [location.id],
  }),
  camera: one(camera, {
    fields: [attendanceLog.cameraId],
    references: [camera.id],
  }),
}));

export const shiftRelations = relations(shift, ({ one, many }) => ({
  company: one(company, {
    fields: [shift.companyId],
    references: [company.id],
  }),
  employees: many(employee),
}));

export const leaveTypeRelations = relations(leaveType, ({ one, many }) => ({
  company: one(company, {
    fields: [leaveType.companyId],
    references: [company.id],
  }),
  leaves: many(leave),
  leaveBalances: many(leaveBalance),
}));

export const leaveRelations = relations(leave, ({ one }) => ({
  company: one(company, {
    fields: [leave.companyId],
    references: [company.id],
  }),
  employee: one(employee, {
    fields: [leave.employeeId],
    references: [employee.id],
  }),
  leaveType: one(leaveType, {
    fields: [leave.leaveTypeId],
    references: [leaveType.id],
  }),
  approver: one(user, {
    fields: [leave.approvedBy],
    references: [user.id],
  }),
}));

export const leaveBalanceRelations = relations(leaveBalance, ({ one }) => ({
  employee: one(employee, {
    fields: [leaveBalance.employeeId],
    references: [employee.id],
  }),
  leaveType: one(leaveType, {
    fields: [leaveBalance.leaveTypeId],
    references: [leaveType.id],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  company: one(company, {
    fields: [notification.companyId],
    references: [company.id],
  }),
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));
