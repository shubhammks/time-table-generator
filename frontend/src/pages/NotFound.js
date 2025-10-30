import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <svg className="h-12 w-12 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-3-6h6a1 1 0 011 1v6a1 1 0 01-1 1H9a1 1 0 01-1-1V10a1 1 0 011-1z" />
          </svg>
        </div>
        
        <h1 className="mt-6 text-4xl font-bold text-gray-900 dark:text-white">
          404
        </h1>
        <h2 className="mt-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
          Page not found
        </h2>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you might have entered the wrong URL.
        </p>
        
        <div className="mt-8 space-y-4">
          <Link to="/dashboard">
            <Button className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            ← Go back to previous page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
