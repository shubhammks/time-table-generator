import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { timetableService, classService } from '../services/crudService';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import {
  PlusIcon,
  CalendarIcon,
  SparklesIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const Timetables = () => {
  const navigate = useNavigate();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetableName, setTimetableName] = useState('');
  const [generationOptions, setGenerationOptions] = useState({
    optimize_for: 'balanced',
    allow_conflicts: false
  });

  const queryClient = useQueryClient();

  // Fetch timetables
  const { data: timetables, isLoading } = useQuery({
    queryKey: ['timetables'],
    queryFn: () => timetableService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Fetch classes for dropdown
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Generate timetable mutation
  const generateMutation = useMutation({
    mutationFn: ({ classId, name, options }) => {
      return timetableService.generateTimetable(classId, { name, ...options });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      toast.success('Timetable generated successfully!');
      resetGenerateForm();
      setShowGenerateModal(false);
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to generate timetable');
    }
  });

  // Publish timetable mutation
  const publishMutation = useMutation({
    mutationFn: (id) => timetableService.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      toast.success('Timetable published successfully!');
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to publish timetable');
    }
  });

  // Unpublish timetable mutation
  const unpublishMutation = useMutation({
    mutationFn: (id) => timetableService.unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      toast.success('Timetable unpublished successfully!');
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to unpublish timetable');
    }
  });

  // Delete timetable mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => timetableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      toast.success('Timetable deleted successfully!');
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to delete timetable');
    }
  });

  const resetGenerateForm = () => {
    setSelectedClass('');
    setTimetableName('');
    setGenerationOptions({
      optimize_for: 'balanced',
      allow_conflicts: false
    });
  };

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    if (!selectedClass || !timetableName.trim()) {
      toast.error('Please select a class and enter a timetable name');
      return;
    }
    
    generateMutation.mutate({
      classId: selectedClass,
      name: timetableName.trim(),
      options: generationOptions
    });
  };

  const handlePublishToggle = (timetable) => {
    if (timetable.is_published) {
      unpublishMutation.mutate(timetable.id);
    } else {
      publishMutation.mutate(timetable.id);
    }
  };

  const handleDelete = (timetable) => {
    if (window.confirm(`Are you sure you want to delete "${timetable.name}"?`)) {
      deleteMutation.mutate(timetable.id);
    }
  };

  // Calculate stats
  const totalTimetables = timetables?.length || 0;
  const publishedTimetables = timetables?.filter(t => t.is_published)?.length || 0;
  const draftTimetables = totalTimetables - publishedTimetables;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Timetables
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Generate, edit, publish, and delete timetables for your institution
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button 
            onClick={() => navigate('/timetables/generate')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Advanced Generate
          </Button>
          <Button 
            onClick={() => setShowGenerateModal(true)}
            variant="secondary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Quick Generate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTimetables}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Timetables</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{publishedTimetables}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{draftTimetables}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timetables Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {timetables && timetables.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timetable Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {timetables.map((timetable) => {
                    const timetableClass = classes?.find(c => c.id === timetable.class_id);
                    return (
                      <tr key={timetable.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                              <button
                                onClick={() => navigate(`/timetables/${timetable.id}`)}
                                className="text-blue-600 hover:underline dark:text-blue-400"
                                title="Open timetable"
                              >
                                {timetable.name}
                              </button>
                            </div>
                            <button
                              onClick={() => navigate(`/timetables/${timetable.id}`)}
                              className="mt-1 text-xs text-blue-600 hover:underline text-left dark:text-blue-400"
                              title="View details"
                            >
                              View details
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <AcademicCapIcon className="h-4 w-4 mr-1" />
                            {timetableClass?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              timetable.is_published
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {timetable.is_published ? (
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                              ) : (
                                <ClockIcon className="h-3 w-3 mr-1" />
                              )}
                              {timetable.is_published ? 'Published' : 'Draft'}
                            </span>
                            <button
                              onClick={() => navigate(`/timetables/${timetable.id}`)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
                              title="View timetable details"
                            >
                              <EyeIcon className="h-3 w-3 mr-1" />
                              View Schedule
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {timetable.created_at ? new Date(timetable.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => navigate(`/timetables/${timetable.id}`)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                            title="View Timetable"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button 
                            onClick={() => handlePublishToggle(timetable)}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                              timetable.is_published 
                                ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30' 
                                : 'text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              timetable.is_published ? 'focus:ring-yellow-500' : 'focus:ring-green-500'
                            }`}
                            title={timetable.is_published ? 'Unpublish' : 'Publish'}
                            disabled={publishMutation.isLoading || unpublishMutation.isLoading}
                          >
                            {timetable.is_published ? (
                              <><XCircleIcon className="h-4 w-4 mr-1" />Unpublish</>
                            ) : (
                              <><CheckCircleIcon className="h-4 w-4 mr-1" />Publish</>
                            )}
                          </button>
                          <button 
                            onClick={() => handleDelete(timetable)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                            title="Delete Timetable"
                            disabled={deleteMutation.isLoading}
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No timetables found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create your first timetable to get started.
                </p>
                <div className="mt-6">
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => navigate('/timetables/generate')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Advanced Generator
                    </Button>
                    <Button 
                      onClick={() => setShowGenerateModal(true)}
                      variant="secondary"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Quick Generate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Timetable Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-purple-500" />
                Generate Timetable
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timetable Name *
                </label>
                <input
                  type="text"
                  value={timetableName}
                  onChange={(e) => setTimetableName(e.target.value)}
                  className="input-field"
                  placeholder="Enter timetable name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class *
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Class</option>
                  {classes?.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.number_of_divisions} divisions)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Optimization *
                </label>
                <select
                  value={generationOptions.optimize_for}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, optimize_for: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="balanced">Balanced Distribution</option>
                  <option value="teacher_preference">Teacher Preference</option>
                  <option value="room_utilization">Room Utilization</option>
                  <option value="student_load">Student Load</option>
                </select>
              </div>

              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generationOptions.allow_conflicts}
                    onChange={(e) => setGenerationOptions(prev => ({ ...prev, allow_conflicts: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`flex items-center justify-center w-5 h-5 rounded border-2 mr-3 ${
                    generationOptions.allow_conflicts 
                      ? 'border-primary-500 bg-primary-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {generationOptions.allow_conflicts && (
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Allow Minor Conflicts</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow generation even if there are minor scheduling conflicts
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ⚡ Generation may take a few minutes depending on complexity. Please be patient.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={generateMutation.isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {generateMutation.isLoading ? 'Generating...' : 'Generate Timetable'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Timetables;
