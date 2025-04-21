// This file serves as the entry point for the development server
// It imports the necessary styles and scripts for development

import './styles/tailwind.css';

// Log a message to indicate the development environment is running
console.log('Chrome Extension Development Environment Running');

// Import the extension scripts to ensure they're compiled
import './background';
import './content';
import '../options/options';

// This file is not used in the actual extension, only for development
