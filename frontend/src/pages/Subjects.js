import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectService, classService } from '../services/crudService';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import {
  PlusIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  BeakerIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Subjects = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'lecture',
    hours_per_week: 4,
    class_id: '',
    can_be_twice_in_day: false
  });

  const queryClient = useQueryClient();

  // Fetch subjects
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Fetch classes for dropdown
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Create subject mutation
  const createMutation = useMutation({
    mutationFn: (data) => subjectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully!');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to create subject');
    }
  });

  // Update subject mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => subjectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully!');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to update subject');
    }
  });

  // Delete subject mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => subjectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully!');
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to delete subject');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'lecture',
      hours_per_week: 4,
      class_id: '',
      can_be_twice_in_day: false
    });
    setSelectedSubject(null);
  };

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setSelectedSubject(subject);
      setFormData({
        name: subject.name || '',
        type: subject.type || 'lecture',
        hours_per_week: subject.hours_per_week || 4,
        class_id: subject.class_id || '',
        can_be_twice_in_day: subject.can_be_twice_in_day || false
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
    
    if (selectedSubject) {
      updateMutation.mutate({ id: selectedSubject.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (subject) => {
    if (window.confirm(`Are you sure you want to delete "${subject.name}"?`)) {
      deleteMutation.mutate(subject.id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Calculate stats
  const totalSubjects = subjects?.length || 0;
  const theorySubjects = subjects?.filter(s => s.type === 'lecture')?.length || 0;
  const labSubjects = subjects?.filter(s => s.type === 'lab')?.length || 0;

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
            Subjects
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Manage academic subjects and curriculum in your institution
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSubjects}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Subjects</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <AcademicCapIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{theorySubjects}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Theory Subjects</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <BeakerIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{labSubjects}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lab Subjects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {subjects && subjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Subject Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Hours/Week
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Double Periods
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {subject.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subject.type === 'lecture' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : subject.type === 'lab'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {subject.type === 'lecture' && <AcademicCapIcon className="h-3 w-3 mr-1" />}
                          {subject.type === 'lab' && <BeakerIcon className="h-3 w-3 mr-1" />}
                          {subject.type === 'tutorial' && <BookOpenIcon className="h-3 w-3 mr-1" />}
                          {subject.type.charAt(0).toUpperCase() + subject.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {subject.hours_per_week} hours
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {classes?.find(c => c.id === subject.class_id)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {subject.can_be_twice_in_day ? (
                          <span className="text-green-600 dark:text-green-400">✓ Allowed</span>
                        ) : (
                          <span className="text-gray-400">✗ Not Allowed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleOpenModal(subject)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(subject)}
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
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No subjects found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Start by creating subjects for your curriculum. You can add theory subjects, lab sessions, and tutorials.
              </p>
              <div className="mt-6">
                <Button onClick={() => handleOpenModal()}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Subject
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedSubject ? 'Edit Subject' : 'Add Subject'}
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
                  Subject Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter subject name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hours Per Week *
                </label>
                <input
                  type="number"
                  name="hours_per_week"
                  value={formData.hours_per_week}
                  onChange={handleInputChange}
                  className="input-field"
                  min="1"
                  max="20"
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

              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="can_be_twice_in_day"
                    checked={formData.can_be_twice_in_day}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`flex items-center justify-center w-5 h-5 rounded border-2 mr-3 ${
                    formData.can_be_twice_in_day 
                      ? 'border-primary-500 bg-primary-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {formData.can_be_twice_in_day && (
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Allow Double Periods</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow this subject to have consecutive periods in a day
                    </p>
                  </div>
                </label>
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
                  {selectedSubject ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
