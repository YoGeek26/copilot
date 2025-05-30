import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import { Post, CalendarEvent } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, FileText, Tag, Star } from 'lucide-react';

export function Calendar() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentMonth]);

  const loadData = () => {
    if (user) {
      const userPosts = storage.getPosts(user.id);
      const userEvents = storage.getCalendarEvents(user.id);
      setPosts(userPosts);
      setEvents(userEvents);

      // Ajouter des événements suggérés si aucun n'existe
      if (userEvents.length === 0) {
        addSuggestedEvents();
      }
    }
  };

  const addSuggestedEvents = () => {
    if (!user) return;

    const suggestedEvents: CalendarEvent[] = [
      {
        id: 'soldes-hiver',
        userId: user.id,
        title: 'Début des soldes d\'hiver',
        type: 'holiday',
        date: new Date(2024, 0, 10), // 10 janvier
        description: 'Période idéale pour une promotion'
      },
      {
        id: 'saint-valentin',
        userId: user.id,
        title: 'Saint-Valentin',
        type: 'holiday',
        date: new Date(2024, 1, 14), // 14 février
        description: 'Opportunité pour des offres spéciales couples'
      },
      {
        id: 'fete-meres',
        userId: user.id,
        title: 'Fête des mères',
        type: 'holiday',
        date: new Date(2024, 4, 26), // 26 mai 2024
        description: 'Moment clé pour des promotions cadeaux'
      }
    ];

    suggestedEvents.forEach(event => storage.createCalendarEvent(event));
    loadData();
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtenir les jours de la semaine précédente pour compléter la grille
  const startDay = monthStart.getDay() || 7; // Dimanche = 7
  const previousMonthDays = Array.from({ length: startDay - 1 }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (startDay - 1 - i));
    return date;
  });

  const allDays = [...previousMonthDays, ...monthDays];

  const getEventsForDay = (date: Date) => {
    const dayPosts = posts.filter(p => {
      const postDate = p.plannedDate ? new Date(p.plannedDate) : new Date(p.publishDate);
      return isSameDay(postDate, date);
    });

    const dayEvents = events.filter(e => isSameDay(new Date(e.date), date));

    return { posts: dayPosts, events: dayEvents };
  };

  const getDayContent = (date: Date) => {
    const { posts: dayPosts, events: dayEvents } = getEventsForDay(date);
    const items = [];

    if (dayPosts.length > 0) {
      items.push(
        <div key="posts" className="flex items-center gap-1 text-xs">
          <FileText className="h-3 w-3 text-blue-600" />
          <span className="text-blue-600">{dayPosts.length}</span>
        </div>
      );
    }

    if (dayEvents.length > 0) {
      dayEvents.forEach(event => {
        if (event.type === 'holiday') {
          items.push(
            <div key={event.id} className="text-xs text-purple-600 truncate">
              <Star className="h-3 w-3 inline mr-1" />
              {event.title}
            </div>
          );
        } else if (event.type === 'promotion') {
          items.push(
            <div key={event.id} className="text-xs text-green-600 truncate">
              <Tag className="h-3 w-3 inline mr-1" />
              Promo
            </div>
          );
        }
      });
    }

    return items;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendrier éditorial</h1>
        <p className="text-gray-600 mt-1">Planifiez vos publications et suivez les dates importantes</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {/* Header du calendrier */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Grille du calendrier */}
        <div className="p-6">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Jours du mois */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {allDays.map((date, index) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isToday = isSameDay(date, new Date());
              const dayContent = getDayContent(date);
              const hasContent = dayContent.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    bg-white p-2 min-h-[80px] cursor-pointer hover:bg-gray-50 transition-colors
                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                    ${isToday ? 'ring-2 ring-indigo-600 ring-inset' : ''}
                    ${selectedDate && isSameDay(date, selectedDate) ? 'bg-indigo-50' : ''}
                  `}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-sm font-medium ${isToday ? 'text-indigo-600' : ''}`}>
                      {format(date, 'd')}
                    </span>
                    {hasContent && (
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayContent}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Légende */}
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">Publications</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">Promotions</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-gray-600">Dates importantes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Détails du jour sélectionné */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </h3>
          
          <div className="space-y-4">
            {(() => {
              const { posts: dayPosts, events: dayEvents } = getEventsForDay(selectedDate);
              
              if (dayPosts.length === 0 && dayEvents.length === 0) {
                return (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Aucun événement ce jour</p>
                    <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                      <Plus className="h-4 w-4" />
                      Planifier un post
                    </button>
                  </div>
                );
              }

              return (
                <>
                  {dayPosts.map(post => (
                    <div key={post.id} className="border-l-4 border-blue-600 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{post.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{post.content}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${
                              post.status === 'published' ? 'bg-green-100 text-green-700' : 
                              post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {post.status === 'published' ? 'Publié' : 
                               post.status === 'scheduled' ? 'Programmé' : 'Brouillon'}
                            </span>
                            <span>{post.channel === 'both' ? 'Google & Facebook' : post.channel}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {dayEvents.map(event => (
                    <div key={event.id} className={`border-l-4 pl-4 ${
                      event.type === 'holiday' ? 'border-purple-600' : 
                      event.type === 'promotion' ? 'border-green-600' : 
                      'border-gray-600'
                    }`}>
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
