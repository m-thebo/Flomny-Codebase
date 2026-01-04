const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { employees, payroll } = require('../data/hr');

// GET /hr/employees
router.get('/employees', (req, res) => {
  // Support filtering by department
  if (req.query.department) {
    const filteredEmployees = employees.filter(e => e.department === req.query.department);
    return res.json(filteredEmployees);
  }
  
  res.json(employees);
});

// POST /hr/employees
router.post('/employees', (req, res) => {
  const { firstName, lastName, position, department, salary, ...employeeData } = req.body;
  
  // Validate required fields
  if (!firstName || !lastName || !position || !department || !salary) {
    return res.status(400).json({ 
      message: 'First name, last name, position, department and salary are required'
    });
  }
  
  const newEmployee = {
    id: uuidv4(),
    firstName,
    lastName,
    position,
    department,
    salary: parseFloat(salary),
    hireDate: new Date().toISOString().split('T')[0],
    ...employeeData,
    createdAt: new Date().toISOString()
  };
  
  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

// GET /hr/employees/{employeeId}
router.get('/employees/:employeeId', (req, res) => {
  const employee = employees.find(e => e.id === req.params.employeeId);
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }
  res.json(employee);
});

// GET /hr/payroll
router.get('/payroll', (req, res) => {
  // Support filtering by period
  if (req.query.period) {
    const filteredPayroll = payroll.filter(p => p.period === req.query.period);
    return res.json(filteredPayroll);
  }
  
  // Support filtering by status
  if (req.query.status) {
    const filteredPayroll = payroll.filter(p => p.status === req.query.status);
    return res.json(filteredPayroll);
  }
  
  res.json(payroll);
});

// POST /hr/payroll/run
router.post('/payroll/run', (req, res) => {
  const { period, taxRate, ...payrollData } = req.body;
  
  // Validate required fields
  if (!period) {
    return res.status(400).json({ message: 'Period is required' });
  }
  
  // Check if payroll for this period already exists
  const existingPayroll = payroll.find(p => p.period === period);
  if (existingPayroll) {
    return res.status(400).json({ message: 'Payroll for this period already exists' });
  }
  
  const effectiveTaxRate = taxRate || 0.3; // Default tax rate if not provided
  
  // Calculate payroll for all employees
  const employeesPayroll = employees.map(emp => ({
    employeeId: emp.id,
    name: `${emp.firstName} ${emp.lastName}`,
    department: emp.department,
    position: emp.position,
    grossAmount: emp.salary / 12, // Monthly salary
    taxes: (emp.salary / 12) * effectiveTaxRate,
    netAmount: (emp.salary / 12) * (1 - effectiveTaxRate)
  }));
  
  const newPayroll = {
    id: uuidv4(),
    period,
    processedDate: new Date().toISOString(),
    employees: employeesPayroll,
    status: 'processed',
    totalGross: employeesPayroll.reduce((sum, e) => sum + e.grossAmount, 0),
    totalTaxes: employeesPayroll.reduce((sum, e) => sum + e.taxes, 0),
    totalNet: employeesPayroll.reduce((sum, e) => sum + e.netAmount, 0),
    ...payrollData,
    createdAt: new Date().toISOString()
  };
  
  payroll.push(newPayroll);
  res.status(201).json(newPayroll);
});

module.exports = router; 