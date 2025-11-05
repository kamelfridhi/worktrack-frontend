import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { PencilIcon, TrashIcon, PlusIcon, UserIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
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
      const fetchedEmployees = response.data.results || response.data;
      setAllEmployees(fetchedEmployees);
      setEmployees(fetchedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique roles for filter
  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(allEmployees.map(emp => emp.role).filter(Boolean))];
    return roles.sort();
  }, [allEmployees]);

  // Filter and search employees
  const filteredEmployees = useMemo(() => {
    let filtered = [...allEmployees];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.first_name?.toLowerCase().includes(query) ||
        employee.last_name?.toLowerCase().includes(query) ||
        employee.phone_number?.toLowerCase().includes(query) ||
        employee.role?.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (filterRole) {
      filtered = filtered.filter(employee => employee.role === filterRole);
    }

    return filtered;
  }, [allEmployees, searchQuery, filterRole]);

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
            {filteredEmployees.length} {t('employees.title').toLowerCase()}{filteredEmployees.length !== 1 ? 's' : ''} {t('employees.total')}
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('employees.addEmployee')}
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search') || 'Search employees...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">{t('common.allRoles') || 'All Roles'}</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {filterRole && (
              <button
                onClick={() => setFilterRole('')}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {t('common.clear') || 'Clear'}
              </button>
            )}
          </div>
        </div>
        {filteredEmployees.length !== allEmployees.length && (
          <p className="mt-2 text-sm text-gray-600">
            {t('common.showing') || 'Showing'} {filteredEmployees.length} {t('common.of') || 'of'} {allEmployees.length} {t('employees.title').toLowerCase()}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchQuery || filterRole ? (t('common.noResults') || 'No results found') : t('employees.noEmployees')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterRole ? (t('common.tryDifferentSearch') || 'Try a different search or filter') : t('employees.getStarted')}
          </p>
          {!searchQuery && !filterRole && (
            <div className="mt-6">
              <button onClick={openCreateModal} className="btn-primary">
                {t('employees.addEmployee')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('employees.name') || 'Name'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('employees.role') || 'Role'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('employees.phoneNumber') || 'Phone Number'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('employees.hourlyRate') || 'Hourly Rate'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions') || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/employees/${employee.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{employee.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{employee.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.hourly_rate ? (
                        <span className="text-sm font-medium text-green-600">
                          €{parseFloat(employee.hourly_rate).toFixed(2)}/hour
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(employee);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title={t('employees.edit')}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(employee.id);
                          }}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title={t('employees.delete')}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

