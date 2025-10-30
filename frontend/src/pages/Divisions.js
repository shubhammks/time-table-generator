import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { divisionService, classService, batchService } from '../services/crudService';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import {
  PlusIcon,
  UserGroupIcon,
  AcademicCapIcon,
  UsersIcon,
  ListBulletIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Divisions = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    class_id: ''
  });

  const queryClient = useQueryClient();

  // Fetch divisions
  const { data: divisions, isLoading } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => divisionService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Fetch classes for dropdown
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Fetch batches for stats
  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Create division mutation
  const createMutation = useMutation({
    mutationFn: (data) => divisionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
      toast.success('Division created successfully!');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to create division');
    }
  });

  // Update division mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => divisionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
      toast.success('Division updated successfully!');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to update division');
    }
  });

  // Delete division mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => divisionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
      toast.success('Division deleted successfully!');
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to delete division');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      class_id: ''
    });
    setSelectedDivision(null);
  };

  const handleOpenModal = (division = null) => {
    if (division) {
      setSelectedDivision(division);
      setFormData({
        name: division.name || '',
        class_id: division.class_id || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedDivision) {
      updateMutation.mutate({ id: selectedDivision.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (division) => {
    if (window.confirm(`Are you sure you want to delete "${division.name}"?`)) {
      deleteMutation.mutate(division.id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate stats
  const totalDivisions = divisions?.length || 0;
  const activeDivisions = divisions?.length || 0; // Assuming all are active
  const totalBatches = batches?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Divisions
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Manage class divisions and student groups in your institution
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Division
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDivisions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Divisions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <UsersIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeDivisions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Divisions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <ListBulletIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBatches}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Batches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divisions Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {divisions && divisions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Division Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {divisions.map((division) => (
                    <tr key={division.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <UserGroupIcon className="h-5 w-5 text-blue-500 mr-2" />
                          {division.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {classes?.find(c => c.id === division.class_id)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleOpenModal(division)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(division)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteMutation.isLoading}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No divisions found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create divisions to organize students into different sections within each class.
              </p>
              <div className="mt-6">
                <Button onClick={() => handleOpenModal()}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Division
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Division Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedDivision ? 'Edit Division' : 'Add Division'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Division Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter division name (e.g., A, B, C)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class *
                </label>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Class</option>
                  {classes?.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={createMutation.isLoading || updateMutation.isLoading}
                >
                  {selectedDivision ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Divisions;
