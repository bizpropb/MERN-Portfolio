import React from 'react';
import { CodeBracketIcon, HeartIcon } from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Creator Info */}
          <div className="flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2">
                <CodeBracketIcon className="w-5 h-5 text-cyan-500" />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                  Created By Pascal Bossert
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Full-Stack Developer passionate about modern web technologies and clean code architecture.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>© {currentYear} Pascal Bossert.</span>
              <span>Built with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>and lots of coffee.</span>
            </div>
          </div>

          {/* Project Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">MERN Stack Demonstration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This portfolio application showcases development skills using MongoDB, Express.js, React, and Node.js. 
              It represents a snapshot of technical capabilities.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-white text-xs rounded-full">
                React
              </span>
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-white text-xs rounded-full">
                TypeScript
              </span>
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-white text-xs rounded-full">
                Node.js
              </span>
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-white text-xs rounded-full">
                MongoDB
              </span>
            </div>
          </div>

          {/* Legal & Disclaimers */}
          <div className="flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Important Notice</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mt-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  This application is a demonstration project and not intended for production use. 
                  All data is for testing purposes only. No personal information is collected or stored. 
                  By using this demo, you acknowledge this is a portfolio showcase and not a commercial product.
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-gray-500 dark:text-gray-500">
                MERN Stack Portfolio Demo
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 dark:text-gray-400">Development Build</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;