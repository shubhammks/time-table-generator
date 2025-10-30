import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '../services/crudService';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Departments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'school',
    description: ''
  });

  const queryClient = useQueryClient();

  // Fetch departments
  const {
    data: departments,
    isLoading,
    error
  } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create department mutation
  const createMutation = useMutation({
    mutationFn: (data) => departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully!');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to create department');
    }
  });

  // Update department mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => departmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully!');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to update department');
    }
  });

  // Delete department mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => departmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully!');
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to delete department');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'school',
      description: ''
    });
    setSelectedDepartment(null);
  };

  const handleOpenModal = (department = null) => {
    if (department) {
      setSelectedDepartment(department);
      setFormData({
        name: department.name || '',
        code: department.code || '',
        type: department.type || 'school',
        description: department.description || ''
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
    
    if (selectedDepartment) {
      updateMutation.mutate({ id: selectedDepartment.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (department) => {
    if (window.confirm(`Are you sure you want to delete "${department.name}"?`)) {
      deleteMutation.mutate(department.id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter departments based on search
  const filteredDepartments = departments?.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.type?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load departments. Please try again.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['departments'] })} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Departments
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Manage academic departments in your institution
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search departments..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredDepartments.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Departments
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {filteredDepartments.filter(d => d.type === 'school').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                School Departments
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {filteredDepartments.filter(d => d.type === 'college').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                College Departments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDepartments.map((department) => (
          <div
            key={department.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className={`rounded-lg p-3 ${
                  department.type === 'college' 
                    ? 'bg-purple-100 dark:bg-purple-900'
                    : 'bg-blue-100 dark:bg-blue-900'
                }`}>
                  {department.type === 'college' ? (
                    <AcademicCapIcon className={`h-6 w-6 ${
                      department.type === 'college' 
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  ) : (
                    <BuildingOffice2Icon className={`h-6 w-6 ${
                      department.type === 'college' 
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(department)}
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(department)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  disabled={deleteMutation.isLoading}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {department.name}
              </h3>
              {department.code && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Code: {department.code}
                </p>
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                department.type === 'college'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {department.type === 'college' ? 'College' : 'School'}
              </span>
              
              {department.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                  {department.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No departments found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first department.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={() => handleOpenModal()}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedDepartment ? 'Edit Department' : 'Add Department'}
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
                  Department Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter department name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., CS, MATH, ENG"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="school">School</option>
                  <option value="college">College</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  placeholder="Enter department description"
                />
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
                  {selectedDepartment ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
