import { relations } from "drizzle-orm";
import { user } from "./auth";
import { company } from "./company";
import { location } from "./location";
import { department } from "./department";
import { employee } from "./employee";
import { camera } from "./camera";
import { attendanceLog } from "./attendance-log";

export const companyRelations = relations(company, ({ many }) => ({
  users: many(user),
  locations: many(location),
  departments: many(department),
  employees: many(employee),
  cameras: many(camera),
  attendanceLogs: many(attendanceLog),
}));

export const userRelations = relations(user, ({ one }) => ({
  company: one(company, {
    fields: [user.companyId],
    references: [company.id],
  }),
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
  attendanceLogs: many(attendanceLog),
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
