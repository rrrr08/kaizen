'use client';

import React, { useState, useMemo } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    setMonth,
    setYear,
    getYear
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { GameEvent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EventCalendarProps {
    events: GameEvent[];
    registeredEventIds?: Set<string>;
    onDateClick?: (date: Date) => void;
    mode?: 'upcoming' | 'past';
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EventCalendar({ events, registeredEventIds = new Set(), onDateClick, mode = 'upcoming' }: EventCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const days = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({
            start: startDate,
            end: endDate,
        });
    }, [currentMonth]);

    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
        setIsExpanded(false);
    };
    const prevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
        setIsExpanded(false);
    };
    const resetToToday = () => {
        setCurrentMonth(new Date());
        setIsExpanded(false);
    };

    const getEventsForDay = (day: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.datetime);
            return isSameDay(day, eventDate);
        });
    };

    const years = useMemo(() => {
        const currentYear = getYear(new Date());
        const startYear = currentYear - 5;
        const endYear = currentYear + 5;
        const yearsArr = [];
        for (let i = startYear; i <= endYear; i++) {
            yearsArr.push(i);
        }
        return yearsArr;
    }, []);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="bg-white border-4 border-black rounded-[25px] p-4 md:p-5 mb-10 neo-shadow overflow-hidden max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border-b-2 border-black pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#6C5CE7] p-2 border-2 border-black rounded-lg neo-shadow-sm">
                        <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2">
                            {format(currentMonth, 'MMMM')}
                            <span className="text-[#6C5CE7]">{format(currentMonth, 'yyyy')}</span>
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={resetToToday}
                        className="p-1.5 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors neo-shadow-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        title="Today"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <div className="flex border-2 border-black rounded-lg overflow-hidden neo-shadow-sm">
                        <button
                            onClick={prevMonth}
                            className="p-2 bg-white hover:bg-gray-100 border-r-2 border-black transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 bg-white hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Month/Year Selection */}
            <div className="flex flex-wrap gap-2 mb-6 items-center">
                <select
                    value={currentMonth.getMonth()}
                    onChange={(e) => {
                        setCurrentMonth(setMonth(currentMonth, parseInt(e.target.value)));
                        setIsExpanded(false);
                    }}
                    className="px-2 py-1.5 border-2 border-black rounded-lg font-black text-xs uppercase cursor-pointer hover:bg-[#FFD93D] transition-colors focus:outline-none"
                >
                    {months.map((month, idx) => (
                        <option key={month} value={idx}>{month}</option>
                    ))}
                </select>
                <select
                    value={getYear(currentMonth)}
                    onChange={(e) => {
                        setCurrentMonth(setYear(currentMonth, parseInt(e.target.value)));
                        setIsExpanded(false);
                    }}
                    className="px-2 py-1.5 border-2 border-black rounded-lg font-black text-xs uppercase cursor-pointer hover:bg-[#A8E6CF] transition-colors focus:outline-none"
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 ml-auto text-[10px] font-black uppercase tracking-tighter">
                    {mode === 'upcoming' ? (
                        <>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-[#6C5CE7] border border-black rounded-sm"></div>
                                <span>Upcoming</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-[#00B894] border border-black rounded-sm"></div>
                                <span>Registered</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-[#FF7675] border border-black rounded-sm"></div>
                            <span>Concluded</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Days Header - Desktop Only */}
            <div className="hidden md:grid grid-cols-7 gap-4 mb-4">
                {DAYS.map(day => (
                    <div key={day} className="text-center font-black text-xs uppercase tracking-widest text-black/40 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid - Desktop Only */}
            <div className="hidden md:grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                    const dayEvents = getEventsForDay(day);
                    const isSelected = isSameMonth(day, currentMonth);
                    const isTodayDate = isToday(day);
                    const hasEvents = dayEvents.length > 0;
                    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                    const isRegistered = dayEvents.some(e => registeredEventIds.has(e.id));

                    let dayStyles = "";
                    let textStyles = "text-black";

                    if (isSelected && hasEvents) {
                        const firstEvent = dayEvents[0];
                        const isLight = firstEvent.category === 'Workshop';

                        if (mode === 'upcoming') {
                            if (isRegistered) {
                                dayStyles = "bg-[#00B894] border-[#000] shadow-[3px_3px_0px_#000]";
                                textStyles = "text-white";
                            } else if (!isPast) {
                                const bgClass = firstEvent.category === 'Workshop' ? 'bg-[#FFD93D]' :
                                    firstEvent.category === 'Game Night' ? 'bg-[#6C5CE7]' : 'bg-[#00B894]';
                                dayStyles = `${bgClass} border-[#000] shadow-[3px_3px_0px_#000]`;
                                textStyles = isLight ? "text-black" : "text-white";
                            }
                        } else if (mode === 'past') {
                            dayStyles = "bg-[#FF7675] border-[#000] shadow-[3px_3px_0px_#000]";
                            textStyles = "text-white";
                        }
                    }

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => {
                                if (isSelected && hasEvents) {
                                    const eventId = dayEvents[0].id;
                                    const element = document.getElementById(`event-${eventId}`);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }
                                if (isSelected) onDateClick?.(day);
                            }}
                            className={cn(
                                "relative min-h-[90px] p-2 border-2 border-black rounded-xl transition-all duration-200 group flex flex-col justify-between",
                                !isSelected && "bg-gray-50 opacity-20 select-none",
                                isSelected && !hasEvents && "bg-white cursor-pointer hover:bg-[#FFFDF5] neo-shadow-sm",
                                isSelected && hasEvents && `cursor-pointer hover:scale-[1.05] ${dayStyles}`,
                                isTodayDate && !hasEvents && "ring-2 ring-[#6C5CE7] ring-offset-1"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-lg font-black",
                                    isTodayDate && !hasEvents ? "text-[#6C5CE7]" : textStyles
                                )}>
                                    {format(day, 'd')}
                                </span>
                                {isTodayDate && (
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full ring-1 ring-black",
                                        hasEvents ? "bg-white" : "bg-[#6C5CE7]"
                                    )} />
                                )}
                            </div>

                            {hasEvents && (
                                <div className="mt-1">
                                    <div className={cn(
                                        "text-[8px] font-black uppercase tracking-tighter truncate",
                                        textStyles
                                    )}>
                                        {dayEvents[0].title}
                                    </div>
                                    {dayEvents.length > 1 && (
                                        <div className={cn(
                                            "text-[8px] font-black opacity-70",
                                            textStyles
                                        )}>
                                            + {dayEvents.length - 1} MORE
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile View - Dated Cards */}
            <div className="md:hidden space-y-4">
                {(() => {
                    const daysWithEvents = days.filter(day => isSameMonth(day, currentMonth) && getEventsForDay(day).length > 0);
                    const hasEvents = daysWithEvents.length > 0;
                    const visibleDays = isExpanded ? daysWithEvents : daysWithEvents.slice(0, 4);

                    if (!hasEvents) {
                        return (
                            <div className="text-center py-8 px-4 border-2 border-black border-dashed rounded-2xl bg-gray-50">
                                <CalendarIcon className="w-8 h-8 text-black/20 mx-auto mb-3" />
                                <p className="text-black/40 font-black text-xs uppercase tracking-widest">No scheduled events</p>
                                <p className="text-black/20 font-bold text-[10px] mt-1 italic">Try switching months or checking past events!</p>
                            </div>
                        );
                    }

                    return (
                        <>
                            <div className="mb-4">
                                <p className="text-black/40 font-black text-[10px] uppercase tracking-widest px-2">
                                    Showing {visibleDays.length} of {daysWithEvents.length} days with events
                                </p>
                            </div>
                            <div className="space-y-4">
                                {visibleDays.map((day) => {
                                    const dayEvents = getEventsForDay(day);
                                    const isRegistered = dayEvents.some(e => registeredEventIds.has(e.id));
                                    const firstEvent = dayEvents[0];

                                    const bgClass = mode === 'past' ? 'bg-[#FF7675]' :
                                        isRegistered ? 'bg-[#00B894]' :
                                            firstEvent.category === 'Workshop' ? 'bg-[#FFD93D]' :
                                                firstEvent.category === 'Game Night' ? 'bg-[#6C5CE7]' : 'bg-[#00B894]';

                                    const textColor = (mode === 'past' || isRegistered || firstEvent.category !== 'Workshop') ? 'text-white' : 'text-black';

                                    return (
                                        <div
                                            key={day.toString()}
                                            className={cn(
                                                "flex gap-4 p-3 border-2 border-black rounded-2xl neo-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none",
                                                bgClass
                                            )}
                                            onClick={() => {
                                                const eventId = firstEvent.id;
                                                const element = document.getElementById(`event-${eventId}`);
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }
                                                onDateClick?.(day);
                                            }}
                                        >
                                            <div className="flex flex-col items-center justify-center min-w-[50px] border-r-2 border-black/20 pr-3">
                                                <span className={cn("text-xl font-black leading-none", textColor)}>{format(day, 'd')}</span>
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest opacity-70", textColor)}>{format(day, 'MMM')}</span>
                                            </div>
                                            <div className="flex-1 min-w-0 py-0.5">
                                                <div className={cn("text-[9px] font-black uppercase tracking-widest opacity-70 mb-0.5", textColor)}>
                                                    {firstEvent.category || 'Event'} • {format(new Date(firstEvent.datetime), 'hh:mm a')}
                                                </div>
                                                <div className={cn("text-sm font-black uppercase tracking-tight truncate", textColor)}>
                                                    {firstEvent.title}
                                                </div>
                                                {dayEvents.length > 1 && (
                                                    <div className={cn("text-[9px] font-black uppercase mt-0.5 opacity-70", textColor)}>
                                                        + {dayEvents.length - 1} OTHER EVENTS
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {daysWithEvents.length > 4 && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="w-full mt-4 py-3 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest bg-white hover:bg-gray-50 neo-shadow-sm transition-all flex items-center justify-center gap-2"
                                >
                                    {isExpanded ? (
                                        <>SHOW LESS <ChevronRight className="w-4 h-4 rotate-90" /></>
                                    ) : (
                                        <>SHOW {daysWithEvents.length - 4} MORE EVENTS <ChevronRight className="w-4 h-4 -rotate-90" /></>
                                    )}
                                </button>
                            )}
                        </>
                    );
                })()}
            </div>
        </div>
    );
}
