import React from 'react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
          Configure application settings and preferences
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Application settings functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
