import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const depRes = await axios.get("http://127.0.0.1:8000/departments");
      setDepartments(depRes.data);

      const teacherRes = await axios.get("http://127.0.0.1:8000/teachers");
      setTeachers(teacherRes.data);

      const classRes = await axios.get("http://127.0.0.1:8000/classes");
      setClasses(classRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      <h2>Departments</h2>
      <ul>
        {departments.map(dep => <li key={dep.id}>{dep.name} ({dep.type})</li>)}
      </ul>

      <h2>Teachers</h2>
      <ul>
        {teachers.map(teacher => <li key={teacher.id}>{teacher.name}</li>)}
      </ul>

      <h2>Classes</h2>
      <ul>
        {classes.map(cls => <li key={cls.id}>{cls.name}</li>)}
      </ul>
    </div>
  );
};

export default Dashboard;
