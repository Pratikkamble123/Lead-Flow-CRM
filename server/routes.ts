import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// JWT Secret from env or fallback for dev
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

// Auth Middleware
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === Auth Routes ===
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists", field: "email" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      
      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({ user: userWithoutPassword, token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.auth.me.path, authMiddleware, async (req: any, res) => {
    const user = await storage.getUser(req.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword });


    app.get("/api/activity", authMiddleware, async (req: any, res) => {
  try {
    const activities = await storage.getActivitiesByUser(req.userId);
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activity" });
  }
});
  });

  // === Dashboard Routes ===
  app.get(api.dashboard.stats.path, authMiddleware, async (req: any, res) => {
    const leads = await storage.getLeads();
    const tasks = await storage.getTasks();
    
    // Filter by user ID in a real app, but here we just show all or filter by user ID manually
    const userLeads = leads.filter(l => l.userId === req.userId);
    const userTasks = tasks.filter(t => t.userId === req.userId);

    const convertedLeads = userLeads.filter(l => l.status === 'Converted').length;
    const pendingLeads = userLeads.filter(l => l.status === 'New' || l.status === 'Contacted').length;

    res.status(200).json({
      totalLeads: userLeads.length,
      convertedLeads,
      pendingLeads,
      totalTasks: userTasks.length
    });
  });

  // === Leads Routes ===
  app.get(api.leads.list.path, authMiddleware, async (req: any, res) => {
    const leads = await storage.getLeads();
    res.status(200).json(leads.filter(l => l.userId === req.userId));
  });

  app.post(api.leads.create.path, authMiddleware, async (req: any, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead({ ...input, userId: req.userId });

      
      // Automation logic
      if (lead.status === 'New') {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 2);
        await storage.createTask({
          userId: req.userId,
          leadId: lead.id,
          title: `Follow up with ${lead.name}`,
          dueDate,
          completed: false
        });
      }

      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.leads.update.path, authMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.leads.update.input.parse(req.body);
      
      const existingLead = await storage.getLead(id);
      if (!existingLead || existingLead.userId !== req.userId) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const updatedLead = await storage.updateLead(id, input);

      // Automation logic: when converted
     if (existingLead.status !== 'Converted' && updatedLead.status === 'Converted') {

  // await storage.createActivity({
  //   userId: req.userId,
  //   message: `Lead "${updatedLead.name}" was converted`,
  //   type: "LEAD_CONVERTED",
  // });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  await storage.createTask({
    userId: req.userId,
    leadId: updatedLead.id,
    title: `Onboarding for ${updatedLead.name}`,
    dueDate,
    completed: false
  });
}

      res.status(200).json(updatedLead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.leads.delete.path, authMiddleware, async (req: any, res) => {
    const id = parseInt(req.params.id);
    const existingLead = await storage.getLead(id);
    if (!existingLead || existingLead.userId !== req.userId) {
      return res.status(404).json({ message: "Lead not found" });
    }
    await storage.deleteLead(id);
    res.status(204).send();
  });

  // === Tasks Routes ===
  app.get(api.tasks.list.path, authMiddleware, async (req: any, res) => {
    const tasks = await storage.getTasks();
    res.status(200).json(tasks.filter(t => t.userId === req.userId));
  });

  app.post(api.tasks.create.path, authMiddleware, async (req: any, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask({ ...input, userId: req.userId });
      await storage.createActivity({
  userId: req.userId,
  message: `New task "${task.title}" was created`,
  type: "TASK_CREATED",
});
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.tasks.update.path, authMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.tasks.update.input.parse(req.body);
      
      const existingTask = await storage.getTask(id);
      if (!existingTask || existingTask.userId !== req.userId) {
        return res.status(404).json({ message: "Task not found" });
      }

      const updatedTask = await storage.updateTask(id, input);
      res.status(200).json(updatedTask);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.tasks.delete.path, authMiddleware, async (req: any, res) => {
    const id = parseInt(req.params.id);
    const existingTask = await storage.getTask(id);
    if (!existingTask || existingTask.userId !== req.userId) {
      return res.status(404).json({ message: "Task not found" });
    }
    await storage.deleteTask(id);
    res.status(204).send();
  });

  // === AI Email Route ===
  app.post(api.ai.generateEmail.path, authMiddleware, async (req: any, res) => {
    try {
      const input = api.ai.generateEmail.input.parse(req.body);
      
      // Simulated AI Response
      const emailBody = `Subject: Following up on our conversation\n\nHi ${input.leadName},\n\nI hope this email finds you well.\n\nI understand you are looking to achieve: ${input.goal}. Since you are in the ${input.businessType} space, our Smart Business Automation System can help you streamline your operations and drive results.\n\nLet me know when you have time for a brief call to discuss this further.\n\nBest regards,\nYour Name`;
      
      res.status(200).json({ emailBody });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Optional Seed Route
  app.post('/api/seed', async (req, res) => {
    const existingLeads = await storage.getLeads();
    if (existingLeads.length === 0) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const demoUser = await storage.createUser({ name: "Demo User", email: "demo@example.com", password: hashedPassword });
      
      const lead1 = await storage.createLead({ userId: demoUser.id, name: "Acme Corp", email: "contact@acme.com", status: "New", source: "Website" });
      const lead2 = await storage.createLead({ userId: demoUser.id, name: "Globex", email: "info@globex.com", status: "Converted", source: "Referral" });
      
      await storage.createTask({ userId: demoUser.id, leadId: lead1.id, title: "Initial Outreach", completed: false });
      await storage.createTask({ userId: demoUser.id, leadId: lead2.id, title: "Send Onboarding Docs", completed: true });
      res.json({ message: "Database seeded!" });
    } else {
      res.json({ message: "Already seeded" });
    }
  });

  return httpServer;
}
