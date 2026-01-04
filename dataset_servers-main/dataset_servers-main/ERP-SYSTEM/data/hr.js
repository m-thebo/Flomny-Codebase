const { v4: uuidv4 } = require('uuid');

const employees = [
  {
    id: uuidv4(),
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@company.com',
    position: 'Sales Manager',
    department: 'Sales',
    hireDate: '2020-01-15',
    salary: 85000
  },
  {
    id: uuidv4(),
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@company.com',
    position: 'Procurement Specialist',
    department: 'Procurement',
    hireDate: '2021-03-10',
    salary: 65000
  },
  {
    id: uuidv4(),
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@company.com',
    position: 'Warehouse Manager',
    department: 'Inventory',
    hireDate: '2019-05-20',
    salary: 70000
  }
];

const payroll = [
  {
    id: uuidv4(),
    period: 'March 2023',
    processedDate: '2023-03-25',
    employees: employees.map(emp => ({
      employeeId: emp.id,
      grossAmount: emp.salary / 12,
      taxes: (emp.salary / 12) * 0.3,
      netAmount: (emp.salary / 12) * 0.7
    })),
    status: 'processed'
  },
  {
    id: uuidv4(),
    period: 'February 2023',
    processedDate: '2023-02-25',
    employees: employees.map(emp => ({
      employeeId: emp.id,
      grossAmount: emp.salary / 12,
      taxes: (emp.salary / 12) * 0.3,
      netAmount: (emp.salary / 12) * 0.7
    })),
    status: 'paid'
  }
];

module.exports = {
  employees,
  payroll
}; 