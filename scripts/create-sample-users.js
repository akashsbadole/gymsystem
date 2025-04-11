// Import required modules
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { db, pool } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

async function createSampleUsers() {
  try {
    console.log('Creating sample users...');

    // Sample users with different roles
    const sampleUsers = [
      {
        username: 'admin',
        password: 'admin123',  // Will be hashed
        name: 'Admin User',
        email: 'admin@mygymapp.com',
        phone: '9876543210',
        role: 'admin'
      },
      {
        username: 'owner',
        password: 'owner123',  // Will be hashed
        name: 'Gym Owner',
        email: 'owner@mygymapp.com',
        phone: '8765432109',
        role: 'owner'
      },
      {
        username: 'manager',
        password: 'manager123',  // Will be hashed
        name: 'Gym Manager',
        email: 'manager@mygymapp.com',
        phone: '7654321098',
        role: 'manager'
      },
      {
        username: 'staff',
        password: 'staff123',  // Will be hashed
        name: 'Staff Member',
        email: 'staff@mygymapp.com', 
        phone: '6543210987',
        role: 'staff'
      }
    ];

    // Insert users with hashed passwords
    for (const user of sampleUsers) {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.username, user.username));
      
      if (existingUser.length === 0) {
        // Hash the password
        const hashedPassword = await hashPassword(user.password);
        
        // Insert user with hashed password
        await db.insert(users).values({
          ...user,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`Created user: ${user.username} with role: ${user.role}`);
      } else {
        console.log(`User ${user.username} already exists. Skipping.`);
      }
    }

    console.log('Sample users created successfully!');
    console.log('\nSample login credentials:');
    console.log('----------------------------------------');
    console.log('Role\t| Username\t| Password');
    console.log('----------------------------------------');
    console.log('Admin\t| admin\t\t| admin123');
    console.log('Owner\t| owner\t\t| owner123');
    console.log('Manager\t| manager\t| manager123');
    console.log('Staff\t| staff\t\t| staff123');
    console.log('----------------------------------------');
    
  } catch (error) {
    console.error('Error creating sample users:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
createSampleUsers();