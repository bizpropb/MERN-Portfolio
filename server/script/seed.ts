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
import Comment from '../models/Comment';
import Upload from '../models/Upload';  

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
 * Contains sample users, skills, projects, and comments with realistic data
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
      isVerified: true,
      location: { latitude: 47.3769, longitude: 8.5417, city: 'Zurich', country: 'Switzerland' }
    },
    {
      email: 'sarah.dev@example.com',
      password: 'password123',
      firstName: 'Sarah',
      lastName: 'Developer',
      bio: 'Frontend specialist with a passion for clean, accessible user interfaces.',
      role: 'user',
      isVerified: true,
      location: { latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'United States' }
    },
    {
      email: 'mike.engineer@example.com',
      password: 'password123',
      firstName: 'Mike',
      lastName: 'Engineer',
      bio: 'Backend engineer focused on scalable architecture and performance optimization.',
      role: 'user',
      isVerified: true,
      location: { latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'United Kingdom' }
    },
    {
      email: 'alex.reviewer@example.com',
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Reviewer',
      bio: 'Tech lead and code reviewer with 8+ years of experience.',
      role: 'user',
      isVerified: true,
      location: { latitude: 35.6762, longitude: 139.6503, city: 'Tokyo', country: 'Japan' }
    },
    {
      email: 'maria.frontend@example.com',
      password: 'password123',
      firstName: 'Maria',
      lastName: 'Garcia',
      bio: 'Creative frontend developer specializing in React and modern CSS.',
      role: 'user',
      isVerified: true,
      location: { latitude: 41.3851, longitude: 2.1734, city: 'Barcelona', country: 'Spain' }
    },
    {
      email: 'luca.backend@example.com',
      password: 'password123',
      firstName: 'Luca',
      lastName: 'Rossi',
      bio: 'Full-stack developer with expertise in Node.js and microservices.',
      role: 'user',
      isVerified: true,
      location: { latitude: 45.4642, longitude: 9.1900, city: 'Milan', country: 'Italy' }
    },
    {
      email: 'anna.designer@example.com',
      password: 'password123',
      firstName: 'Anna',
      lastName: 'Mueller',
      bio: 'UX/UI designer turned developer, bridging design and code.',
      role: 'user',
      isVerified: true,
      location: { latitude: 52.5200, longitude: 13.4050, city: 'Berlin', country: 'Germany' }
    },
    {
      email: 'chen.developer@example.com',
      password: 'password123',
      firstName: 'Chen',
      lastName: 'Wei',
      bio: 'Software engineer passionate about AI and machine learning applications.',
      role: 'user',
      isVerified: true,
      location: { latitude: 39.9042, longitude: 116.4074, city: 'Beijing', country: 'China' }
    },
    {
      email: 'emma.fullstack@example.com',
      password: 'password123',
      firstName: 'Emma',
      lastName: 'Johnson',
      bio: 'Full-stack developer with a love for clean code and agile methodologies.',
      role: 'user',
      isVerified: true,
      location: { latitude: -33.8688, longitude: 151.2093, city: 'Sydney', country: 'Australia' }
    },
    {
      email: 'raj.mobile@example.com',
      password: 'password123',
      firstName: 'Raj',
      lastName: 'Patel',
      bio: 'Mobile and web developer with expertise in React Native and PWAs.',
      role: 'user',
      isVerified: true,
      location: { latitude: 19.0760, longitude: 72.8777, city: 'Mumbai', country: 'India' }
    },
    {
      email: 'sophie.data@example.com',
      password: 'password123',
      firstName: 'Sophie',
      lastName: 'Dubois',
      bio: 'Data engineer and full-stack developer, specializing in Python and JavaScript.',
      role: 'user',
      isVerified: true,
      location: { latitude: 48.8566, longitude: 2.3522, city: 'Paris', country: 'France' }
    },
    {
      email: 'carlos.devops@example.com',
      password: 'password123',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      bio: 'DevOps engineer and backend developer, cloud infrastructure enthusiast.',
      role: 'user',
      isVerified: true,
      location: { latitude: -34.6118, longitude: -58.3960, city: 'Buenos Aires', country: 'Argentina' }
    },
    {
      email: 'yuki.frontend@example.com',
      password: 'password123',
      firstName: 'Yuki',
      lastName: 'Tanaka',
      bio: 'Frontend developer with a focus on performance optimization and accessibility.',
      role: 'user',
      isVerified: true,
      location: { latitude: 34.6937, longitude: 135.5023, city: 'Osaka', country: 'Japan' }
    },
    {
      email: 'dmitri.backend@example.com',
      password: 'password123',
      firstName: 'Dmitri',
      lastName: 'Volkov',
      bio: 'Backend architect with extensive experience in distributed systems.',
      role: 'user',
      isVerified: true,
      location: { latitude: 55.7558, longitude: 37.6176, city: 'Moscow', country: 'Russia' }
    },
    {
      email: 'priya.ai@example.com',
      password: 'password123',
      firstName: 'Priya',
      lastName: 'Sharma',
      bio: 'ML engineer and full-stack developer, building intelligent web applications.',
      role: 'user',
      isVerified: true,
      location: { latitude: 28.7041, longitude: 77.1025, city: 'Delhi', country: 'India' }
    },
    {
      email: 'erik.security@example.com',
      password: 'password123',
      firstName: 'Erik',
      lastName: 'Larsson',
      bio: 'Security-focused developer with expertise in secure coding practices.',
      role: 'user',
      isVerified: true,
      location: { latitude: 59.3293, longitude: 18.0686, city: 'Stockholm', country: 'Sweden' }
    },
    {
      email: 'fatima.mobile@example.com',
      password: 'password123',
      firstName: 'Fatima',
      lastName: 'Al-Zahra',
      bio: 'Mobile-first developer specializing in progressive web applications.',
      role: 'user',
      isVerified: true,
      location: { latitude: 25.2048, longitude: 55.2708, city: 'Dubai', country: 'UAE' }
    },
    {
      email: 'lucas.game@example.com',
      password: 'password123',
      firstName: 'Lucas',
      lastName: 'Silva',
      bio: 'Game developer turned web developer, bringing interactive experiences to the web.',
      role: 'user',
      isVerified: true,
      location: { latitude: -23.5505, longitude: -46.6333, city: 'São Paulo', country: 'Brazil' }
    },
    {
      email: 'maya.blockchain@example.com',
      password: 'password123',
      firstName: 'Maya',
      lastName: 'Thompson',
      bio: 'Blockchain developer exploring decentralized web technologies.',
      role: 'user',
      isVerified: true,
      location: { latitude: 49.2827, longitude: -123.1207, city: 'Vancouver', country: 'Canada' }
    },
    {
      email: 'ahmed.fullstack@example.com',
      password: 'password123',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      bio: 'Full-stack developer with a passion for creating impactful digital solutions.',
      role: 'user',
      isVerified: true,
      location: { latitude: 30.0444, longitude: 31.2357, city: 'Cairo', country: 'Egypt' }
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
  ],

  comments: [
    // Comments for DevHub Portfolio project
    {
      content: "Impressive work! The authentication system is really well implemented. Clean code structure and great use of TypeScript.",
      rating: 5,
      projectIndex: 0 // Will be replaced with actual project ID
    },
    {
      content: "Love the UI design! The Tailwind CSS implementation is spot on. How long did this take to build?",
      rating: 4,
      projectIndex: 0
    },
    {
      content: "Great project showcase! The responsive design works perfectly across devices. Really solid portfolio piece.",
      rating: 5,
      projectIndex: 0
    },
    
    // Comments for E-Commerce API project
    {
      content: "Excellent API design! The PostgreSQL integration looks robust. Have you considered adding GraphQL endpoints?",
      rating: 4,
      projectIndex: 1
    },
    {
      content: "Really thorough testing with Jest. The Stripe integration must have been challenging - well done!",
      rating: 5,
      projectIndex: 1
    },
    
    // Comments for Task Management Dashboard project
    {
      content: "The real-time features are awesome! Socket.io implementation looks clean. Still in progress but already impressive.",
      rating: 4,
      projectIndex: 2
    },
    {
      content: "Drag and drop functionality is smooth. Looking forward to seeing the final version!",
      rating: 4,
      projectIndex: 2
    }
  ]
};

