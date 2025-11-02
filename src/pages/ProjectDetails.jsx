import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHours, setEditingHours] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchProjectDetails();
    fetchEmployees();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${id}/`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/');
      setEmployees(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const onSubmitHours = async (data) => {
    try {
      if (editingHours) {
        await api.put(`/employeeprojects/${editingHours.id}/`, {
          employee: editingHours.employee_id,
          project: parseInt(id),
          hours_worked: parseFloat(data.hours_worked),
        });
      } else {
        await api.post('/employeeprojects/', {
          employee: parseInt(data.employee),
          project: parseInt(id),
          hours_worked: parseFloat(data.hours_worked),
        });
      }
      setShowAddModal(false);
      setEditingHours(null);
      reset();
      fetchProjectDetails();
    } catch (error) {
      console.error('Error saving hours:', error);
      alert(t('common.error') + ' ' + t('projectDetails.saveError'));
    }
  };

  const handleEditHours = (employeeProject) => {
    setEditingHours(employeeProject);
    reset({
      employee: employeeProject.employee_id,
      hours_worked: employeeProject.hours_worked,
    });
    setShowAddModal(true);
  };

  const handleDeleteHours = async (employeeProjectId) => {
    if (!confirm(t('common.confirm') + ' ' + t('projectDetails.removeEmployee') + '?')) return;

    try {
      await api.delete(`/employeeprojects/${employeeProjectId}/`);
      fetchProjectDetails();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert(t('common.error') + ' ' + t('projectDetails.removeError'));
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const totalHours = project.employee_projects?.reduce((sum, ep) => sum + ep.hours_worked, 0) || 0;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/projects')}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        {t('projectDetails.backToProjects')}
      </button>

      <div className="card mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
        <p className="text-gray-600 mb-4">{project.description || t('projectDetails.noDescription')}</p>
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <span>{t('projects.date')}: {new Date(project.date).toLocaleDateString()}</span>
          <span>{t('employeeDetails.totalHours')}: {totalHours.toFixed(2)}</span>
          <span>{t('sidebar.employees')}: {project.employee_projects?.length || 0}</span>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('projectDetails.assignedEmployees')}</h2>
          <button
            onClick={() => {
              setEditingHours(null);
              reset();
              setShowAddModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('projectDetails.addEmployee')}
          </button>
        </div>

        {project.employee_projects?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('projectDetails.noEmployees')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('projectDetails.employee')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('employees.phoneNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('projectDetails.hoursWorked')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('projectDetails.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {project.employee_projects?.map((ep) => (
                  <tr key={ep.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ep.employee_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ep.employee_phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ep.hours_worked} {t('employeeDetails.hours')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditHours(ep)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteHours(ep.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingHours ? t('projectDetails.editHours') : t('projectDetails.addEmployeeToProject')}
            </h2>
            <form onSubmit={handleSubmit(onSubmitHours)} className="space-y-4">
              <div>
                <label className="label">{t('projectDetails.employee')}</label>
                <select
                  {...register('employee', { required: t('projectDetails.employee') + ' ' + t('projects.required') })}
                  className="input-field"
                  disabled={!!editingHours}
                >
                  <option value="">{t('projectDetails.selectEmployee')}</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
                {errors.employee && (
                  <p className="mt-1 text-sm text-red-600">{errors.employee.message}</p>
                )}
              </div>

              <div>
                <label className="label">{t('projectDetails.hoursWorked')}</label>
                <input
                  {...register('hours_worked', {
                    required: t('projectDetails.hoursWorked') + ' ' + t('projects.required'),
                    min: { value: 0.1, message: t('projectDetails.minHours') },
                  })}
                  type="number"
                  step="0.1"
                  className="input-field"
                />
                {errors.hours_worked && (
                  <p className="mt-1 text-sm text-red-600">{errors.hours_worked.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingHours ? t('projects.update') : t('projectDetails.add')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingHours(null);
                    reset();
                  }}
                  className="btn-secondary flex-1"
                >
                  {t('projects.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

