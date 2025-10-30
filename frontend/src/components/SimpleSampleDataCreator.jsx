import React, { useState } from 'react';
import { departmentService } from '../services/crudService';
import { toast } from 'react-toastify';
import Button from './ui/Button';
import { SparklesIcon } from '@heroicons/react/24/outline';

const SimpleSampleDataCreator = ({ onDataCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState('');

  const createMinimalSampleData = async () => {
    setIsCreating(true);
    setProgress('🚀 Creating minimal sample data...');

    try {
      // Test backend connection first
      setProgress('🔍 Testing backend connection...');
      
      // Create just one department first to test
      setProgress('📚 Creating a test department...');
      const department = await departmentService.create({
        name: 'Computer Science',
        code: 'CS',
        head_name: 'Dr. John Doe',
        description: 'Test department for CS'
      });

      setProgress('✅ Successfully created test department!');
      toast.success('Sample data created! Check your departments page.');
      
      if (onDataCreated) {
        onDataCreated();
      }

    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      
      let errorMessage = 'Failed to connect to backend';
      
      // Check different error formats
      if (error?.response) {
        console.error('Response error:', error.response);
        if (error.response.data) {
          console.error('Response data:', error.response.data);
          errorMessage = JSON.stringify(error.response.data);
        } else {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = 'Unknown error - check console for details';
      }
      
      setProgress(`❌ Error: ${errorMessage}`);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center mb-4">
        <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Test Sample Data Creator
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        This will create a simple test department to verify the backend connection works.
      </p>

      {progress && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {progress}
          </p>
        </div>
      )}

      <Button
        onClick={createMinimalSampleData}
        disabled={isCreating}
        loading={isCreating}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
      >
        {isCreating ? (
          <>Testing Backend Connection...</>
        ) : (
          <>
            <SparklesIcon className="h-4 w-4 mr-2" />
            Test Backend Connection
          </>
        )}
      </Button>
    </div>
  );
};

export default SimpleSampleDataCreator;
