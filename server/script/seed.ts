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
import News from '../models/News';  

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
      username: 'demo',
      firstName: 'Daniel',
      lastName: 'Demo',
      bio: 'Full-stack developer passionate about building amazing web applications. I love learning new technologies and solving complex problems.',
      role: 'user',
      isVerified: true,
      location: { latitude: 47.3769, longitude: 8.5417, city: 'Zurich', country: 'Switzerland' }
    },
    {
      email: 'sarah.dev@example.com',
      password: 'password123',
      username: 'sarah_dev',
      firstName: 'Sarah',
      lastName: 'Developer',
      bio: 'Frontend specialist with a passion for clean, accessible user interfaces.',
      role: 'user',
      isVerified: true,
      location: { latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'United States' },
      avatar: 'https://images.pexels.com/photos/831889/pexels-photo-831889.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
    },
    {
      email: 'mike.engineer@example.com',
      password: 'password123',
      username: 'mike_engineer',
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
      username: 'alex_reviewer',
      firstName: 'Alex',
      lastName: 'Reviewer',
      bio: 'Tech lead and code reviewer with 8+ years of experience.',
      role: 'user',
      isVerified: true,
      location: { latitude: 35.6762, longitude: 139.6503, city: 'Tokyo', country: 'Japan' },
      avatar: 'https://thumbs.dreamstime.com/b/zen-stones-stack-9778163.jpg'
    },
    {
      email: 'maria.frontend@example.com',
      password: 'password123',
      username: 'maria_garcia',
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
      username: 'luca_rossi',
      firstName: 'Luca',
      lastName: 'Rossi',
      bio: 'Full-stack developer with expertise in Node.js and microservices.',
      role: 'user',
      isVerified: true,
      location: { latitude: 45.4642, longitude: 9.1900, city: 'Milan', country: 'Italy' },
      avatar: 'https://cdn.pixabay.com/photo/2024/05/18/19/24/ai-generated-8770945_1280.jpg'
    },
    {
      email: 'anna.designer@example.com',
      password: 'password123',
      username: 'anna_mueller',
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
      username: 'chen_wei',
      firstName: 'Chen',
      lastName: 'Wei',
      bio: 'Software engineer passionate about AI and machine learning applications.',
      role: 'user',
      isVerified: true,
      location: { latitude: 39.9042, longitude: 116.4074, city: 'Beijing', country: 'China' },
      avatar: 'https://cdn.pixabay.com/photo/2023/10/25/13/03/lofi-8340329_1280.jpg'
    },
    {
      email: 'emma.fullstack@example.com',
      password: 'password123',
      username: 'emma_johnson',
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
      username: 'raj_patel',
      firstName: 'Raj',
      lastName: 'Patel',
      bio: 'Mobile and web developer with expertise in React Native and PWAs.',
      role: 'user',
      isVerified: true,
      location: { latitude: 19.0760, longitude: 72.8777, city: 'Mumbai', country: 'India' },
      avatar: 'https://images.freeimages.com/images/large-previews/65c/majestic-lion-portrait-0410-5704490.jpg?fmt=webp&w=500'
    },
    {
      email: 'sophie.data@example.com',
      password: 'password123',
      username: 'sophie_dubois',
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
      username: 'carlos_rodriguez',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      bio: 'DevOps engineer and backend developer, cloud infrastructure enthusiast.',
      role: 'user',
      isVerified: true,
      location: { latitude: -34.6118, longitude: -58.3960, city: 'Buenos Aires', country: 'Argentina' },
      avatar: 'https://cdn.pixabay.com/photo/2024/03/08/06/38/ai-generated-8619963_1280.jpg'
    },
    {
      email: 'yuki.frontend@example.com',
      password: 'password123',
      username: 'yuki_tanaka',
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
      username: 'dmitri_volkov',
      firstName: 'Dmitri',
      lastName: 'Volkov',
      bio: 'Backend architect with extensive experience in distributed systems.',
      role: 'user',
      isVerified: true,
      location: { latitude: 55.7558, longitude: 37.6176, city: 'Moscow', country: 'Russia' },
      avatar: 'https://thumbs.dreamstime.com/b/magical-fairy-clipart-k-ai-fairy-background-images-jpg-printable-nature-fantasy-art-wallpaper-magical-fairy-clipart-k-ai-fairy-386900359.jpg'
    },
    {
      email: 'priya.ai@example.com',
      password: 'password123',
      username: 'priya_sharma',
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
      username: 'erik_larsson',
      firstName: 'Erik',
      lastName: 'Larsson',
      bio: 'Security-focused developer with expertise in secure coding practices.',
      role: 'user',
      isVerified: true,
      location: { latitude: 59.3293, longitude: 18.0686, city: 'Stockholm', country: 'Sweden' },
      avatar: 'https://www.shutterstock.com/image-photo/death-star-wars-600nw-2527065111.jpg'
    },
    {
      email: 'fatima.mobile@example.com',
      password: 'password123',
      username: 'fatima_alzahra',
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
      username: 'lucas_silva',
      firstName: 'Lucas',
      lastName: 'Silva',
      bio: 'Game developer turned web developer, bringing interactive experiences to the web.',
      role: 'user',
      isVerified: true,
      location: { latitude: -23.5505, longitude: -46.6333, city: 'São Paulo', country: 'Brazil' },
      avatar: 'https://cdn.pixabay.com/photo/2024/10/03/10/22/shiva-9093316_1280.png'
    },
    {
      email: 'maya.blockchain@example.com',
      password: 'password123',
      username: 'maya_thompson',
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
      username: 'ahmed_hassan',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      bio: 'Full-stack developer with a passion for creating impactful digital solutions.',
      role: 'user',
      isVerified: true,
      location: { latitude: 30.0444, longitude: 31.2357, city: 'Cairo', country: 'Egypt' },
      avatar: 'https://www.diamondart.com.au/cdn/shop/products/Popart-Wow.jpg?v=1716987052'
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
  ],
  news: [
    {
      title: "DevHub Launches",
      slug: "devhub-launches",
      preview: "After months of late-night coding sessions and way too much coffee, we're finally live! DevHub is here to help developers showcase their work without the usual social media chaos.",
      content: `# DevHub Launches 🥳

After months of development, countless cups of coffee, and more debugging sessions than we care to admit, we're officially launching DevHub. It feels surreal to finally say that, considering how many times we thought we'd be ready "next week" over the past six months.

## What exactly is DevHub?

DevHub is a community platform built specifically for developers who want to showcase their projects, connect with other professionals, and share knowledge without wading through the noise of traditional social media.

Think of it as a place where you can actually talk about code without your non-tech friends glazing over, and where "What's your stack?" is a perfectly normal conversation starter.

## Why we built this thing

Existing platforms weren't really cutting it for the developer community, and we got tired of trying to make them work. We needed something that actually understands what developers need - a focus on projects and technical skills rather than random life updates, a clean environment without algorithmic timeline manipulation, and an easy way to discover and connect with other developers based on shared interests and skills.

Plus, we were pretty tired of trying to explain our GitHub profiles to recruiters who clearly had no idea what they were looking at.

## What you can do right now

Project showcasing is the core feature - upload your projects with detailed descriptions, tech stacks, and live demos. Your developer profile highlights skills, experience, and achievements in a format that actually makes sense for technical work.

We've kept the interface clean and focused. No infinite scroll designed to waste your time, no ads disguised as content, no mysterious algorithm deciding what you should see.

## What's coming next

This launch is just the foundation. We're working on project collaboration features so you can actually work together on interesting problems. Advanced search and filtering will help you find exactly the type of developers or projects you're looking for.

Developer networking tools are in development, along with code snippet sharing for those quick solutions you want to remember. We've got a whole roadmap of features planned, but we're prioritizing based on what the community actually wants rather than what we think sounds cool.

## Come join us

Ready to be part of something new? Sign up today and start showcasing the projects you're proud of. We genuinely can't wait to see what everyone is building.

Got feedback or suggestions? We're all ears and actively building based on what you tell us. The whole point of launching early is to build this thing together with the community rather than in isolation.

Welcome to DevHub. Let's see what we can build together. 🚀`,
      imageUrl: "/launch.webp",
      author: "DevHub Team",
      published: true,
      publishedAt: new Date('2024-12-15T10:30:00Z'),
      views: 247
    },
    {
      title: "Dark Mode: Because Your Eyes Matter",
      slug: "dark-mode-because-your-eyes-matter", 
      preview: "We added dark mode because let's be honest - who codes in light mode after sunset? Your retinas will thank us. Plus it makes you look 10x more professional in video calls.",
      content: `# Dark Mode: Because Your Eyes Matter

One of the most requested features, and honestly one we should have had from day one, is finally here: Dark Mode. Yes, we know it's 2025 and dark mode should be a given by now, but here we are.

## The completely scientific research

According to our highly rigorous survey of exactly three developers in our office, the results were conclusive. 100% prefer dark mode after 6 PM, 67% think light mode is "absolutely barbaric" (direct quote), and 33% claim dark mode makes them "feel like a hacker from the movies."

We couldn't argue with data that compelling.

## More than just looking cool

Sure, dark mode looks slick, but there are legitimate benefits beyond the aesthetic appeal. On OLED displays, dark pixels are literally turned off, which means your laptop battery will thank you during those inevitable late-night coding marathons.

Eye strain reduction is probably the biggest win here. Staring at bright white screens in a dark room is basically like staring directly into the sun, except less dramatic and more likely to give you a headache. Dark mode is much easier on your retinas, especially when you're debugging at 2 AM wondering why your function is returning undefined.

Let's also acknowledge that dark mode just looks more professional in video calls. You'll look like you know what you're doing even when you're frantically googling syntax errors behind the scenes. The reduced contrast also helps you focus on the content that actually matters without being distracted by blazing white backgrounds.

## How we actually built this

Our dark mode implementation uses CSS custom properties and Tailwind's dark mode utilities. Nothing revolutionary here, just solid engineering.

\`\`\`css
/* Context provider for state management */
const { isDark, toggleDarkMode } = useDarkMode();

/* Tailwind handles the heavy lifting */
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
\`\`\`

The system remembers your preference across sessions, automatically applies it to all pages, and respects your system settings if you haven't made a manual choice. Pretty standard stuff, but it works reliably.

## Finding the toggle

You'll find the dark mode toggle in the navigation bar - that little moon and sun icon that's become the universal symbol for "I care about my eyeballs." Click it once, and everything smoothly transitions to dark mode. Click it again to go back to light mode, though we're not sure why you'd want to.

## What's next for themes

We're also working on high contrast mode for accessibility, because good design should work for everyone.

## The future is definitely dark

Dark mode isn't just a trendy feature anymore - it's become essential for any platform that developers actually use. We're committed to making sure DevHub looks great whether you're coding at noon or midnight.

The era of burning your retinas with pure white backgrounds is officially over. Welcome to the dark side. 🌙`,
      imageUrl: "/darkmode.webp",
      author: "Alex Chen", 
      published: true,
      publishedAt: new Date('2025-01-08T14:20:00Z'),
      views: 189
    },
    {
      title: "User Map: Find Your Code Neighbors",
      slug: "user-map-find-your-code-neighbors",
      preview: "Ever wondered where all the cool developers hang out? Our new map feature lets you discover the global dev community. Spoiler: there are way more of us than you think.",
      content: `# User Map: Find Your Code Neighbors

Ever wondered if there are other developers in your city? Or maybe you're planning to relocate and want to know where the tech communities are thriving? Well, wonder no more.

We're excited to introduce the DevHub User Map - your gateway to discovering the global developer community. Think of it as a developer census, but way cooler and with better UI.

## What exactly is it?

The User Map is an interactive world map that shows where DevHub community members are located. It's pretty straightforward, but the implications are fascinating. You can finally answer questions like "Are there actually any developers in Montana?" or "Should I move to Berlin for the tech scene?"

Once you're on the map, you can browse around and see developers everywhere. Each pin represents community members in that area. It's oddly satisfying to zoom around and see all the little clusters of developers scattered across the globe.

Click on any location to see who's coding in that area. Perfect for finding local coding buddies, planning meetups, or just satisfying your curiosity about whether anyone actually codes in Greenland (spoiler: they do).

## Privacy matters

We take privacy seriously, which is why we've kept things simple. Only you decide how accurately you place your pin (or if you place it at all). You can opt out of appearing on the map anytime, and location sharing is completely optional from the start.

## Building actual community

The map isn't just about pretty data visualization. It's about connection. We've already started seeing local meetups organized through DevHub connections, remote collaboration projects between developers from different continents, and mentorship relationships formed across time zones.

Some developers have even found job opportunities through local community connections. It turns out that knowing there are other developers in your area actually leads to real networking opportunities.

## The technical stuff

For those curious about implementation, we built this using Leaflet.js for the interactive map with OpenStreetMap tiles because open source rocks. We implemented real-time clustering for performance with large datasets, and yes, it supports dark mode because of course it does.

On the backend, we handle geocoding for location data processing with privacy-first data aggregation. We use MongoDB geospatial indexes for efficient querying, and everything lazy loads so it doesn't crush your browser when viewing thousands of users.

## What's coming next

This is just the beginning for location-based features. We're working on local event discovery so you can find coding meetups and conferences in your area. Local job matching is coming too, along with skill-based matching to connect with developers who complement your abilities.

We're also building a mobile app so you can take the community with you everywhere. Imagine traveling somewhere new and being able to instantly connect with local developers.

## Join the map

Ready to put yourself on the developer map? Update your profile with your location and become part of our global community visualization. And next time you're traveling, check the map first - you might just find a local developer to grab coffee with.

The world is smaller than you think, and the developer community is everywhere. Let's explore it together. 🗺️`,
      imageUrl: "/map.webp",
      author: "Maria Rodriguez",
      published: true, 
      publishedAt: new Date('2025-01-12T09:15:00Z'),
      views: 156
    }
  ]
};

