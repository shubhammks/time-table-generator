import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classService, departmentService } from '../services/crudService';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import {
  PlusIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Classes = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    number_of_divisions: 1,
    department_id: ''
  });

  const queryClient = useQueryClient();

  // Fetch classes
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Fetch departments for dropdown
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Create class mutation
  const createMutation = useMutation({
    mutationFn: (data) => classService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class created successfully!');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to create class');
    }
  });

  // Update class mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => classService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class updated successfully!');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to update class');
    }
  });

  // Delete class mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => classService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class deleted successfully!');
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to delete class');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      number_of_divisions: 1,
      department_id: ''
    });
    setSelectedClass(null);
  };

  const handleOpenModal = (classItem = null) => {
    if (classItem) {
      setSelectedClass(classItem);
      setFormData({
        name: classItem.name || '',
        number_of_divisions: classItem.number_of_divisions || 1,
        department_id: classItem.department_id || ''
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
    
    const submitData = {
      ...formData,
      department_id: formData.department_id || null
    };
    
    if (selectedClass) {
      updateMutation.mutate({ id: selectedClass.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (classItem) => {
    if (window.confirm(`Are you sure you want to delete "${classItem.name}"?`)) {
      deleteMutation.mutate(classItem.id);
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
  const totalClasses = classes?.length || 0;
  const totalDivisions = classes?.reduce((sum, cls) => sum + (cls.number_of_divisions || 0), 0) || 0;
  const avgDivisions = totalClasses > 0 ? Math.round((totalDivisions / totalClasses) * 10) / 10 : 0;

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
            Classes
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Manage academic classes and grade levels in your institution
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <AcademicCapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalClasses}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <UserGroupIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDivisions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Divisions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgDivisions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Divisions per Class</p>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {classes && classes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Class Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Divisions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {classes.map((classItem) => (
                    <tr key={classItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {classItem.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <UserGroupIcon className="h-3 w-3 mr-1" />
                          {classItem.number_of_divisions} {classItem.number_of_divisions === 1 ? 'Division' : 'Divisions'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {departments?.find(d => d.id === classItem.department_id)?.name || 'No Department'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleOpenModal(classItem)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(classItem)}
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
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No classes found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Start by creating classes for your institution. Each class can have multiple divisions.
              </p>
              <div className="mt-6">
                <Button onClick={() => handleOpenModal()}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Class
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Class Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedClass ? 'Edit Class' : 'Add Class'}
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
                  Class Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter class name (e.g., FY, SY, TY)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Divisions *
                </label>
                <input
                  type="number"
                  name="number_of_divisions"
                  value={formData.number_of_divisions}
                  onChange={handleInputChange}
                  className="input-field"
                  min="1"
                  max="10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select Department (Optional)</option>
                  {departments?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
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
                  {selectedClass ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
