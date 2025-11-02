import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { PencilIcon, TrashIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees/');
      setEmployees(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}/`, data);
      } else {
        await api.post('/employees/', data);
      }
      setShowModal(false);
      setEditingEmployee(null);
      reset();
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert(t('common.error') + ' ' + t('employees.saveError'));
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    reset({
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone_number: employee.phone_number,
      role: employee.role,
      hourly_rate: employee.hourly_rate || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.confirm') + ' ' + t('employees.deleteEmployee') + '?')) return;

    try {
      await api.delete(`/employees/${id}/`);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert(t('common.error') + ' ' + t('employees.deleteError'));
    }
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    reset({
      first_name: '',
      last_name: '',
      phone_number: '',
      role: '',
      hourly_rate: '',
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('employees.title')}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {employees.length} {t('employees.title').toLowerCase()}{employees.length !== 1 ? 's' : ''} {t('employees.total')}
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('employees.addEmployee')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('employees.noEmployees')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('employees.getStarted')}</p>
          <div className="mt-6">
            <button onClick={openCreateModal} className="btn-primary">
              {t('employees.addEmployee')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/employees/${employee.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{employee.role}</p>
                  <p className="mt-1 text-sm text-gray-500">{employee.phone_number}</p>
                  {employee.hourly_rate && (
                    <p className="mt-2 text-sm font-medium text-green-600">
                      €{parseFloat(employee.hourly_rate).toFixed(2)}/hour
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(employee);
                  }}
                  className="flex-1 btn-secondary flex items-center justify-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  {t('employees.edit')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(employee.id);
                  }}
                  className="flex-1 btn-danger flex items-center justify-center"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  {t('employees.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingEmployee ? t('employees.editEmployee') : t('employees.addEmployee')}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">{t('employees.firstName')}</label>
                <input
                  {...register('first_name', { required: t('employees.firstName') + ' ' + t('projects.required') })}
                  type="text"
                  className="input-field"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="label">{t('employees.lastName')}</label>
                <input
                  {...register('last_name', { required: t('employees.lastName') + ' ' + t('projects.required') })}
                  type="text"
                  className="input-field"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>

              <div>
                <label className="label">{t('employees.phoneNumber')}</label>
                <input
                  {...register('phone_number', { required: t('employees.phoneNumber') + ' ' + t('projects.required') })}
                  type="text"
                  className="input-field"
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>
                )}
              </div>

              <div>
                <label className="label">{t('employees.role')}</label>
                <input
                  {...register('role', { required: t('employees.role') + ' ' + t('projects.required') })}
                  type="text"
                  className="input-field"
                />
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="label">{t('employees.hourlyRate')}</label>
                <input
                  {...register('hourly_rate')}
                  type="number"
                  step="0.01"
                  className="input-field"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingEmployee ? t('employees.update') : t('employees.create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEmployee(null);
                    reset();
                  }}
                  className="btn-secondary flex-1"
                >
                  {t('employees.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

