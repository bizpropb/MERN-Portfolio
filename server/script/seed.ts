/**
 * @file Database Seeding Script
 * @module script/seed
 * @description Script to populate the database with initial data for development and testing.
 * Handles user confirmation before dropping existing data and provides a summary of changes.
 */

import dotenv from 'dotenv';
import readline from 'readline';
import { connectDB } from '../config/database';
import User from '../models/User';
import Project from '../models/Project';
import Skill from '../models/Skill';

dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Promisified version of readline.question for async/await usage
 * @param {string} query - The question to prompt the user with
 * @returns {Promise<string>} User's input as a string
 */
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

/**
 * Seed data for populating the database
 * Contains sample users, skills, and projects with realistic data
 */
const seedData = {
  users: [
    {
      email: 'demo@devhub.com',
      password: 'password123',
      firstName: 'Demo',
      lastName: 'User',
      bio: 'Full-stack developer passionate about building amazing web applications. I love learning new technologies and solving complex problems.',
      role: 'user',
      isVerified: true
    }
  ],
  
  skills: [
    { name: 'React', category: 'frontend', proficiencyLevel: 5, yearsOfExperience: 4, description: 'Expert in React ecosystem including hooks, context, and performance optimization' },
    { name: 'TypeScript', category: 'frontend', proficiencyLevel: 4, yearsOfExperience: 3, description: 'Strong typing and advanced TypeScript patterns' },
    { name: 'Next.js', category: 'frontend', proficiencyLevel: 4, yearsOfExperience: 2, description: 'Server-side rendering and static generation' },
    { name: 'Tailwind CSS', category: 'frontend', proficiencyLevel: 5, yearsOfExperience: 3, description: 'Utility-first CSS framework mastery' },
    { name: 'JavaScript', category: 'frontend', proficiencyLevel: 5, yearsOfExperience: 6, description: 'ES6+, async/await, closures, and modern JS patterns' },
    { name: 'Node.js', category: 'backend', proficiencyLevel: 5, yearsOfExperience: 4, description: 'Server-side JavaScript and API development' },
    { name: 'Express.js', category: 'backend', proficiencyLevel: 5, yearsOfExperience: 4, description: 'RESTful APIs and middleware development' },
    { name: 'MongoDB', category: 'database', proficiencyLevel: 4, yearsOfExperience: 3, description: 'NoSQL database design and aggregation pipelines' },
    { name: 'PostgreSQL', category: 'database', proficiencyLevel: 4, yearsOfExperience: 3, description: 'Relational database design and complex queries' },
    { name: 'Docker', category: 'tools', proficiencyLevel: 4, yearsOfExperience: 2, description: 'Containerization and orchestration' },
    { name: 'Git', category: 'tools', proficiencyLevel: 5, yearsOfExperience: 5, description: 'Version control and collaborative development' },
    { name: 'AWS', category: 'cloud', proficiencyLevel: 3, yearsOfExperience: 2, description: 'EC2, S3, Lambda, and other AWS services' }
  ],
  
  projects: [
    {
      title: 'DevHub Portfolio',
      description: 'A comprehensive portfolio platform built with MERN/PERN stack showcasing web development concepts including authentication, CRUD operations, and modern UI/UX patterns.',
      technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'JWT'],
      githubUrl: 'https://github.com/example/devhub-portfolio',
      liveUrl: 'https://devhub-portfolio.vercel.app',
      status: 'completed',
      priority: 'high',
      featured: true,
      likes: 45,
      views: 234
    },
    {
      title: 'E-Commerce API',
      description: 'RESTful API for an e-commerce platform with advanced features like product management, user authentication, order processing, and payment integration.',
      technologies: ['Node.js', 'Express', 'PostgreSQL', 'Stripe API', 'JWT', 'Jest'],
      githubUrl: 'https://github.com/example/ecommerce-api',
      status: 'completed',
      priority: 'high',
      featured: true,
      likes: 32,
      views: 189
    },
    {
      title: 'Task Management Dashboard',
      description: 'Interactive dashboard for team task management with real-time updates, drag-and-drop functionality, and team collaboration features.',
      technologies: ['React', 'TypeScript', 'Socket.io', 'Node.js', 'MongoDB', 'Tailwind CSS'],
      githubUrl: 'https://github.com/example/task-dashboard',
      liveUrl: 'https://task-dashboard-demo.netlify.app',
      status: 'in-progress',
      priority: 'medium',
      featured: false,
      likes: 18,
      views: 156
    }
  ]
};

