import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { ArrowLeftIcon, DocumentArrowDownIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadMonth, setDownloadMonth] = useState(new Date().getMonth() + 1);
  const [downloadYear, setDownloadYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(null);
  const [filterYear, setFilterYear] = useState(null);

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
    try {
      setDownloading(true);
      const url = `/export-employee/${id}/${downloadMonth}/?year=${downloadYear}`;

      // Use axios to get the PDF blob with credentials
      const response = await api.get(url, {
        responseType: 'blob', // Important: tell axios to handle binary data
      });

      // Create blob from response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `employee_${id}_report_${downloadYear}_${downloadMonth.toString().padStart(2, '0')}.pdf`;
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

  // Filter projects by month/year - must be before early returns
  const filteredProjects = useMemo(() => {
    if (!employee?.employee_projects) return [];

    if (filterMonth === null || filterYear === null) {
      return employee.employee_projects;
    }

    return employee.employee_projects.filter(ep => {
      const projectDate = new Date(ep.project_date);
      return projectDate.getMonth() + 1 === filterMonth && projectDate.getFullYear() === filterYear;
    });
  }, [employee, filterMonth, filterYear]);

  // Calculate summary based on filtered projects - must be before early returns
  const summaryData = useMemo(() => {
    const totalHours = filteredProjects.reduce((sum, ep) => sum + (ep.hours_worked || 0), 0);
    const projectsCount = filteredProjects.length;
    const estimatedEarnings = employee?.hourly_rate
      ? totalHours * parseFloat(employee.hourly_rate)
      : null;

    return {
      totalHours,
      projectsCount,
      estimatedEarnings,
    };
  }, [filteredProjects, employee?.hourly_rate]);

  // Get unique months/years from projects for filter dropdown - must be before early returns
  const availableMonths = useMemo(() => {
    if (!employee?.employee_projects) return [];
    const monthsSet = new Set();
    employee.employee_projects.forEach(ep => {
      const date = new Date(ep.project_date);
      monthsSet.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
    });
    return Array.from(monthsSet).sort().reverse();
  }, [employee]);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-4 sm:mb-0">
            {/* Download Month/Year Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={downloadMonth}
                onChange={(e) => setDownloadMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>{t(`months.${m}`) || m}</option>
                ))}
              </select>
              <select
                value={downloadYear}
                onChange={(e) => setDownloadYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
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
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-lg md:text-xl font-semibold">
              {filterMonth && filterYear
                ? `${t(`months.${filterMonth}`)} ${filterYear} ${t('employeeDetails.summary')}`
                : t('employeeDetails.thisMonthSummary')
              }
            </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">{t('employeeDetails.totalHours')}</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600">{summaryData.totalHours.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">{t('employeeDetails.projects')}</p>
            <p className="text-xl md:text-2xl font-bold text-green-600">{summaryData.projectsCount}</p>
          </div>
          {employee.hourly_rate && (
            <div className="bg-purple-50 p-4 rounded-lg sm:col-span-2 md:col-span-1">
              <p className="text-sm text-gray-600">{t('employeeDetails.estimatedEarnings')}</p>
              <p className="text-xl md:text-2xl font-bold text-purple-600">
                €{summaryData.estimatedEarnings?.toFixed(2) || '0.00'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <h2 className="text-lg md:text-xl font-semibold">{t('employeeDetails.projectsWorkedOn')}</h2>
          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterMonth ? `${filterYear}-${filterMonth}` : 'all'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setFilterMonth(null);
                  setFilterYear(null);
                } else {
                  const [year, month] = e.target.value.split('-');
                  setFilterYear(parseInt(year));
                  setFilterMonth(parseInt(month));
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">{t('common.allMonths')}</option>
              {availableMonths.map(monthYear => {
                const [year, month] = monthYear.split('-');
                return (
                  <option key={monthYear} value={monthYear}>
                    {t(`months.${month}`) || month} {year}
                  </option>
                );
              })}
            </select>
            {filterMonth && filterYear && (
              <button
                onClick={() => {
                  setFilterMonth(null);
                  setFilterYear(null);
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {t('common.clear')}
              </button>
            )}
          </div>
        </div>
        {filteredProjects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {filterMonth && filterYear
              ? t('employeeDetails.noProjectsForMonth', { month: t(`months.${filterMonth}`), year: filterYear })
              : t('employeeDetails.noProjects')
            }
          </p>
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
                    {filteredProjects.map((ep) => (
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
                          {ep.hours_worked || 0} {t('employeeDetails.hours')}
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
              {filteredProjects.map((ep) => (
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
                    <span className="text-sm font-medium text-gray-900">{ep.hours_worked || 0} {t('employeeDetails.hours')}</span>
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

