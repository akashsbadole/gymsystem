import { 
  users, type User, type InsertUser,
  gyms, type Gym, type InsertGym,
  staff, type Staff, type InsertStaff,
  membershipPlans, type MembershipPlan, type InsertMembershipPlan,
  members, type Member, type InsertMember,
  memberships, type Membership, type InsertMembership,
  payments, type Payment, type InsertPayment,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, gte, lte, like, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Gym methods
  getGym(id: number): Promise<Gym | undefined>;
  getGymsByUserId(userId: number): Promise<Gym[]>;
  createGym(gym: InsertGym): Promise<Gym>;
  updateGym(id: number, gym: Partial<InsertGym>): Promise<Gym | undefined>;
  deleteGym(id: number): Promise<boolean>;

  // Staff methods
  getStaff(id: number): Promise<Staff | undefined>;
  getStaffByGymId(gymId: number): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<boolean>;

  // MembershipPlan methods
  getMembershipPlan(id: number): Promise<MembershipPlan | undefined>;
  getMembershipPlansByGymId(gymId: number): Promise<MembershipPlan[]>;
  createMembershipPlan(plan: InsertMembershipPlan): Promise<MembershipPlan>;
  updateMembershipPlan(id: number, plan: Partial<InsertMembershipPlan>): Promise<MembershipPlan | undefined>;
  deleteMembershipPlan(id: number): Promise<boolean>;

  // Member methods
  getMember(id: number): Promise<Member | undefined>;
  getMembersByGymId(gymId: number): Promise<Member[]>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: number): Promise<boolean>;

  // Membership methods
  getMembership(id: number): Promise<Membership | undefined>;
  getMembershipsByMemberId(memberId: number): Promise<Membership[]>;
  getMembershipsByGymId(gymId: number): Promise<Membership[]>;
  getExpiringMemberships(gymId: number, days: number): Promise<Membership[]>;
  createMembership(membership: InsertMembership): Promise<Membership>;
  updateMembership(id: number, membership: Partial<InsertMembership>): Promise<Membership | undefined>;
  deleteMembership(id: number): Promise<boolean>;

  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByMemberId(memberId: number): Promise<Payment[]>;
  getPaymentsByGymId(gymId: number): Promise<Payment[]>;
  getRecentPaymentsByGymId(gymId: number, limit: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;

  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUserId(userId: number, limit?: number): Promise<Notification[]>;
  getUnreadNotificationCountByUserId(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, notification: Partial<InsertNotification>): Promise<Notification | undefined>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;

  // Dashboard methods
  getDashboardStats(gymId: number): Promise<{
    totalMembers: number;
    activeMembers: number;
    monthlyRevenue: number;
    expiringThisWeek: number;
  }>;
  
  getMembershipDistribution(gymId: number): Promise<{ type: string; count: number }[]>;
  getRevenueOverview(gymId: number, period: 'monthly' | 'yearly'): Promise<{ period: string; amount: number }[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Gym methods
  async getGym(id: number): Promise<Gym | undefined> {
    const [gym] = await db.select().from(gyms).where(eq(gyms.id, id));
    return gym;
  }

  async getGymsByUserId(userId: number): Promise<Gym[]> {
    return await db.select().from(gyms).where(eq(gyms.userId, userId));
  }

  async createGym(gym: InsertGym): Promise<Gym> {
    const [newGym] = await db
      .insert(gyms)
      .values(gym)
      .returning();
    return newGym;
  }

  async updateGym(id: number, gym: Partial<InsertGym>): Promise<Gym | undefined> {
    const [updatedGym] = await db
      .update(gyms)
      .set({ ...gym, updatedAt: new Date() })
      .where(eq(gyms.id, id))
      .returning();
    return updatedGym;
  }

  async deleteGym(id: number): Promise<boolean> {
    const result = await db.delete(gyms).where(eq(gyms.id, id));
    return true;
  }

  // Staff methods
  async getStaff(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember;
  }

  async getStaffByGymId(gymId: number): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.gymId, gymId));
  }

  async createStaff(staffMember: InsertStaff): Promise<Staff> {
    const [newStaff] = await db
      .insert(staff)
      .values(staffMember)
      .returning();
    return newStaff;
  }

  async updateStaff(id: number, staffData: Partial<InsertStaff>): Promise<Staff | undefined> {
    const [updatedStaff] = await db
      .update(staff)
      .set({ ...staffData, updatedAt: new Date() })
      .where(eq(staff.id, id))
      .returning();
    return updatedStaff;
  }

  async deleteStaff(id: number): Promise<boolean> {
    await db.delete(staff).where(eq(staff.id, id));
    return true;
  }

  // MembershipPlan methods
  async getMembershipPlan(id: number): Promise<MembershipPlan | undefined> {
    const [plan] = await db.select().from(membershipPlans).where(eq(membershipPlans.id, id));
    return plan;
  }

  async getMembershipPlansByGymId(gymId: number): Promise<MembershipPlan[]> {
    return await db.select().from(membershipPlans).where(eq(membershipPlans.gymId, gymId));
  }

  async createMembershipPlan(plan: InsertMembershipPlan): Promise<MembershipPlan> {
    const [newPlan] = await db
      .insert(membershipPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async updateMembershipPlan(id: number, plan: Partial<InsertMembershipPlan>): Promise<MembershipPlan | undefined> {
    const [updatedPlan] = await db
      .update(membershipPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(membershipPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async deleteMembershipPlan(id: number): Promise<boolean> {
    await db.delete(membershipPlans).where(eq(membershipPlans.id, id));
    return true;
  }

  // Member methods
  async getMember(id: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }

  async getMembersByGymId(gymId: number): Promise<Member[]> {
    return await db.select().from(members).where(eq(members.gymId, gymId));
  }

  async createMember(member: InsertMember): Promise<Member> {
    const [newMember] = await db
      .insert(members)
      .values(member)
      .returning();
    return newMember;
  }

  async updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined> {
    const [updatedMember] = await db
      .update(members)
      .set({ ...member, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();
    return updatedMember;
  }

  async deleteMember(id: number): Promise<boolean> {
    await db.delete(members).where(eq(members.id, id));
    return true;
  }

  // Membership methods
  async getMembership(id: number): Promise<Membership | undefined> {
    const [membership] = await db.select().from(memberships).where(eq(memberships.id, id));
    return membership;
  }

  async getMembershipsByMemberId(memberId: number): Promise<Membership[]> {
    return await db.select().from(memberships).where(eq(memberships.memberId, memberId));
  }

  async getMembershipsByGymId(gymId: number): Promise<Membership[]> {
    const result = await db
      .select()
      .from(memberships)
      .innerJoin(members, eq(memberships.memberId, members.id))
      .where(eq(members.gymId, gymId));
    
    return result.map(r => r.memberships);
  }

  async getExpiringMemberships(gymId: number, days: number): Promise<Membership[]> {
    // Calculate the date range for expiring memberships
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);

    const result = await db
      .select()
      .from(memberships)
      .innerJoin(members, eq(memberships.memberId, members.id))
      .where(
        and(
          eq(members.gymId, gymId),
          eq(memberships.status, 'active'),
          gte(memberships.endDate, today),
          lte(memberships.endDate, future)
        )
      );
    
    return result.map(r => r.memberships);
  }

  async createMembership(membership: InsertMembership): Promise<Membership> {
    const [newMembership] = await db
      .insert(memberships)
      .values(membership)
      .returning();
    return newMembership;
  }

  async updateMembership(id: number, membership: Partial<InsertMembership>): Promise<Membership | undefined> {
    const [updatedMembership] = await db
      .update(memberships)
      .set({ ...membership, updatedAt: new Date() })
      .where(eq(memberships.id, id))
      .returning();
    return updatedMembership;
  }

  async deleteMembership(id: number): Promise<boolean> {
    await db.delete(memberships).where(eq(memberships.id, id));
    return true;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByMemberId(memberId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.memberId, memberId)).orderBy(desc(payments.paymentDate));
  }

  async getPaymentsByGymId(gymId: number): Promise<Payment[]> {
    const result = await db
      .select()
      .from(payments)
      .innerJoin(members, eq(payments.memberId, members.id))
      .where(eq(members.gymId, gymId))
      .orderBy(desc(payments.paymentDate));
    
    return result.map(r => r.payments);
  }

  async getRecentPaymentsByGymId(gymId: number, limit: number): Promise<Payment[]> {
    const result = await db
      .select()
      .from(payments)
      .innerJoin(members, eq(payments.memberId, members.id))
      .where(eq(members.gymId, gymId))
      .orderBy(desc(payments.paymentDate))
      .limit(limit);
    
    return result.map(r => r.payments);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ ...payment, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  async deletePayment(id: number): Promise<boolean> {
    await db.delete(payments).where(eq(payments.id, id));
    return true;
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async getNotificationsByUserId(userId: number, limit?: number): Promise<Notification[]> {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async getUnreadNotificationCountByUserId(userId: number): Promise<number> {
    const result = await db
      .select({ count: db.fn.count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    
    return Number(result[0].count);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async updateNotification(id: number, notification: Partial<InsertNotification>): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ ...notification, updatedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    await db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(notifications.id, id));
    return true;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    await db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return true;
  }

  async deleteNotification(id: number): Promise<boolean> {
    await db.delete(notifications).where(eq(notifications.id, id));
    return true;
  }

  // Dashboard methods
  async getDashboardStats(gymId: number): Promise<{
    totalMembers: number;
    activeMembers: number;
    monthlyRevenue: number;
    expiringThisWeek: number;
  }> {
    // Get total members
    const totalMembersResult = await db
      .select({ count: db.fn.count() })
      .from(members)
      .where(eq(members.gymId, gymId));
    
    const totalMembers = Number(totalMembersResult[0].count);
    
    // Get active members
    const activeMembersResult = await db
      .select({ count: db.fn.count() })
      .from(members)
      .where(and(eq(members.gymId, gymId), eq(members.active, true)));
    
    const activeMembers = Number(activeMembersResult[0].count);
    
    // Get monthly revenue
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const monthlyPaymentsResult = await db
      .select({ sum: db.fn.sum(payments.amount) })
      .from(payments)
      .innerJoin(members, eq(payments.memberId, members.id))
      .where(
        and(
          eq(members.gymId, gymId),
          gte(payments.paymentDate, firstDayOfMonth),
          lte(payments.paymentDate, lastDayOfMonth)
        )
      );
    
    const monthlyRevenue = Number(monthlyPaymentsResult[0].sum) || 0;
    
    // Get expiring memberships this week
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const expiringMembershipsResult = await db
      .select({ count: db.fn.count() })
      .from(memberships)
      .innerJoin(members, eq(memberships.memberId, members.id))
      .where(
        and(
          eq(members.gymId, gymId),
          eq(memberships.status, 'active'),
          gte(memberships.endDate, today),
          lte(memberships.endDate, nextWeek)
        )
      );
    
    const expiringThisWeek = Number(expiringMembershipsResult[0].count);
    
    return {
      totalMembers,
      activeMembers,
      monthlyRevenue,
      expiringThisWeek
    };
  }

  async getMembershipDistribution(gymId: number): Promise<{ type: string; count: number }[]> {
    const result = await db
      .select({
        type: membershipPlans.type,
        count: db.fn.count()
      })
      .from(memberships)
      .innerJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
      .innerJoin(members, eq(memberships.memberId, members.id))
      .where(
        and(
          eq(members.gymId, gymId),
          eq(memberships.status, 'active')
        )
      )
      .groupBy(membershipPlans.type);
    
    return result.map(r => ({
      type: r.type,
      count: Number(r.count)
    }));
  }

  async getRevenueOverview(gymId: number, period: 'monthly' | 'yearly'): Promise<{ period: string; amount: number }[]> {
    const today = new Date();
    let results: { period: string; amount: number }[] = [];
    
    if (period === 'monthly') {
      // Get monthly revenue for the past 12 months
      for (let i = 0; i < 12; i++) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const monthlyRevenue = await db
          .select({ sum: db.fn.sum(payments.amount) })
          .from(payments)
          .innerJoin(members, eq(payments.memberId, members.id))
          .where(
            and(
              eq(members.gymId, gymId),
              gte(payments.paymentDate, month),
              lte(payments.paymentDate, endOfMonth)
            )
          );
        
        const amount = Number(monthlyRevenue[0].sum) || 0;
        const monthName = month.toLocaleString('default', { month: 'short' });
        
        results.unshift({ period: monthName, amount });
      }
    } else {
      // Get yearly revenue for the past 5 years
      for (let i = 0; i < 5; i++) {
        const year = today.getFullYear() - i;
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);
        
        const yearlyRevenue = await db
          .select({ sum: db.fn.sum(payments.amount) })
          .from(payments)
          .innerJoin(members, eq(payments.memberId, members.id))
          .where(
            and(
              eq(members.gymId, gymId),
              gte(payments.paymentDate, startOfYear),
              lte(payments.paymentDate, endOfYear)
            )
          );
        
        const amount = Number(yearlyRevenue[0].sum) || 0;
        
        results.unshift({ period: year.toString(), amount });
      }
    }
    
    return results;
  }
}

export const storage = new DatabaseStorage();
