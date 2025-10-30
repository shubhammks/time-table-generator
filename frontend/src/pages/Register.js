import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'teacher'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    
    try {
      await register(formData);
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ 
        general: error?.detail || error?.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Register</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create your account
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="text-sm text-red-700 dark:text-red-200">
                {errors.general}
              </div>
            </div>
          )}
          
          <div>
            <input
              name="full_name"
              type="text"
              placeholder="Full Name"
              className={`input-field ${
                errors.full_name ? 'border-red-300 dark:border-red-600' : ''
              }`}
              value={formData.full_name}
              onChange={handleChange}
              required
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.full_name}</p>
            )}
          </div>
          
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              className={`input-field ${
                errors.email ? 'border-red-300 dark:border-red-600' : ''
              }`}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>
          
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className={`input-field ${
                errors.password ? 'border-red-300 dark:border-red-600' : ''
              }`}
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>
          
          <div>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              className={`input-field ${
                errors.confirmPassword ? 'border-red-300 dark:border-red-600' : ''
              }`}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>
          
          <select
            name="role"
            className="input-field"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="teacher">Teacher</option>
            <option value="admin">Administrator</option>
          </select>
          
          <Button type="submit" loading={loading} className="w-full">
            Register
          </Button>
        </form>
        
        <div className="text-center">
          <Link to="/login" className="text-primary-600 hover:text-primary-500">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
