import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/crudService';
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  BuildingOffice2Icon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  CalendarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load home data:', error);
      // Set default values if API fails
      setStats({
        departments: 0,
        teachers: 0,
        subjects: 0,
        classes: 0,
        timetables: 0,
        schedule_entries: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Departments',
      value: stats?.departments || 0,
      icon: BuildingOffice2Icon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/departments'
    },
    {
      title: 'Teachers',
      value: stats?.teachers || 0,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/teachers'
    },
    {
      title: 'Subjects',
      value: stats?.subjects || 0,
      icon: BookOpenIcon,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/subjects'
    },
    {
      title: 'Classes',
      value: stats?.classes || 0,
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/classes'
    }
  ];

  const quickActions = [
    {
      title: 'Add Department',
      description: 'Create a new academic department',
      icon: BuildingOffice2Icon,
      href: '/departments',
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
    },
    {
      title: 'Add Teacher',
      description: 'Register a new teacher profile',
      icon: UserGroupIcon,
      href: '/teachers',
      color: 'bg-green-100 hover:bg-green-200 text-green-700'
    },
    {
      title: 'Generate Timetable',
      description: 'Create automated timetable',
      icon: CalendarIcon,
      href: '/timetables/generate',
      color: 'bg-purple-100 hover:bg-purple-200 text-purple-700'
    },
    {
      title: 'View Reports',
      description: 'Analytics and insights',
      icon: ChartBarIcon,
      href: '/reports',
      color: 'bg-orange-100 hover:bg-orange-200 text-orange-700'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Timetable Management System
          </h1>
          <p className="text-lg opacity-90 mb-6">
            Streamline your institution's scheduling with our intelligent timetable generation system.
            Manage departments, teachers, subjects, and create conflict-free timetables effortlessly.
          </p>
          <div className="flex space-x-4">
            <Link
              to="/timetables/generate"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Generate Timetable
            </Link>
            <Link
              to="/dashboard"
              className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          System Overview
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.href}
                className={`${card.bgColor} rounded-lg p-6 hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${card.textColor} opacity-75`}>
                      {card.title}
                    </p>
                    <p className={`text-3xl font-bold ${card.textColor}`}>
                      {card.value}
                    </p>
                  </div>
                  <div className={`${card.color} rounded-full p-3`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className={`${action.color} rounded-lg p-6 transition-colors duration-200`}
              >
                <div className="flex items-center mb-4">
                  <Icon className="h-8 w-8 mr-3" />
                  <h3 className="text-lg font-semibold">{action.title}</h3>
                </div>
                <p className="text-sm opacity-75">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4">
            <div className="bg-primary-100 rounded-lg p-3">
              <ClockIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Automated Scheduling
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate optimal timetables using constraint satisfaction algorithms
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-green-100 rounded-lg p-3">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Teacher Management
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage teacher profiles, availability, and subject assignments
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-yellow-100 rounded-lg p-3">
              <BookOpenIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Subject Planning
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Organize subjects with credits, duration, and teaching requirements
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <AcademicCapIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Class Organization
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage classes, divisions, and student groupings effectively
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-red-100 rounded-lg p-3">
              <ArrowTrendingUpIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Analytics & Reports
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track performance and optimize scheduling with detailed insights
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-indigo-100 rounded-lg p-3">
              <ChartBarIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Resource Management
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Efficiently allocate rooms, labs, and other resources
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Begin by setting up your institution's basic information, then add departments,
            teachers, and subjects to start generating automated timetables.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/departments"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Setup Departments
            </Link>
            <Link
              to="/teachers"
              className="border border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              Add Teachers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
