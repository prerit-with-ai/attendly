import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, gte, lte, count, sql as dsql } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

const location = pgTable('location', {
  id: text('id').primaryKey(),
  companyId: text('company_id'),
  name: text('name'),
  isActive: boolean('is_active'),
});
const department = pgTable('department', {
  id: text('id').primaryKey(),
  companyId: text('company_id'),
  name: text('name'),
});
const employee = pgTable('employee', {
  id: text('id').primaryKey(),
  companyId: text('company_id'),
  locationId: text('location_id'),
  departmentId: text('department_id'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  employeeCode: text('employee_code'),
  isActive: boolean('is_active'),
});
const attendanceLog = pgTable('attendance_log', {
  id: text('id').primaryKey(),
  companyId: text('company_id'),
  employeeId: text('employee_id'),
  locationId: text('location_id'),
  type: text('type'),
  capturedAt: timestamp('captured_at'),
  isLate: boolean('is_late'),
  lateMinutes: integer('late_minutes'),
  isEarlyDeparture: boolean('is_early_departure'),
  overtimeMinutes: integer('overtime_minutes'),
});
const leave = pgTable('leave', {
  id: text('id').primaryKey(),
  companyId: text('company_id'),
  employeeId: text('employee_id'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  daysCount: integer('days_count'),
  status: text('status'),
});

const client = postgres('postgresql://neondb_owner:npg_exzTcHWh3I2v@ep-calm-paper-ais7bv5t-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', { prepare: false });
const db = drizzle(client);

const companyId = '7f93daba-cbbd-40ef-9cf8-bade3e49512f';
const now = new Date();
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(now.getDate() - 30);
const dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
const dateTo = now.toISOString().split('T')[0];
const fromDate = new Date(dateFrom);
const toDate = new Date(dateTo);
toDate.setHours(23, 59, 59, 999);

try {
  console.log('Test 1: Daily trend via drizzle...');
  const conditions = [
    eq(attendanceLog.companyId, companyId),
    gte(attendanceLog.capturedAt, fromDate),
    lte(attendanceLog.capturedAt, toDate),
    eq(attendanceLog.type, 'check_in'),
  ];
  const dailyTrend = await db
    .select({
      date: dsql`date_trunc('day', ${attendanceLog.capturedAt})::date::text`,
      checkIns: count(),
      uniqueEmployees: dsql`count(distinct ${attendanceLog.employeeId})`,
    })
    .from(attendanceLog)
    .where(and(...conditions))
    .groupBy(dsql`date_trunc('day', ${attendanceLog.capturedAt})::date`)
    .orderBy(dsql`date_trunc('day', ${attendanceLog.capturedAt})::date`);
  console.log('OK:', dailyTrend.length, 'rows');

  console.log('Test 2: Total employees...');
  const empResult = await db
    .select({ totalEmployees: count() })
    .from(employee)
    .where(and(eq(employee.companyId, companyId), eq(employee.isActive, true)));
  console.log('OK:', empResult);

  console.log('Test 3: On leave...');
  const onLeaveResult = await db
    .select({ onLeave: count() })
    .from(leave)
    .innerJoin(employee, eq(leave.employeeId, employee.id))
    .where(
      and(
        eq(leave.companyId, companyId),
        eq(leave.status, 'approved'),
        lte(dsql`${leave.startDate}::date`, toDate),
        gte(dsql`${leave.endDate}::date`, fromDate)
      )
    );
  console.log('OK:', onLeaveResult);

  console.log('Test 4: Filter options...');
  const [depts, locs, emps] = await Promise.all([
    db.select({ id: department.id, name: department.name }).from(department).where(eq(department.companyId, companyId)),
    db.select({ id: location.id, name: location.name }).from(location).where(and(eq(location.companyId, companyId), eq(location.isActive, true))),
    db.select({
      id: employee.id,
      name: dsql`${employee.firstName} || ' ' || ${employee.lastName}`,
      code: employee.employeeCode,
    }).from(employee).where(and(eq(employee.companyId, companyId), eq(employee.isActive, true))),
  ]);
  console.log('Depts:', depts.length, 'Locs:', locs.length, 'Emps:', emps.length);

  console.log('\nAll drizzle queries passed!');
} catch(e) {
  console.error('FAILED:', e.message);
  console.error(e.stack);
} finally {
  await client.end();
}