/**
 * Checks if the database already contains any data
 * @returns {Promise<{users: number, projects: number, skills: number, comments: number, news: number, hasData: boolean}>} 
 * Object containing counts of existing documents and a flag indicating if any data exists
 */
const checkExistingData = async () => {
  // Count documents in parallel for better performance
  const [userCount, projectCount, skillCount, commentCount, newsCount] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Skill.countDocuments(),
    Comment.countDocuments(),
    News.countDocuments()
  ]);

  return {
    users: userCount,
    projects: projectCount,
    skills: skillCount,
    comments: commentCount,
    news: newsCount,
    hasData: userCount > 0 || projectCount > 0 || skillCount > 0 || commentCount > 0 || newsCount > 0
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
      console.log(`   📰 News: ${existingData.news}`);
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
      Comment.deleteMany({}),
      News.deleteMany({})
    ]);
    
    // ====USERS SEEDING====
    console.log('👥 Creating users...');
    const createdUsers = await User.create(seedData.users);
    console.log(`✅ Created ${createdUsers.length} users with locations worldwide`);
    
    // ====END USERS SEEDING====
    
    // ====SKILLS SEEDING====
    console.log('🛠️  Creating skills...');
    const demoUser = createdUsers[0]; // Demo user (first user)
    
    // Create skills for demo user only - SWE should replicate this pattern for other users
    const demoSkills = seedData.skills.map(skill => ({
      ...skill,
      userId: demoUser._id,  // Associate with demo user
      endorsements: Math.floor(Math.random() * 20),  // Random endorsements (0-20)
      lastUsed: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),  // Random date within last year
      certifications: Math.random() > 0.7 ? [`${skill.name} Certification`] : []  // 30% chance of having a certification
    }));
    
    const createdSkills = await Skill.create(demoSkills);
    console.log(`✅ Created ${createdSkills.length} skills for demo user`);
    
    // Create skills for other users
    const otherUserSkills = [];
    const skillCategories = ['frontend', 'backend', 'database', 'cloud', 'tools'];
    
    for (let i = 1; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const userSkillCount = Math.floor(Math.random() * 5) + 3; // 3-7 skills per user
      const userSkillIndices = new Set<number>();
      
      // Ensure unique skill indices for this user
      while (userSkillIndices.size < userSkillCount) {
        userSkillIndices.add(Math.floor(Math.random() * seedData.skills.length));
      }
      
      const userSkills = Array.from(userSkillIndices).map(skillIndex => {
        const skill = seedData.skills[skillIndex];
        return {
          ...skill,
          userId: user._id,
          proficiencyLevel: Math.floor(Math.random() * 3) + 3, // 3-5
          yearsOfExperience: Math.floor(Math.random() * 5) + 1, // 1-5 years
          endorsements: Math.floor(Math.random() * 30), // 0-29 endorsements
          lastUsed: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3), // Up to 3 years ago
          certifications: Math.random() > 0.7 ? [`${skill.name} Certification`] : []
        };
      });
      
      otherUserSkills.push(...userSkills);
    }
    
    const additionalSkills = await Skill.create(otherUserSkills);
    createdSkills.push(...additionalSkills);
    
    // ====END SKILLS SEEDING====
    
    // ====PROJECTS SEEDING====
    console.log('📁 Creating projects...');
    
    // Create projects for demo user only - SWE should replicate this pattern for other users
    const demoProjects = seedData.projects.map(project => ({
      ...project,
      userId: demoUser._id,  // Associate with demo user
      startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),  // Random start date within last year
      endDate: project.status === 'completed' ? new Date() : undefined  // Set end date if project is completed
    }));
    
    const createdProjects = await Project.create(demoProjects);
    console.log(`✅ Created ${createdProjects.length} projects for demo user`);
    
    // Create projects for other users
    const otherUserProjects = [];
    const projectTemplates = [
      {
        title: 'Personal Portfolio',
        description: 'A responsive portfolio website showcasing my projects and skills.',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
        status: 'completed',
        featured: true
      },
      {
        title: 'E-commerce Store',
        description: 'Full-stack e-commerce platform with product catalog, cart, and checkout.',
        technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
        status: 'completed',
        featured: true
      },
      {
        title: 'Task Manager App',
        description: 'Task management application with drag-and-drop functionality and team collaboration.',
        technologies: ['React', 'TypeScript', 'Firebase', 'Material-UI'],
        status: 'in-progress',
        featured: false
      },
      {
        title: 'Blog Platform',
        description: 'A modern blog platform with markdown support and user authentication.',
        technologies: ['Next.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
        status: 'completed',
        featured: true
      },
      {
        title: 'Weather Dashboard',
        description: 'Real-time weather information dashboard with 5-day forecast.',
        technologies: ['React', 'OpenWeather API', 'Chart.js', 'CSS Modules'],
        status: 'completed',
        featured: false
      },
      {
        title: 'Recipe Finder',
        description: 'Search and discover recipes based on available ingredients.',
        technologies: ['Vue.js', 'Node.js', 'Express', 'Spoonacular API'],
        status: 'in-progress',
        featured: false
      }
    ];

    for (let i = 1; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const userProjectCount = Math.floor(Math.random() * 3) + 2; // 2-4 projects per user
      const usedIndices = new Set<number>();
      
      // Ensure unique project indices for this user
      while (usedIndices.size < userProjectCount) {
        usedIndices.add(Math.floor(Math.random() * projectTemplates.length));
      }
      
      const userProjects = Array.from(usedIndices).map(projectIndex => {
        const template = projectTemplates[projectIndex];
        const isCompleted = template.status === 'completed';
        const startDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        
        return {
          ...template,
          userId: user._id,
          technologies: [...template.technologies], // Clone the array
          githubUrl: `https://github.com/${user.username}/${template.title.toLowerCase().replace(/\s+/g, '-')}`,
          liveUrl: isCompleted ? `https://${user.username}-${template.title.toLowerCase().replace(/\s+/g, '-')}.vercel.app` : undefined,
          startDate,
          endDate: isCompleted ? new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000) : undefined,
          priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
          likes: Math.floor(Math.random() * 50),
          views: Math.floor(Math.random() * 300) + 50
        };
      });
      
      otherUserProjects.push(...userProjects);
    }
    
    const additionalProjects = await Project.create(otherUserProjects);
    createdProjects.push(...additionalProjects);
    console.log(`✅ Created ${additionalProjects.length} projects for other users`);
    
    // ====END PROJECTS SEEDING====
    
    // ====COMMENTS SEEDING====
    console.log('💬 Creating comments...');
    
    // Create comments from different users on demo user's projects - SWE should expand this pattern
    const demoProjectComments = seedData.comments.map((comment, index) => {
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
    
    const createdComments = await Comment.create(demoProjectComments);
    console.log(`✅ Created ${createdComments.length} comments on demo user's projects`);
    
    // Create comments for other users' projects
    const otherProjectComments = [];
    const commentTemplates = [
      "Great work on this project! The implementation looks solid and well-structured.",
      "I really like how you've approached this. The code is clean and easy to follow.",
      "This is impressive! Have you considered adding [suggestion] to enhance it further?",
      "The UI/UX is very intuitive. Great attention to detail!",
      "I noticed a small issue with [specific part]. Otherwise, great job!",
      "The performance optimizations here are excellent. Very efficient code!",
      "This would be a great addition to my own projects. Mind if I take some inspiration?",
      "The documentation is very thorough. Makes it easy to understand the codebase.",
      "I love how you've implemented [specific feature]. Very elegant solution!",
      "The error handling is robust. Great job thinking about edge cases.",
      "This project demonstrates a deep understanding of [technology]. Well done!"
    ];

    // Add comments to projects from other users
    for (const project of additionalProjects) {
      const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments per project
      const commenterIndices = new Set<number>();
      
      // Ensure unique commenters for each project (can't comment on own project)
      while (commenterIndices.size < numComments) {
        const randomIndex = Math.floor(Math.random() * (createdUsers.length - 1)) + 1; // Skip demo user (index 0)
        if (createdUsers[randomIndex]._id.toString() !== project.userId.toString()) {
          commenterIndices.add(randomIndex);
        }
      }
      
      const comments = Array.from(commenterIndices).map(commenterIndex => {
        const commenter = createdUsers[commenterIndex];
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 rating
        const commentTemplate = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
        
        // Personalize comment with project details
        const projectTitle = project.title.toLowerCase();
        let content = commentTemplate;
        
        if (projectTitle.includes('portfolio')) {
          content = content.replace('[specific feature]', 'the responsive design');
        } else if (projectTitle.includes('e-commerce') || projectTitle.includes('ecommerce')) {
          content = content.replace('[suggestion]', 'a wishlist feature');
          content = content.replace('[specific feature]', 'the checkout process');
        } else if (projectTitle.includes('task') || projectTitle.includes('manager')) {
          content = content.replace('[suggestion]', 'recurring tasks');
          content = content.replace('[specific feature]', 'the drag-and-drop functionality');
        } else if (projectTitle.includes('blog')) {
          content = content.replace('[suggestion]', 'a search functionality');
          content = content.replace('[specific feature]', 'the markdown editor');
        } else if (projectTitle.includes('weather')) {
          content = content.replace('[suggestion]', 'a 10-day forecast');
          content = content.replace('[specific feature]', 'the visualization charts');
        } else if (projectTitle.includes('recipe')) {
          content = content.replace('[suggestion]', 'nutritional information');
          content = content.replace('[specific feature]', 'the ingredient search');
        }
        
        return {
          projectId: project._id,
          userId: commenter._id,
          content: content,
          rating: rating,
          isPublic: true,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        };
      });
      
      otherProjectComments.push(...comments);
    }
    
    const additionalComments = await Comment.create(otherProjectComments);
    createdComments.push(...additionalComments);
    console.log(`✅ Created ${additionalComments.length} comments on other users' projects`);
    
    // ====END COMMENTS SEEDING====
    
    // ====NEWS SEEDING====
    console.log('📰 Creating news articles...');
    const createdNews = await News.create(seedData.news);
    console.log(`✅ Created ${createdNews.length} news articles`);
    
    // ====END NEWS SEEDING====
    
    // Display summary of seeding operation
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${createdUsers.length} (with global locations)`);
    console.log(`   🛠️  Skills: ${createdSkills.length}`);
    console.log(`   📁 Projects: ${createdProjects.length}`);
    console.log(`   💬 Comments: ${createdComments.length}`);
    console.log(`   📰 News: ${createdNews.length}`);
    
    // Display demo credentials
    console.log('\n🔑 Demo Credentials:');
    console.log('   Email: demo@devhub.com');
    console.log('   Username: demo');
    console.log('   Password: password123');
    console.log('   Dashboard URL: /user/demo/dashboard');
    
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