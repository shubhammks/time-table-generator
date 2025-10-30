import api from './api';

// Generic CRUD service factory
const createCrudService = (baseEndpoint) => ({
  // Get all items with optional query parameters
  async getAll(params = {}) {
    try {
      const response = await api.get(baseEndpoint, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single item by ID
  async getById(id) {
    try {
      const response = await api.get(`${baseEndpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new item
  async create(data) {
    try {
      const response = await api.post(baseEndpoint, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update existing item
  async update(id, data) {
    try {
      const response = await api.put(`${baseEndpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete item
  async delete(id) {
    try {
      const response = await api.delete(`${baseEndpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk delete
  async bulkDelete(ids) {
    try {
      const response = await api.post(`${baseEndpoint}/bulk-delete`, { ids });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
});

// Create service instances for each entity
export const departmentService = createCrudService('/departments');
export const teacherService = createCrudService('/teachers');
export const subjectService = createCrudService('/subjects');
export const classService = createCrudService('/classes');
export const divisionService = createCrudService('/divisions');
export const batchService = createCrudService('/batches');
export const roomService = createCrudService('/rooms');
export const userService = createCrudService('/users');

// Extended services with specific functionality
export const extendedTeacherService = {
  ...teacherService,
  
  // Get teacher availability
  async getAvailability(teacherId) {
    try {
      const response = await api.get(`/teachers/${teacherId}/availability`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update teacher availability
  async updateAvailability(teacherId, availability) {
    try {
      const response = await api.put(`/teachers/${teacherId}/availability`, availability);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher's subjects
  async getSubjects(teacherId) {
    try {
      const response = await api.get(`/teachers/${teacherId}/subjects`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export const extendedSubjectService = {
  ...subjectService,

  // Assign teacher to subject
  async assignTeacher(subjectId, teacherId, data = {}) {
    try {
      const response = await api.post(`/subjects/${subjectId}/teachers/${teacherId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove teacher from subject
  async removeTeacher(subjectId, teacherId) {
    try {
      const response = await api.delete(`/subjects/${subjectId}/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get subject teachers
  async getTeachers(subjectId) {
    try {
      const response = await api.get(`/subjects/${subjectId}/teachers`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export const extendedDivisionService = {
  ...divisionService,

  // Get division's timetable
  async getTimetable(divisionId) {
    try {
      const response = await api.get(`/divisions/${divisionId}/timetable`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get division students count
  async getStudentsCount(divisionId) {
    try {
      const response = await api.get(`/divisions/${divisionId}/students-count`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Schedule entries UI removed: the following service was deprecated and removed

// Timetable service with generation capabilities
export const timetableService = {
  // Override generic CRUD methods to use correct timetable endpoints
  async getAll(params = {}) {
    try {
      const response = await api.get('/timetable/list', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/timetable/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/timetable/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Generate new timetable
  async generateTimetable(requestData) {
    try {
      const response = await api.post('/timetable/generate', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get timetable with schedule entries
  async getWithSchedule(id) {
    try {
      // First get the timetable details
      const timetableResponse = await api.get(`/timetable/${id}`);
      const timetable = timetableResponse.data;
      
      // Then get the schedule entries with related data
      const scheduleResponse = await api.get(`/timetable/${id}/grid`);
      const scheduleData = scheduleResponse.data;
      
      // Convert grid format to flat array for easier processing
      const scheduleEntries = [];
      if (scheduleData.grid) {
        Object.entries(scheduleData.grid).forEach(([day, periods]) => {
          Object.entries(periods).forEach(([period, entry]) => {
            scheduleEntries.push({
              day_index: scheduleData.days.indexOf(day),
              period_index: parseInt(period),
              day: day,
              period: period,
              subject_name: entry.subject?.name || 'N/A',
              teacher_name: entry.teacher?.name || 'N/A',
              room_number: entry.room?.room_number || 'N/A',
              division_name: entry.division?.name || 'N/A',
              batch_number: entry.batch?.number || null,
              ...entry
            });
          });
        });
      }
      
      // Combine the data
      return {
        ...timetable,
        schedule_entries: scheduleEntries,
        grid: scheduleData.grid,
        days: scheduleData.days
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Publish timetable
  async publish(id) {
    try {
      const response = await api.post(`/timetable/${id}/publish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Unpublish timetable (Note: Backend doesn't have this endpoint, but keeping for future use)
  async unpublish(id) {
    try {
      const response = await api.put(`/timetables/${id}/unpublish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Dashboard service
export const scheduleEntryService = createCrudService('/schedule-entries');

export const dashboardService = {
  // Get dashboard statistics
  async getStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get recent activities
  async getRecentActivities() {
    try {
      const response = await api.get('/dashboard/recent-activities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get system health
  async getSystemHealth() {
    try {
      const response = await api.get('/dashboard/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
