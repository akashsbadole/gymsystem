import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertGymSchema,
  insertMemberSchema,
  insertMembershipSchema,
  insertMembershipPlanSchema,
  insertPaymentSchema,
  insertStaffSchema,
  insertNotificationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Gyms
  app.get("/api/gyms", isAuthenticated, async (req, res, next) => {
    try {
      const gyms = await storage.getGymsByUserId(req.user.id);
      res.json(gyms);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/gyms", isAuthenticated, async (req, res, next) => {
    try {
      const gymValidation = insertGymSchema.safeParse(req.body);
      
      if (!gymValidation.success) {
        const validationError = fromZodError(gymValidation.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const gymData = { ...gymValidation.data, userId: req.user.id };
      const gym = await storage.createGym(gymData);
      res.status(201).json(gym);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/gyms/:id", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.id));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(gym);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/gyms/:id", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.id));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const gymValidation = insertGymSchema.partial().safeParse(req.body);
      
      if (!gymValidation.success) {
        const validationError = fromZodError(gymValidation.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedGym = await storage.updateGym(parseInt(req.params.id), gymValidation.data);
      res.json(updatedGym);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/gyms/:id", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.id));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteGym(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Members
  app.get("/api/gyms/:gymId/members", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.gymId));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const members = await storage.getMembersByGymId(parseInt(req.params.gymId));
      res.json(members);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/gyms/:gymId/members", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.gymId));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const memberValidation = insertMemberSchema.safeParse(req.body);
      
      if (!memberValidation.success) {
        const validationError = fromZodError(memberValidation.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const memberData = { ...memberValidation.data, gymId: parseInt(req.params.gymId) };
      const member = await storage.createMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/members/:id", isAuthenticated, async (req, res, next) => {
    try {
      const member = await storage.getMember(parseInt(req.params.id));
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const gym = await storage.getGym(member.gymId);
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(member);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/members/:id", isAuthenticated, async (req, res, next) => {
    try {
      const member = await storage.getMember(parseInt(req.params.id));
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const gym = await storage.getGym(member.gymId);
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const memberValidation = insertMemberSchema.partial().safeParse(req.body);
      
      if (!memberValidation.success) {
        const validationError = fromZodError(memberValidation.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedMember = await storage.updateMember(parseInt(req.params.id), memberValidation.data);
      res.json(updatedMember);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/members/:id", isAuthenticated, async (req, res, next) => {
    try {
      const member = await storage.getMember(parseInt(req.params.id));
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const gym = await storage.getGym(member.gymId);
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteMember(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Membership Plans
  app.get("/api/gyms/:gymId/plans", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.gymId));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const plans = await storage.getMembershipPlansByGymId(parseInt(req.params.gymId));
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/gyms/:gymId/plans", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.gymId));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const planValidation = insertMembershipPlanSchema.safeParse(req.body);
      
      if (!planValidation.success) {
        const validationError = fromZodError(planValidation.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const planData = { ...planValidation.data, gymId: parseInt(req.params.gymId) };
      const plan = await storage.createMembershipPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      next(error);
    }
  });

  // Memberships
  app.get("/api/gyms/:gymId/memberships", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.gymId));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const memberships = await storage.getMembershipsByGymId(parseInt(req.params.gymId));
      res.json(memberships);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/members/:memberId/memberships", isAuthenticated, async (req, res, next) => {
    try {
      const member = await storage.getMember(parseInt(req.params.memberId));
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const gym = await storage.getGym(member.gymId);
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const membershipValidation = insertMembershipSchema.safeParse(req.body);
      
      if (!membershipValidation.success) {
        const validationError = fromZodError(membershipValidation.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const membershipData = { ...membershipValidation.data, memberId: parseInt(req.params.memberId) };
      const membership = await storage.createMembership(membershipData);
      res.status(201).json(membership);
    } catch (error) {
      next(error);
    }
  });

  // Payments
  app.get("/api/gyms/:gymId/payments", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.gymId));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const payments = await storage.getPaymentsByGymId(parseInt(req.params.gymId));
      res.json(payments);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/members/:memberId/payments", isAuthenticated, async (req, res, next) => {
    try {
      const member = await storage.getMember(parseInt(req.params.memberId));
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const gym = await storage.getGym(member.gymId);
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const paymentValidation = insertPaymentSchema.safeParse(req.body);
      
      if (!paymentValidation.success) {
        const validationError = fromZodError(paymentValidation.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const paymentData = { ...paymentValidation.data, memberId: parseInt(req.params.memberId) };
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  });

  // Staff
  app.get("/api/gyms/:gymId/staff", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.gymId));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const staffMembers = await storage.getStaffByGymId(parseInt(req.params.gymId));
      res.json(staffMembers);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/gyms/:gymId/staff", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.gymId));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const staffValidation = insertStaffSchema.safeParse(req.body);
      
      if (!staffValidation.success) {
        const validationError = fromZodError(staffValidation.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const staffData = { ...staffValidation.data, gymId: parseInt(req.params.gymId) };
      const staffMember = await storage.createStaff(staffData);
      res.status(201).json(staffMember);
    } catch (error) {
      next(error);
    }
  });

  // Notifications
  app.get("/api/notifications", isAuthenticated, async (req, res, next) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.user.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/notifications", isAuthenticated, async (req, res, next) => {
    try {
      const notificationValidation = insertNotificationSchema.safeParse(req.body);
      
      if (!notificationValidation.success) {
        const validationError = fromZodError(notificationValidation.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const notificationData = { ...notificationValidation.data, userId: req.user.id };
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/notifications/:id/read", isAuthenticated, async (req, res, next) => {
    try {
      const notification = await storage.getNotification(parseInt(req.params.id));
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      if (notification.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.markNotificationAsRead(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/notifications/read-all", isAuthenticated, async (req, res, next) => {
    try {
      await storage.markAllNotificationsAsRead(req.user.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Dashboard
  app.get("/api/gyms/:gymId/dashboard", isAuthenticated, async (req, res, next) => {
    try {
      const gym = await storage.getGym(parseInt(req.params.gymId));
      
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      
      if (gym.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const stats = await storage.getDashboardStats(parseInt(req.params.gymId));
      const membershipDistribution = await storage.getMembershipDistribution(parseInt(req.params.gymId));
      const monthlyRevenue = await storage.getRevenueOverview(parseInt(req.params.gymId), 'monthly');
      const recentPayments = await storage.getRecentPaymentsByGymId(parseInt(req.params.gymId), 5);
      const expiring = await storage.getExpiringMemberships(parseInt(req.params.gymId), 7);
      
      res.json({
        stats,
        membershipDistribution,
        monthlyRevenue,
        recentPayments,
        expiring
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
