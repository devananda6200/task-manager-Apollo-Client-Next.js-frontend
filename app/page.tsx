'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

// --- Styles ---
const containerStyle = {
  maxWidth: '700px',
  margin: '2rem auto',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  color: '#333',
};

const headingStyle = {
  textAlign: 'center' as const,
  color: '#4a90e2',
  marginBottom: '1.5rem',
};

const filterStyle = {
  marginBottom: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const formStyle = {
  backgroundColor: '#f7f9fc',
  padding: '1.5rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  marginBottom: '2rem',
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.5rem',
  marginBottom: '1rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '1rem',
};

const buttonStyle = {
  backgroundColor: '#4a90e2',
  color: 'white',
  border: 'none',
  padding: '0.7rem 1.2rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '1rem',
};

const taskItemStyle = {
  padding: '1rem',
  borderBottom: '1px solid #ddd',
};

const taskTitleStyle = {
  fontSize: '1.1rem',
  fontWeight: '700',
  color: '#222',
};

const taskStatusStyle = {
  fontStyle: 'italic',
  color: '#666',
  marginLeft: '0.5rem',
};

const taskDueDateStyle = {
  float: 'right' as const,
  fontSize: '0.9rem',
  color: '#999',
};

const taskDescStyle = {
  marginTop: '0.3rem',
  fontSize: '1rem',
  color: '#444',
};

// --- GraphQL Queries & Mutations ---
const GET_ALL_TASKS = gql`
  query getAllTasks {
    getAllTasks {
      id
      title
      description
      status
      dueDate
    }
  }
`;

const GET_TASKS_BY_STATUS = gql`
  query getTasksByStatus($status: String!) {
    getTasksByStatus(status: $status) {
      id
      title
      description
      status
      dueDate
    }
  }
`;

const GET_ALL_STATUSES = gql`
  query getAllStatuses {
    getAllStatuses
  }
`;

const ADD_TASK = gql`
  mutation addTask($title: String!, $description: String, $status: String!, $dueDate: String) {
    addTask(title: $title, description: $description, status: $status, dueDate: $dueDate) {
      id
      title
      description
      status
      dueDate
    }
  }
`;

const UPDATE_TASK_STATUS = gql`
  mutation updateTaskStatus($id: ID!, $status: String!) {
    updateTaskStatus(id: $id, status: $status) {
      id
      title
      status
    }
  }
`;

export default function TaskListPage() {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: '',
    dueDate: '',
  });

  const { data: statusData, loading: statusLoading, error: statusError } = useQuery(GET_ALL_STATUSES);

  const {
    loading,
    error,
    data,
    refetch,
  } = useQuery(statusFilter === 'All' ? GET_ALL_TASKS : GET_TASKS_BY_STATUS, {
    variables: statusFilter === 'All' ? {} : { status: statusFilter },
  });

  const [addTask] = useMutation(ADD_TASK, {
    onCompleted: () => {
      refetch();
      setNewTask({ title: '', description: '', status: '', dueDate: '' });
    },
  });

  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS, {
    onCompleted: () => {
      refetch();
    },
  });

  function handleFilterChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    setStatusFilter(value);
    refetch(value === 'All' ? {} : { status: value });
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  }

  function handleAddTask(event: React.FormEvent) {
    event.preventDefault();
    if (!newTask.title.trim() || !newTask.status.trim()) {
      alert('Please provide both title and status for the task.');
      return;
    }
    addTask({ variables: newTask });
  }

  if (loading || statusLoading) return <p>Loading tasks...</p>;
  if (error || statusError) return <p>Error loading data.</p>;

  const tasks = (statusFilter === 'All' ? data.getAllTasks : data.getTasksByStatus)?.slice().sort((a: any, b: any) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const statusOptions = statusData?.getAllStatuses || [];

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Task List</h1>

      <div style={filterStyle}>
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select id="statusFilter" onChange={handleFilterChange} value={statusFilter} style={inputStyle}>
          <option value="All">All</option>
          {statusOptions.map((status: string) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleAddTask} style={formStyle}>
        <h2>Add New Task</h2>

        <input
          name="title"
          placeholder="Title"
          value={newTask.title}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={newTask.description}
          onChange={handleInputChange}
          style={{ ...inputStyle, height: '60px', resize: 'vertical' }}
        />

        <select name="status" value={newTask.status} onChange={handleInputChange} required style={inputStyle}>
          <option value="" disabled>
            Select status
          </option>
          {statusOptions.map((status: string) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="dueDate"
          value={newTask.dueDate}
          onChange={handleInputChange}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Add Task
        </button>
      </form>

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {tasks.map((task: any) => (
          <li key={task.id} style={taskItemStyle}>
            <span style={taskTitleStyle}>{task.title}</span>
            <span style={taskStatusStyle}> — {task.status}</span>
            <span style={taskDueDateStyle}>
              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
            </span>
            <p style={taskDescStyle}>{task.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
