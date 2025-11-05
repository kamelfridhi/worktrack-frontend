import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { PencilIcon, TrashIcon, PlusIcon, CalendarIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const dateParam = searchParams.get('date');
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');

  // Extract month/year from date if date is provided, otherwise use params or current date
  let month, year, date;
  if (dateParam) {
    const dateObj = new Date(dateParam);
    month = dateObj.getMonth() + 1;
    year = dateObj.getFullYear();
    date = dateParam;
  } else {
    month = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1;
    year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    date = null;
  }

  useEffect(() => {
    fetchProjects();
  }, [month, year, date]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Build API URL - if date is specified, use it; otherwise use month/year
      let apiUrl;
      if (date) {
        apiUrl = `/projects/?date=${date}`;
      } else {
        apiUrl = `/projects/?month=${month}&year=${year}`;
      }

      const response = await api.get(apiUrl);
      const fetchedProjects = response.data.results || response.data;
      setAllProjects(fetchedProjects);
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    let filtered = [...allProjects];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    }

    // Apply date filter
    if (filterDate) {
      filtered = filtered.filter(project => project.date === filterDate);
    }

    return filtered;
  }, [allProjects, searchQuery, filterDate]);

  const onSubmit = async (data) => {
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}/`, data);
      } else {
        await api.post('/projects/', data);
      }
      setShowModal(false);
      setEditingProject(null);
      reset();
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert(t('common.error') + ' ' + t('projects.saveError'));
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    reset({
      name: project.name,
      description: project.description,
      date: project.date,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.confirm') + ' ' + t('projects.deleteProject') + '?')) return;

    try {
      await api.delete(`/projects/${id}/`);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(t('common.error') + ' ' + t('projects.deleteError'));
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    reset({
      name: '',
      description: '',
      date: date || new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('projects.title')}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {date
              ? new Date(date).toLocaleDateString() + ' - ' + filteredProjects.length + ' ' + t('projects.title').toLowerCase() + (filteredProjects.length !== 1 ? 's' : '')
              : `${month}/${year} - ${filteredProjects.length} ${t('projects.title').toLowerCase()}${filteredProjects.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center justify-center w-full sm:w-auto">
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('projects.addProject')}
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
              placeholder={t('common.search') || 'Search projects...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {t('common.clear') || 'Clear'}
              </button>
            )}
          </div>
        </div>
        {filteredProjects.length !== allProjects.length && (
          <p className="mt-2 text-sm text-gray-600">
            {t('common.showing') || 'Showing'} {filteredProjects.length} {t('common.of') || 'of'} {allProjects.length} {t('projects.title').toLowerCase()}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchQuery || filterDate ? (t('common.noResults') || 'No results found') : t('projects.noProjects')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterDate ? (t('common.tryDifferentSearch') || 'Try a different search or filter') : t('projects.getStarted')}
          </p>
          {!searchQuery && !filterDate && (
            <div className="mt-6">
              <button onClick={openCreateModal} className="btn-primary">
                {t('projects.addProject')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('projects.projectName') || 'Project Name'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('projects.description') || 'Description'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('projects.date') || 'Date'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('projects.employees') || 'Employees'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md truncate">
                          {project.description || t('projectDetails.noDescription')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {new Date(project.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-blue-600 font-medium">
                          {project.employee_count || 0} {project.employee_count === 1 ? t('projects.employee') : t('projects.employees')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(project);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title={t('projects.edit')}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(project.id);
                            }}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title={t('projects.delete')}
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{project.name}</h3>
                    {project.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(project);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      aria-label={t('projects.edit')}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      className="text-red-600 hover:text-red-900 p-1"
                      aria-label={t('projects.delete')}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {new Date(project.date).toLocaleDateString()}
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    {project.employee_count || 0} {project.employee_count === 1 ? t('projects.employee') : t('projects.employees')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingProject ? t('projects.editProject') : t('projects.addProject')}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">{t('projects.projectName')}</label>
                <input
                  {...register('name', { required: t('projects.projectName') + ' ' + t('projects.required') })}
                  type="text"
                  className="input-field"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="label">{t('projects.description')}</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">{t('projects.date')}</label>
                <input
                  {...register('date', { required: t('projects.date') + ' ' + t('projects.required') })}
                  type="date"
                  className="input-field"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingProject ? t('projects.update') : t('projects.create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
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

