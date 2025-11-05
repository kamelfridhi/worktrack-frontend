import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/de';
import api from '../api/axios';

// Ensure German locale for calendar globally
moment.locale('de');

// German messages for react-big-calendar
const messages = {
  allDay: 'Ganztägig',
  previous: 'Zurück',
  next: 'Vor',
  today: 'Heute',
  month: 'Monat',
  week: 'Woche',
  day: 'Tag',
  agenda: 'Agenda',
  date: 'Datum',
  time: 'Uhrzeit',
  event: 'Ereignis',
  noEventsInRange: 'Keine Ereignisse in diesem Zeitraum.',
  showMore: (total) => `+${total} weitere`,
};

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Create localizer with German locale - ensure moment locale is set before creating localizer
  const localizer = useMemo(() => {
    // Set German locale globally for moment BEFORE creating localizer
    moment.locale('de');
    // Create localizer - it will use moment's current locale (German)
    const baseLocalizer = momentLocalizer(moment);

    // Wrap the localizer to ensure German locale is always used for formatting
    return {
      ...baseLocalizer,
      // Override format to ensure German locale
      format: (date, formatString) => {
        if (typeof formatString === 'string') {
          return moment(date).locale('de').format(formatString);
        }
        // Fallback to base localizer if format is not a string
        return baseLocalizer.format(date, formatString);
      },
    };
  }, []);

  // German formats for calendar - ensure moment uses German locale explicitly
  const formats = useMemo(() => {
    // Force German locale for all format functions
    moment.locale('de');
    return {
      weekdayFormat: (date) => {
        // Get moment instance with German locale
        const m = moment(date).locale('de');
        // Use moment's weekdaysMin which returns German abbreviated day names: So, Mo, Di, Mi, Do, Fr, Sa
        const weekdaysMin = m.localeData('de').weekdaysMin();
        const dayOfWeek = m.day();
        return weekdaysMin[dayOfWeek];
      },
      monthHeaderFormat: (date) => {
        return moment(date).locale('de').format('MMMM YYYY');
      },
      dayHeaderFormat: (date) => {
        return moment(date).locale('de').format('dddd, D. MMMM');
      },
      dayRangeHeaderFormat: ({ start, end }) => {
        return `${moment(start).locale('de').format('D. MMMM')} - ${moment(end).locale('de').format('D. MMMM YYYY')}`;
      },
      dayFormat: (date) => {
        return moment(date).locale('de').format('D');
      },
      eventTimeRangeFormat: ({ start, end }) => {
        return `${moment(start).locale('de').format('HH:mm')} - ${moment(end).locale('de').format('HH:mm')}`;
      },
    };
  }, []);

  // Ensure moment locale is set to German when component mounts
  useEffect(() => {
    moment.locale('de');
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const response = await api.get(`/projects/?month=${month}&year=${year}`);

      const calendarEvents = response.data.results?.map((project) => ({
        id: project.id,
        title: project.name,
        start: new Date(project.date),
        end: new Date(project.date),
        allDay: true,
        resource: project,
      })) || [];

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSelectEvent = (event) => {
    navigate(`/projects/${event.resource.id}`);
  };

  const handleSelectSlot = ({ start }) => {
    const dateStr = moment(start).format('YYYY-MM-DD');
    navigate(`/projects?date=${dateStr}`);
  };

  const navigateToPrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const navigateToNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={navigateToPrevious}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={navigateToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('dashboard.today')}
          </button>
          <button
            onClick={navigateToNext}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            defaultDate={currentDate}
            defaultView="month"
            date={currentDate}
            onNavigate={setCurrentDate}
            style={{ height: '100%' }}
            messages={messages}
            formats={formats}
            culture="de"
          />
        </div>
      )}
    </div>
  );
}

