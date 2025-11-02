import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { PencilIcon, TrashIcon, PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
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
      setProjects(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('projects.title')}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {date
              ? new Date(date).toLocaleDateString() + ' - ' + projects.length + ' ' + t('projects.title').toLowerCase() + (projects.length !== 1 ? 's' : '')
              : `${month}/${year} - ${projects.length} ${t('projects.title').toLowerCase()}${projects.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('projects.addProject')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('projects.noProjects')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('projects.getStarted')}</p>
          <div className="mt-6">
            <button onClick={openCreateModal} className="btn-primary">
              {t('projects.addProject')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="card hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => navigate(`/projects/${project.id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.description || t('projectDetails.noDescription')}</p>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(project.date).toLocaleDateString()}
                  </div>
                  <p className="mt-2 text-sm text-blue-600">
                    {project.employee_count || 0} {project.employee_count === 1 ? t('projects.employee') : t('projects.employees')}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(project);
                  }}
                  className="flex-1 btn-secondary flex items-center justify-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  {t('projects.edit')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project.id);
                  }}
                  className="flex-1 btn-danger flex items-center justify-center"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  {t('projects.delete')}
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

