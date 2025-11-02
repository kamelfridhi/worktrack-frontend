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
    <div className="p-4 md:p-6">
      <button
        onClick={() => navigate('/projects')}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        {t('projectDetails.backToProjects')}
      </button>

      <div className="card mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{project.name}</h1>
        <p className="text-gray-600 mb-4 break-words">{project.description || t('projectDetails.noDescription')}</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-gray-500">
          <span>{t('projects.date')}: {new Date(project.date).toLocaleDateString()}</span>
          <span>{t('employeeDetails.totalHours')}: {totalHours.toFixed(2)}</span>
          <span>{t('sidebar.employees')}: {project.employee_projects?.length || 0}</span>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <h2 className="text-lg md:text-xl font-semibold">{t('projectDetails.assignedEmployees')}</h2>
          <button
            onClick={() => {
              setEditingHours(null);
              reset();
              setShowAddModal(true);
            }}
            className="btn-primary flex items-center justify-center w-full sm:w-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('projectDetails.addEmployee')}
          </button>
        </div>

        {project.employee_projects?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('projectDetails.noEmployees')}</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto -mx-6 md:mx-0">
              <div className="inline-block min-w-full align-middle">
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
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {project.employee_projects?.map((ep) => (
                <div key={ep.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{ep.employee_name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{ep.employee_phone_number}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={() => handleEditHours(ep)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        aria-label={t('projects.edit')}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHours(ep.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        aria-label={t('projects.delete')}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">{t('projectDetails.hoursWorked')}:</span>
                    <span className="text-sm font-medium text-gray-900">{ep.hours_worked} {t('employeeDetails.hours')}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-4 md:p-6 my-4">
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

