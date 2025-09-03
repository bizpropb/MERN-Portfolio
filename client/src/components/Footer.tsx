import React from 'react';
import { CodeBracketIcon, HeartIcon } from '@heroicons/react/24/outline';

// Application footer with creator info, project details, and legal disclaimers
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Creator Info */}
          <div className="flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2">
                <CodeBracketIcon className="w-5 h-5 lightmode-text-primary dark:darkmode-text-primary"/>
                <h3 className="text-xs font-semibold lightmode-text-primary dark:darkmode-text-primary">
                  Created By Pascal Bossert
                </h3>
              </div>
              <p className="text-xs lightmode-text-secondary dark:darkmode-text-secondary mt-3">
                Full-Stack Developer passionate about modern web technologies and clean code architecture.
              </p>
              <a 
                href="https://github.com/bizpropb/MERN-Portfolio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs lightmode-text-secondary dark:darkmode-text-secondary mt-3 inline-block text-primary hover:text-primary-highlight"
              >
                https://github.com/bizpropb/MERN-Portfolio
              </a>
            </div>
            <div className="flex items-center space-x-2 text-xs lightmode-text-secondary dark:darkmode-text-secondary">
              <span>© {currentYear} Pascal Bossert.</span>
              <span>Built with</span>
              <HeartIcon className="w-4 h-4 text-danger" />
              <span>and lots of coffee.</span>
            </div>
          </div>

          {/* Project Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold lightmode-text-primary dark:darkmode-text-primary">MERN Stack Demonstration</h3>
            <p className="text-xs lightmode-text-secondary dark:darkmode-text-secondary">
              This portfolio application showcases development skills using MongoDB, Express.js, React, and Node.js. 
              It represents a snapshot of technical capabilities.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="badge-mode">
                React
              </span>
              <span className="badge-mode">
                TypeScript
              </span>
              <span className="badge-mode">
                Node.js
              </span>
              <span className="badge-mode">
                Express.js
              </span>
              <span className="badge-mode">
                MongoDB
              </span>
            </div>
          </div>

          {/* Legal & Disclaimers */}
          <div className="flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-semibold lightmode-text-primary dark:darkmode-text-primary">Important Notice</h3>
              <div className="text-xs lightmode-text-secondary dark:darkmode-text-secondary space-y-2 mt-3">
                <div className="text-xs lightmode-text-secondary dark:darkmode-text-secondary">
                  This application is a demonstration project and not intended for production use.
                  The application may use incomplete or insecure features for demonstration purposes.  
                  All data is for testing purposes only. No personal information is collected or stored. 
                  By using this demo, you acknowledge this is a portfolio showcase and not a commercial product.
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-xs">
              <span className="lightmode-text-secondary dark:darkmode-text-secondary">
                MERN Stack Portfolio Demo
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="lightmode-text-secondary dark:darkmode-text-secondary">Development Build</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;