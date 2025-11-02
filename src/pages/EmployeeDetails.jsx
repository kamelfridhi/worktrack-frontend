import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/employees/${id}/`);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      setDownloading(true);
      const url = `/export-employee/${id}/${month}/?year=${year}`;

      // Use axios to get the PDF blob with credentials
      const response = await api.get(url, {
        responseType: 'blob', // Important: tell axios to handle binary data
      });

      // Create blob from response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `employee_${id}_report_${year}_${month.toString().padStart(2, '0')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      if (error.response?.status === 401) {
        alert(t('employeeDetails.unauthorized'));
      } else {
        alert(t('employeeDetails.downloadError'));
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const totalHoursThisMonth = employee.employee_projects?.reduce((sum, ep) => {
    const projectDate = new Date(ep.project_date);
    const now = new Date();
    if (projectDate.getMonth() === now.getMonth() && projectDate.getFullYear() === now.getFullYear()) {
      return sum + ep.hours_worked;
    }
    return sum;
  }, 0) || 0;

  const currentMonthProjects = employee.employee_projects?.filter(ep => {
    const projectDate = new Date(ep.project_date);
    const now = new Date();
    return projectDate.getMonth() === now.getMonth() && projectDate.getFullYear() === now.getFullYear();
  }) || [];

  return (
    <div className="p-4 md:p-6">
      <button
        onClick={() => navigate('/employees')}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        {t('employeeDetails.backToEmployees')}
      </button>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-gray-600 mb-1 break-words">{t('employeeDetails.role')}: {employee.role}</p>
            <p className="text-gray-600 mb-1 break-words">{t('employeeDetails.phone')}: {employee.phone_number}</p>
            {employee.hourly_rate && (
              <p className="text-gray-600 mb-4 break-words">
                {t('employeeDetails.hourlyRate')}: €{parseFloat(employee.hourly_rate).toFixed(2)}
              </p>
            )}
          </div>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="btn-primary flex items-center justify-center w-full sm:w-auto disabled:opacity-50 flex-shrink-0"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">{downloading ? t('employeeDetails.downloading') : t('employeeDetails.downloadMonthlyReport')}</span>
            <span className="sm:hidden">{downloading ? t('employeeDetails.downloading') : t('employeeDetails.download')}</span>
          </button>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4">{t('employeeDetails.thisMonthSummary')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">{t('employeeDetails.totalHours')}</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600">{totalHoursThisMonth.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">{t('employeeDetails.projects')}</p>
            <p className="text-xl md:text-2xl font-bold text-green-600">{currentMonthProjects.length}</p>
          </div>
          {employee.hourly_rate && (
            <div className="bg-purple-50 p-4 rounded-lg sm:col-span-2 md:col-span-1">
              <p className="text-sm text-gray-600">{t('employeeDetails.estimatedEarnings')}</p>
              <p className="text-xl md:text-2xl font-bold text-purple-600">
                €{(totalHoursThisMonth * parseFloat(employee.hourly_rate)).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg md:text-xl font-semibold mb-4">{t('employeeDetails.projectsWorkedOn')}</h2>
        {employee.employee_projects?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('employeeDetails.noProjects')}</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto -mx-6 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('employeeDetails.project')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('employeeDetails.date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('employeeDetails.hoursWorked')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('projectDetails.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employee.employee_projects?.map((ep) => (
                      <tr key={ep.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                            onClick={() => navigate(`/projects/${ep.project_id}`)}
                          >
                            {ep.project_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(ep.project_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ep.hours_worked} {t('employeeDetails.hours')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => navigate(`/projects/${ep.project_id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {t('employeeDetails.viewProject')}
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
              {employee.employee_projects?.map((ep) => (
                <div key={ep.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-sm font-semibold text-blue-600 cursor-pointer hover:underline truncate"
                        onClick={() => navigate(`/projects/${ep.project_id}`)}
                      >
                        {ep.project_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(ep.project_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">{t('employeeDetails.hoursWorked')}:</span>
                    <span className="text-sm font-medium text-gray-900">{ep.hours_worked} {t('employeeDetails.hours')}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/projects/${ep.project_id}`)}
                      className="w-full btn-secondary text-sm py-2"
                    >
                      {t('employeeDetails.viewProject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

