import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { Container, Typography, Button, Grid, Card, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [formData, setFormData] = useState({ name: '', logo: null });

  useEffect(() => {
    if (user.role === 'main_admin') {
      axios.get('/api/colleges/').then(res => setColleges(res.data));
    }
    if (user.role === 'college_admin' || user.role === 'main_admin') {
      axios.get('/api/departments/').then(res => setDepartments(res.data));
    }
    if (user.role === 'department_admin' || user.role === 'college_admin' || user.role === 'main_admin') {
      axios.get('/api/partnerships/').then(res => setPartnerships(res.data));
    }
  }, [user]);

  const handleFileChange = (e) => {
    setFormData({ ...formData, logo: e.target.files[0] });
  };

  const handleSubmitCollege = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('logo', formData.logo);
    try {
      await axios.post('/api/colleges/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('College added!');
    } catch (err) {
      alert('Error adding college');
    }
  };

  const handleSubmitDepartment = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('college', formData.college);  // Assuming you have a college selector
    formDataToSend.append('logo', formData.logo);
    try {
      await axios.post('/api/departments/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Department added!');
    } catch (err) {
      alert('Error adding department');
    }
  };

  const handleSubmitPartnership = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('status', formData.status);
    formDataToSend.append('department', formData.department);
    formDataToSend.append('logo', formData.logo);
    try {
      await axios.post('/api/partnerships/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Partnership added!');
    } catch (err) {
      alert('Error adding partnership');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Admin Dashboard</Typography>
      {user.role === 'main_admin' && (
        <Card sx={{ p: 3, mt: 2, boxShadow: 3 }}>
          <Typography variant="h6">Add College</Typography>
          <form onSubmit={handleSubmitCollege}>
            <TextField label="College Name" fullWidth onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Upload Logo
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {formData.logo && <Typography>{formData.logo.name}</Typography>}
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add College</Button>
          </form>
        </Card>
      )}
      {(user.role === 'college_admin' || user.role === 'main_admin') && (
        <Card sx={{ p: 3, mt: 2, boxShadow: 3 }}>
          <Typography variant="h6">Add Department</Typography>
          <form onSubmit={handleSubmitDepartment}>
            <TextField label="Department Name" fullWidth onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>College</InputLabel>
              <Select onChange={(e) => setFormData({ ...formData, college: e.target.value })}>
                {colleges.map(col => <MenuItem key={col.id} value={col.id}>{col.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Upload Logo
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add Department</Button>
          </form>
        </Card>
      )}
      {(user.role === 'department_admin' || user.role === 'college_admin' || user.role === 'main_admin') && (
        <Card sx={{ p: 3, mt: 2, boxShadow: 3 }}>
          <Typography variant="h6">Add Partnership</Typography>
          <form onSubmit={handleSubmitPartnership}>
            <TextField label="Partnership Name" fullWidth onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={4} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Department</InputLabel>
              <Select onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                {departments.map(dep => <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Upload Logo
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add Partnership</Button>
          </form>
        </Card>
      )}
      {/* Display lists for editing/deleting if needed */}
    </Container>
  );
}

export default AdminDashboard;