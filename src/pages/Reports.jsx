import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

export default function Reports() {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStatistics();
  }, [month, year]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statistics/statistics/?month=${month}&year=${year}`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    t('months.1'), t('months.2'), t('months.3'), t('months.4'), t('months.5'), t('months.6'),
    t('months.7'), t('months.8'), t('months.9'), t('months.10'), t('months.11'), t('months.12')
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
        <p className="mt-1 text-sm text-gray-600">{t('reports.subtitle')}</p>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('reports.filterByPeriod')}</h2>
        <div className="flex space-x-4">
          <div>
            <label className="label">{t('reports.month')}</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="input-field"
            >
              {monthNames.map((name, index) => (
                <option key={index} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('reports.year')}</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input-field"
              min="2020"
              max="2100"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : statistics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{t('reports.totalEmployees')}</p>
                <p className="text-4xl font-bold mt-2">{statistics.total_employees}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 rounded-full p-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">{t('reports.totalProjects')}</p>
                <p className="text-4xl font-bold mt-2">{statistics.total_projects}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-full p-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">{t('reports.totalHours')}</p>
                <p className="text-4xl font-bold mt-2">{statistics.total_hours}</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-full p-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">{t('reports.noStatistics')}</p>
        </div>
      )}

      {statistics && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">{t('reports.summary')}</h2>
          <div className="space-y-2 text-gray-600">
            <p>
              <span className="font-medium">{t('reports.period')}:</span> {monthNames[month - 1]} {year}
            </p>
            <p>
              <span className="font-medium">{t('reports.averageHoursPerEmployee')}:</span>{' '}
              {statistics.total_employees > 0
                ? (statistics.total_hours / statistics.total_employees).toFixed(2)
                : '0'}
            </p>
            <p>
              <span className="font-medium">{t('reports.averageHoursPerProject')}:</span>{' '}
              {statistics.total_projects > 0
                ? (statistics.total_hours / statistics.total_projects).toFixed(2)
                : '0'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

