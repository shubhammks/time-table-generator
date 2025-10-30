import React from 'react';

const Profile = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
          Manage your personal profile and account settings
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Profile management functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
