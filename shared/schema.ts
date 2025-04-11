import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("owner"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
  role: true,
});

export const gyms = pgTable("gyms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipcode: text("zipcode").notNull(),
  phone: text("phone"),
  email: text("email"),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGymSchema = createInsertSchema(gyms).pick({
  name: true,
  address: true,
  city: true,
  state: true,
  zipcode: true,
  phone: true,
  email: true,
  userId: true,
});

export const gymsRelations = relations(gyms, ({ one, many }) => ({
  user: one(users, {
    fields: [gyms.userId],
    references: [users.id],
  }),
  staff: many(staff),
  members: many(members),
  membershipPlans: many(membershipPlans),
}));

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  position: text("position").notNull(),
  salary: doublePrecision("salary"),
  gymId: integer("gym_id").notNull().references(() => gyms.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStaffSchema = createInsertSchema(staff).pick({
  name: true,
  email: true,
  phone: true,
  position: true,
  salary: true,
  gymId: true,
});

export const staffRelations = relations(staff, ({ one }) => ({
  gym: one(gyms, {
    fields: [staff.gymId],
    references: [gyms.id],
  }),
}));

export const membershipPlans = pgTable("membership_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in months
  price: doublePrecision("price").notNull(),
  type: text("type").notNull(), // monthly, quarterly, annual
  gymId: integer("gym_id").notNull().references(() => gyms.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMembershipPlanSchema = createInsertSchema(membershipPlans).pick({
  name: true,
  description: true,
  duration: true,
  price: true,
  type: true,
  gymId: true,
});

export const membershipPlansRelations = relations(membershipPlans, ({ one, many }) => ({
  gym: one(gyms, {
    fields: [membershipPlans.gymId],
    references: [gyms.id],
  }),
  memberships: many(memberships),
}));

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  emergencyContact: text("emergency_contact"),
  gymId: integer("gym_id").notNull().references(() => gyms.id),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMemberSchema = createInsertSchema(members).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  dateOfBirth: true,
  gender: true,
  emergencyContact: true,
  gymId: true,
  active: true,
});

export const membersRelations = relations(members, ({ one, many }) => ({
  gym: one(gyms, {
    fields: [members.gymId],
    references: [gyms.id],
  }),
  memberships: many(memberships),
  payments: many(payments),
}));

export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  planId: integer("plan_id").notNull().references(() => membershipPlans.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("active"), // active, expired, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMembershipSchema = createInsertSchema(memberships).pick({
  memberId: true,
  planId: true,
  startDate: true,
  endDate: true,
  status: true,
});

export const membershipsRelations = relations(memberships, ({ one, many }) => ({
  member: one(members, {
    fields: [memberships.memberId],
    references: [members.id],
  }),
  plan: one(membershipPlans, {
    fields: [memberships.planId],
    references: [membershipPlans.id],
  }),
  payments: many(payments),
}));

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  membershipId: integer("membership_id").references(() => memberships.id),
  amount: doublePrecision("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  paymentMethod: text("payment_method").notNull(),
  reference: text("reference"),
  status: text("status").notNull().default("paid"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  memberId: true,
  membershipId: true,
  amount: true,
  paymentDate: true,
  paymentMethod: true,
  reference: true,
  status: true,
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  member: one(members, {
    fields: [payments.memberId],
    references: [members.id],
  }),
  membership: one(memberships, {
    fields: [payments.membershipId],
    references: [memberships.id],
  }),
}));

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // payment, membership, general
  userId: integer("user_id").notNull().references(() => users.id),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  title: true,
  message: true,
  type: true,
  userId: true,
  isRead: true,
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Gym = typeof gyms.$inferSelect;
export type InsertGym = z.infer<typeof insertGymSchema>;

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export type MembershipPlan = typeof membershipPlans.$inferSelect;
export type InsertMembershipPlan = z.infer<typeof insertMembershipPlanSchema>;

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;

export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
