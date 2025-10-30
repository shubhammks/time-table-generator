import React, { useEffect, useState } from "react";
import axios from "axios";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("school");
  const [editId, setEditId] = useState(null);

  const API_URL = "http://127.0.0.1:8000/departments";

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(API_URL);
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Add or Update Department
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Update
        await axios.put(`${API_URL}/${editId}`, { name, type });
        setEditId(null);
      } else {
        // Create
        await axios.post(API_URL, { name, type });
      }
      setName("");
      setType("school");
      fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete department
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit department
  const handleEdit = (dep) => {
    setName(dep.name);
    setType(dep.type);
    setEditId(dep.id);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Departments</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Department Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="school">School</option>
          <option value="college">College</option>
        </select>
        <button type="submit">{editId ? "Update" : "Add"}</button>
      </form>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dep) => (
            <tr key={dep.id}>
              <td>{dep.id}</td>
              <td>{dep.name}</td>
              <td>{dep.type}</td>
              <td>
                <button onClick={() => handleEdit(dep)}>Edit</button>
                <button onClick={() => handleDelete(dep.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Departments;
