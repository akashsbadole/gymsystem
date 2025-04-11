// Import required modules
import { db, pool } from '../server/db';
import { 
  users, 
  gyms, 
  membershipPlans, 
  staff, 
  members, 
  memberships, 
  payments, 
  notifications 
} from '../shared/schema';
import { eq } from 'drizzle-orm';

// Helper function to generate random date in the past X days
function getRandomDate(days) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return date;
}

// Helper function to get random element from array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random number in range
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedSampleData() {
  try {
    console.log('Seeding sample data...');

    // Get users (we need their IDs)
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    const ownerUser = await db.select().from(users).where(eq(users.username, 'owner')).limit(1);
    
    if (adminUser.length === 0 || ownerUser.length === 0) {
      console.error('Admin or owner user not found. Please run the create-sample-users.js script first.');
      return;
    }

    // 1. Create Gyms
    console.log('Creating sample gyms...');
    const gymData = [
      {
        name: 'Fitness Plus',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipcode: '400001',
        phone: '9876543210',
        email: 'info@fitnessplus.com',
        userId: ownerUser[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'PowerHouse Gym',
        address: '456 Central Avenue',
        city: 'Delhi',
        state: 'Delhi',
        zipcode: '110001',
        phone: '8765432109',
        email: 'contact@powerhousegym.com',
        userId: ownerUser[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Iron Paradise',
        address: '789 Park Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipcode: '560001',
        phone: '7654321098',
        email: 'hello@ironparadise.com',
        userId: adminUser[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const createdGyms = [];
    for (const gym of gymData) {
      // Check if gym already exists
      const existingGym = await db.select().from(gyms).where(eq(gyms.name, gym.name)).limit(1);
      
      if (existingGym.length === 0) {
        const [newGym] = await db.insert(gyms).values(gym).returning();
        createdGyms.push(newGym);
        console.log(`Created gym: ${gym.name}`);
      } else {
        createdGyms.push(existingGym[0]);
        console.log(`Gym ${gym.name} already exists. Skipping.`);
      }
    }

    // 2. Create Membership Plans
    console.log('\nCreating sample membership plans...');
    const planTypes = ['Basic', 'Standard', 'Premium', 'Platinum', 'Monthly', 'Annual'];
    const planDurations = [1, 3, 6, 12]; // in months
    
    for (const gym of createdGyms) {
      const existingPlans = await db.select().from(membershipPlans).where(eq(membershipPlans.gymId, gym.id));
      
      // Only create plans if the gym doesn't have any
      if (existingPlans.length === 0) {
        for (let i = 0; i < 4; i++) {
          const planType = planTypes[i];
          const duration = planDurations[i % planDurations.length];
          const price = (1000 + (i * 500)) * duration;
          
          // Determine plan type based on duration
          let planTypeCategory;
          if (duration === 1) {
            planTypeCategory = 'monthly';
          } else if (duration === 3) {
            planTypeCategory = 'quarterly';
          } else if (duration === 6) {
            planTypeCategory = 'half-yearly';
          } else {
            planTypeCategory = 'annual';
          }
          
          const plan = {
            name: `${planType} ${duration} Month${duration > 1 ? 's' : ''}`,
            description: `${planType} membership for ${duration} month${duration > 1 ? 's' : ''}.`,
            duration: duration,
            price: price,
            type: planTypeCategory,
            gymId: gym.id,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await db.insert(membershipPlans).values(plan);
          console.log(`Created plan: ${plan.name} for ${gym.name}`);
        }
      } else {
        console.log(`Gym ${gym.name} already has membership plans. Skipping.`);
      }
    }

    // 3. Create Staff
    console.log('\nCreating sample staff members...');
    const staffRoles = ['Trainer', 'Receptionist', 'Manager', 'Cleaner', 'Nutritionist'];
    const staffShifts = ['Morning', 'Evening', 'Full-day', 'Weekend'];
    
    for (const gym of createdGyms) {
      const existingStaff = await db.select().from(staff).where(eq(staff.gymId, gym.id));
      
      // Only create staff if the gym doesn't have many
      if (existingStaff.length < 2) {
        // Create 3-5 staff members per gym
        const staffCount = getRandomNumber(3, 5);
        
        for (let i = 0; i < staffCount; i++) {
          const role = getRandomElement(staffRoles);
          const shift = getRandomElement(staffShifts);
          const salary = getRandomNumber(15000, 45000);
          
          const staffMember = {
            name: `Staff ${i + 1} of ${gym.name}`,
            position: role,
            phone: `99${getRandomNumber(10000000, 99999999)}`,
            email: `staff${i + 1}@${gym.name.toLowerCase().replace(/\\s+/g, '')}.com`,
            salary: salary,
            gymId: gym.id,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await db.insert(staff).values(staffMember);
          console.log(`Created staff: ${staffMember.name} (${role})`);
        }
      } else {
        console.log(`Gym ${gym.name} already has staff members. Skipping.`);
      }
    }

    // 4. Create Members
    console.log('\nCreating sample members...');
    const genders = ['Male', 'Female', 'Other'];
    
    for (const gym of createdGyms) {
      const existingMembers = await db.select().from(members).where(eq(members.gymId, gym.id));
      
      // Only create members if the gym doesn't have many
      if (existingMembers.length < 5) {
        // Create 5-10 members per gym (reduced to avoid timeout)
        const memberCount = getRandomNumber(5, 10);
        
        for (let i = 0; i < memberCount; i++) {
          const gender = getRandomElement(genders);
          const age = getRandomNumber(18, 65);
          const active = Math.random() > 0.2; // 80% active members
          
          // Create a date of birth between 18 and 65 years ago
          const currentDate = new Date();
          const yearOfBirth = currentDate.getFullYear() - getRandomNumber(18, 65);
          const monthOfBirth = getRandomNumber(0, 11);
          const dayOfBirth = getRandomNumber(1, 28);
          const dateOfBirth = new Date(yearOfBirth, monthOfBirth, dayOfBirth);
          
          const member = {
            name: `Member ${i + 1} of ${gym.name}`,
            phone: `98${getRandomNumber(10000000, 99999999)}`,
            email: `member${i + 1}@example.com`,
            address: `Member Address ${i + 1}, ${gym.city}`,
            dateOfBirth: dateOfBirth,
            gender: gender,
            emergencyContact: `Emergency Contact for Member ${i + 1}`,
            active: active,
            gymId: gym.id,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const [newMember] = await db.insert(members).values(member).returning();
          console.log(`Created member: ${member.name}`);
          
          // 5. Create Memberships for this member
          const gymPlans = await db.select().from(membershipPlans).where(eq(membershipPlans.gymId, gym.id));
          
          if (gymPlans.length > 0) {
            const membershipCount = getRandomNumber(1, 2); // 1-2 memberships per member (reduced to avoid timeout)
            
            for (let j = 0; j < membershipCount; j++) {
              const plan = getRandomElement(gymPlans);
              const startDate = getRandomDate(365); // in the last year
              
              // Calculate end date based on plan duration
              const endDate = new Date(startDate);
              endDate.setMonth(endDate.getMonth() + plan.duration);
              
              const status = new Date() > endDate ? 'expired' : 'active';
              
              const membership = {
                startDate: startDate,
                endDate: endDate,
                planId: plan.id,
                memberId: newMember.id,
                status: status,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              
              const [newMembership] = await db.insert(memberships).values(membership).returning();
              console.log(`Created membership: ${plan.name} for ${member.name}`);
              
              // 6. Create Payments for this membership
              const paymentDate = new Date(startDate);
              const paymentAmount = plan.price;
              
              const payment = {
                amount: paymentAmount,
                paymentDate: paymentDate,
                paymentMethod: getRandomElement(['Cash', 'Card', 'UPI', 'Bank Transfer']),
                memberId: newMember.id,
                membershipId: newMembership.id,
                reference: `RCPT-${getRandomNumber(10000, 99999)}`,
                status: 'paid',
                createdAt: new Date(),
                updatedAt: new Date()
              };
              
              await db.insert(payments).values(payment);
              console.log(`Created payment: ₹${paymentAmount} for ${member.name}`);
            }
          }
        }
      } else {
        console.log(`Gym ${gym.name} already has members. Skipping.`);
      }
    }

    // 7. Create Notifications
    console.log('\nCreating sample notifications...');
    const notificationTypes = ['membership_expiry', 'payment_reminder', 'new_promotion', 'maintenance_notice', 'staff_update'];
    
    // Create notifications for owner (reduced count to avoid timeout)
    const ownerNotificationsCount = getRandomNumber(3, 5);
    
    for (let i = 0; i < ownerNotificationsCount; i++) {
      const notificationType = getRandomElement(notificationTypes);
      const isRead = Math.random() > 0.5; // 50% read notifications
      
      let title, message;
      
      switch (notificationType) {
        case 'membership_expiry':
          title = 'Membership Expiry Alert';
          message = `You have ${getRandomNumber(5, 20)} memberships expiring in the next week.`;
          break;
        case 'payment_reminder':
          title = 'Payment Collection Reminder';
          message = `${getRandomNumber(3, 10)} payments are due in the next 5 days.`;
          break;
        case 'new_promotion':
          title = 'New Promotion Idea';
          message = 'Consider launching a summer special promotion to attract new members.';
          break;
        case 'maintenance_notice':
          title = 'Scheduled Maintenance';
          message = `${getRandomElement(['Treadmills', 'Weight machines', 'Showers', 'AC units'])} are scheduled for maintenance next week.`;
          break;
        case 'staff_update':
          title = 'Staff Schedule Updated';
          message = 'The staff schedule for next month has been updated.';
          break;
      }
      
      const notification = {
        title: title,
        message: message,
        type: notificationType,
        isRead: isRead,
        userId: ownerUser[0].id,
        createdAt: getRandomDate(30), // in the last month
        updatedAt: new Date()
      };
      
      await db.insert(notifications).values(notification);
    }
    
    console.log(`Created ${ownerNotificationsCount} notifications for owner`);

    // Also create some for admin (reduced count to avoid timeout)
    const adminNotificationsCount = getRandomNumber(2, 4);
    
    for (let i = 0; i < adminNotificationsCount; i++) {
      const notificationType = getRandomElement(notificationTypes);
      const isRead = Math.random() > 0.3; // 70% read notifications
      
      let title, message;
      
      switch (notificationType) {
        case 'membership_expiry':
          title = 'Membership Expiry Alert';
          message = `You have ${getRandomNumber(5, 20)} memberships expiring in the next week.`;
          break;
        case 'payment_reminder':
          title = 'Payment Collection Reminder';
          message = `${getRandomNumber(3, 10)} payments are due in the next 5 days.`;
          break;
        case 'new_promotion':
          title = 'New Promotion Idea';
          message = 'Consider launching a summer special promotion to attract new members.';
          break;
        case 'maintenance_notice':
          title = 'Scheduled Maintenance';
          message = `${getRandomElement(['Treadmills', 'Weight machines', 'Showers', 'AC units'])} are scheduled for maintenance next week.`;
          break;
        case 'staff_update':
          title = 'Staff Schedule Updated';
          message = 'The staff schedule for next month has been updated.';
          break;
      }
      
      const notification = {
        title: title,
        message: message,
        type: notificationType,
        isRead: isRead,
        userId: adminUser[0].id,
        createdAt: getRandomDate(30), // in the last month
        updatedAt: new Date()
      };
      
      await db.insert(notifications).values(notification);
    }
    
    console.log(`Created ${adminNotificationsCount} notifications for admin`);

    console.log('\nSample data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding sample data:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
seedSampleData();