/**
 * Checks if the database already contains any data
 * @returns {Promise<{users: number, projects: number, skills: number, comments: number, hasData: boolean}>} 
 * Object containing counts of existing documents and a flag indicating if any data exists
 */
const checkExistingData = async () => {
  // Count documents in parallel for better performance
  const [userCount, projectCount, skillCount, commentCount] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Skill.countDocuments(),
    Comment.countDocuments()
  ]);

  return {
    users: userCount,
    projects: projectCount,
    skills: skillCount,
    comments: commentCount,
    hasData: userCount > 0 || projectCount > 0 || skillCount > 0 || commentCount > 0
  };
};

/**
 * Main function to seed the database with initial data
 * - Connects to the database
 * - Checks for existing data and prompts for confirmation before deletion
 * - Creates users, skills, projects, and comments
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
      console.log(`   💬 Comments: ${existingData.comments}`);
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
      Skill.deleteMany({}),
      Comment.deleteMany({})
    ]);
    
    // Create demo users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(seedData.users);
    console.log(`✅ Created ${createdUsers.length} users with locations worldwide`);
    
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
    
    // Create comments from different users on the demo user's projects
    console.log('💬 Creating comments...');
    const commentsWithData = seedData.comments.map((comment, index) => {
      const project = createdProjects[comment.projectIndex];
      const commenterIndex = (index % 19) + 1; // Rotate through commenters (skip index 0 which is demo user)
      const commenter = createdUsers[commenterIndex];
      
      return {
        projectId: project._id,
        userId: commenter._id,
        content: comment.content,
        rating: comment.rating,
        isPublic: true,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      };
    });
    
    const createdComments = await Comment.create(commentsWithData);
    console.log(`✅ Created ${createdComments.length} comments`);
    
    // Display summary of seeding operation
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${createdUsers.length} (with global locations)`);
    console.log(`   🛠️  Skills: ${createdSkills.length}`);
    console.log(`   📁 Projects: ${createdProjects.length}`);
    console.log(`   💬 Comments: ${createdComments.length}`);
    
    // Display demo credentials
    console.log('\n🔑 Demo Credentials:');
    console.log('   Email: demo@devhub.com');
    console.log('   Password: password123');
    
    console.log('\n🗺️  Global User Locations:');
    console.log('   Users are distributed across 20 cities worldwide:');
    console.log('   Zurich, New York, London, Tokyo, Barcelona, Milan, Berlin,');
    console.log('   Beijing, Sydney, Mumbai, Paris, Buenos Aires, Osaka, Moscow,');
    console.log('   Delhi, Stockholm, Dubai, São Paulo, Vancouver, Cairo');
    
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