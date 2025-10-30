import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { batchService, divisionService, classService } from '../services/crudService';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import {
  PlusIcon,
  UsersIcon,
  QueueListIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Batches = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formData, setFormData] = useState({
    number: 1,
    division_id: ''
  });

  const queryClient = useQueryClient();

  // Fetch batches
  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Fetch divisions for dropdown
  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => divisionService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Fetch classes for reference
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Create batch mutation
  const createMutation = useMutation({
    mutationFn: (data) => batchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch created successfully!');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to create batch');
    }
  });

  // Update batch mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => batchService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch updated successfully!');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to update batch');
    }
  });

  // Delete batch mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => batchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch deleted successfully!');
    },
    onError: (error) => {
      toast.error(error?.detail || 'Failed to delete batch');
    }
  });

  const resetForm = () => {
    setFormData({
      number: 1,
      division_id: ''
    });
    setSelectedBatch(null);
  };

  const handleOpenModal = (batch = null) => {
    if (batch) {
      setSelectedBatch(batch);
      setFormData({
        number: batch.number || 1,
        division_id: batch.division_id || ''
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
    
    if (selectedBatch) {
      updateMutation.mutate({ id: selectedBatch.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (batch) => {
    if (window.confirm(`Are you sure you want to delete "Batch ${batch.number}"?`)) {
      deleteMutation.mutate(batch.id);
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
  const totalBatches = batches?.length || 0;
  const activeBatches = batches?.length || 0; // Assuming all are active
  const avgBatchSize = totalBatches > 0 ? Math.round(25) : 0; // Mock average batch size

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
            Batches
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Manage student batches for practical sessions and labs
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Batch
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <QueueListIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBatches}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Batches</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <UsersIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeBatches}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Batches</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgBatchSize}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Batch Size</p>
            </div>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {batches && batches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Batch Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Division
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
                  {batches.map((batch) => {
                    const division = divisions?.find(d => d.id === batch.division_id);
                    const batchClass = classes?.find(c => c.id === division?.class_id);
                    return (
                      <tr key={batch.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <QueueListIcon className="h-5 w-5 text-blue-500 mr-2" />
                            Batch {batch.number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {division?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {batchClass?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleOpenModal(batch)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(batch)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteMutation.isLoading}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <QueueListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No batches found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Batches are used to divide divisions for practical sessions, labs, and tutorials. They help manage smaller groups effectively.
              </p>
              <div className="mt-6">
                <Button onClick={() => handleOpenModal()}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Batch
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedBatch ? 'Edit Batch' : 'Add Batch'}
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
                  Batch Number *
                </label>
                <input
                  type="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="input-field"
                  min="1"
                  max="10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Division *
                </label>
                <select
                  name="division_id"
                  value={formData.division_id}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Division</option>
                  {divisions?.map((division) => {
                    const divisionClass = classes?.find(c => c.id === division.class_id);
                    return (
                      <option key={division.id} value={division.id}>
                        {division.name} ({divisionClass?.name})
                      </option>
                    );
                  })}
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
                  {selectedBatch ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;
