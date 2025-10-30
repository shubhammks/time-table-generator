import api from './api';

export const timetableService = {
  // Generate timetable
  async generateTimetable(requestData) {
    try {
      const response = await api.post('/timetable/generate', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const dataService = {
  // Departments
  async getDepartments(params = {}) {
    try {
      const response = await api.get('/departments', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createDepartment(data) {
    try {
      const response = await api.post('/departments', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Teachers
  async getTeachers(params = {}) {
    try {
      const response = await api.get('/teachers', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createTeacher(data) {
    try {
      const response = await api.post('/teachers', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Classes
  async getClasses(params = {}) {
    try {
      const response = await api.get('/classes', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createClass(data) {
    try {
      const response = await api.post('/classes', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Divisions
  async getDivisions(params = {}) {
    try {
      const response = await api.get('/divisions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Subjects
  async getSubjects(params = {}) {
    try {
      const response = await api.get('/subjects', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createSubject(data) {
    try {
      const response = await api.post('/subjects', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Rooms
  async getRooms(params = {}) {
    try {
      const response = await api.get('/rooms', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createRoom(data) {
    try {
      const response = await api.post('/rooms', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Subject-Teacher Assignments
  async getSubjectTeacherAssignments(params = {}) {
    try {
      const response = await api.get('/subject-teachers', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createSubjectTeacherAssignment(data) {
    try {
      const response = await api.post('/subject-teachers', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async deleteSubjectTeacherAssignment(assignmentId) {
    try {
      const response = await api.delete(`/subject-teachers/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
