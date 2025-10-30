import React, { useEffect, useState } from "react";
import axios from "axios";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [editId, setEditId] = useState(null);

  const TEACHERS_API = "http://127.0.0.1:8000/teachers";
  const DEPARTMENTS_API = "http://127.0.0.1:8000/departments";

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(TEACHERS_API);
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all departments for dropdown
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(DEPARTMENTS_API);
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  // Add or Update teacher
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${TEACHERS_API}/${editId}`, { name, department_id: departmentId });
        setEditId(null);
      } else {
        await axios.post(TEACHERS_API, { name, department_id: departmentId });
      }
      setName("");
      setDepartmentId("");
      fetchTeachers();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete teacher
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${TEACHERS_API}/${id}`);
      fetchTeachers();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit teacher
  const handleEdit = (teacher) => {
    setName(teacher.name);
    setDepartmentId(teacher.department_id);
    setEditId(teacher.id);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Teachers</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Teacher Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          required
        >
          <option value="">Select Department</option>
          {departments.map((dep) => (
            <option key={dep.id} value={dep.id}>
              {dep.name}
            </option>
          ))}
        </select>
        <button type="submit">{editId ? "Update" : "Add"}</button>
      </form>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.name}</td>
              <td>{departments.find((d) => d.id === t.department_id)?.name || ""}</td>
              <td>
                <button onClick={() => handleEdit(t)}>Edit</button>
                <button onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Teachers;