/**
 * Checks if the database already contains any data
 * @returns {Promise<{users: number, projects: number, skills: number, hasData: boolean}>} 
 * Object containing counts of existing documents and a flag indicating if any data exists
 */
const checkExistingData = async () => {
  // Count documents in parallel for better performance
  const [userCount, projectCount, skillCount] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Skill.countDocuments()
  ]);

  return {
    users: userCount,
    projects: projectCount,
    skills: skillCount,
    hasData: userCount > 0 || projectCount > 0 || skillCount > 0
  };
};

/**
 * Main function to seed the database with initial data
 * - Connects to the database
 * - Checks for existing data and prompts for confirmation before deletion
 * - Creates users, skills, and projects
 * - Provides a summary of the seeding operation
 */
const seedDatabase = async (): Promise<void> => {
  try {
    
    // Connect to MongoDB using the database configuration
    await connectDB();
    console.log('🌱 Starting database seeding...');

    const existingData = await checkExistingData();
    
    // Check if database already contains data and handle accordingly
    if (existingData.hasData) {
      console.log('\n⚠️  WARNING: Database already contains data!');
      console.log(`   👥 Users: ${existingData.users}`);
      console.log(`   📁 Projects: ${existingData.projects}`);
      console.log(`   🛠️  Skills: ${existingData.skills}`);
      console.log('');
      
      // Prompt user for confirmation before dropping data
      const answer = await question('Do you want to DROP ALL existing data and reseed? (y/n): ');
      
      // Exit if user doesn't confirm
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Seeding cancelled. Database unchanged.');
        rl.close();
        process.exit(0);
      }
      
      console.log('🧹 Dropping existing data...');
    }
    
    // Delete all existing data in parallel
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Skill.deleteMany({})
    ]);
    
    // Create demo user(s)
    console.log('👥 Creating users...');
    const createdUsers = await User.create(seedData.users);
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Create skills with random data for the demo user
    console.log('🛠️  Creating skills...');
    const demoUser = createdUsers[0];
    const skillsWithUser = seedData.skills.map(skill => ({
      ...skill,
      userId: demoUser._id,  // Associate all skills with the demo user
      endorsements: Math.floor(Math.random() * 20),  // Random endorsements (0-20)
      lastUsed: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),  // Random date within last year
      certifications: Math.random() > 0.7 ? [`${skill.name} Certification`] : []  // 30% chance of having a certification
    }));
    
    const createdSkills = await Skill.create(skillsWithUser);
    console.log(`✅ Created ${createdSkills.length} skills`);
    
    // Create projects with random data for the demo user
    console.log('📁 Creating projects...');
    const projectsWithUser = seedData.projects.map(project => ({
      ...project,
      userId: demoUser._id,  // Associate all projects with the demo user
      startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),  // Random start date within last year
      endDate: project.status === 'completed' ? new Date() : undefined  // Set end date if project is completed
    }));
    
    const createdProjects = await Project.create(projectsWithUser);
    console.log(`✅ Created ${createdProjects.length} projects`);
    
    // Display summary of seeding operation
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${createdUsers.length}`);
    console.log(`   🛠️  Skills: ${createdSkills.length}`);
    console.log(`   📁 Projects: ${createdProjects.length}`);
    
    // Display demo credentials
    console.log('\n🔑 Demo Credentials:');
    console.log('   Email: demo@devhub.com');
    console.log('   Password: password123');
    
    // Clean up and exit
    rl.close();
    process.exit(0);
    
  } catch (error: unknown) {
    // Handle any errors that occur during seeding
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('❌ Seeding error:', errorMessage);
    if (errorStack) {
      console.error(errorStack);
    }
    
    // Ensure resources are cleaned up before exiting
    rl.close();
    process.exit(1);
  }
};

// Execute the seeding function if this file is run directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;