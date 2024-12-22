import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  EVENT: "event",
};

const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEventIndex, setEditEventIndex] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startTime: "",
    endTime: "",
    description: "",
    category: "work",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const parseTimeString = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  useEffect(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  useEffect(() => {
    if (events && Object.keys(events).length > 0) {
      localStorage.setItem("calendarEvents", JSON.stringify(events));
    }
  }, [events]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleDateClick = (dateInfo) => {
    if (!dateInfo.isCurrentMonth) return;
    const dateKey = formatDateKey(dateInfo.date);
    setSelectedDate(dateKey);
    setShowEventModal(true);
    setIsEditing(false);
    setNewEvent({
      title: "",
      startTime: "",
      endTime: "",
      description: "",
      category: "work",
    });
  };

  const checkTimeOverlap = (newStart, newEnd, existingEvents) => {
    const newStartMins = parseTimeString(newStart);
    const newEndMins = parseTimeString(newEnd);

    return existingEvents.some((event) => {
      const existingStartMins = parseTimeString(event.startTime);
      const existingEndMins = parseTimeString(event.endTime);

      return (
        (newStartMins >= existingStartMins && newStartMins < existingEndMins) ||
        (newEndMins > existingStartMins && newEndMins <= existingEndMins) ||
        (newStartMins <= existingStartMins && newEndMins >= existingEndMins)
      );
    });
  };

  const handleAddEvent = () => {
    if (
      !selectedDate ||
      !newEvent.title ||
      !newEvent.startTime ||
      !newEvent.endTime
    ) {
      return;
    }

    const dayEvents = events[selectedDate] || [];

    if (checkTimeOverlap(newEvent.startTime, newEvent.endTime, dayEvents)) {
      alert("Event time overlaps with an existing event!");
      return;
    }

    setEvents((prev) => ({
      ...prev,
      [selectedDate]: [...dayEvents, newEvent],
    }));

    setNewEvent({
      title: "",
      startTime: "",
      endTime: "",
      description: "",
      category: "work",
    });
    setShowEventModal(false);
  };

  const handleEditEvent = () => {
    if (
      !selectedDate ||
      !newEvent.title ||
      !newEvent.startTime ||
      !newEvent.endTime
    ) {
      return;
    }

    const dayEvents = events[selectedDate] || [];

    if (
      checkTimeOverlap(
        newEvent.startTime,
        newEvent.endTime,
        dayEvents.filter((_, index) => index !== editEventIndex)
      )
    ) {
      alert("Event time overlaps with an existing event!");
      return;
    }

    const updatedEvents = dayEvents.map((event, index) =>
      index === editEventIndex ? newEvent : event
    );

    setEvents((prev) => ({
      ...prev,
      [selectedDate]: updatedEvents,
    }));

    setNewEvent({
      title: "",
      startTime: "",
      endTime: "",
      description: "",
      category: "work",
    });
    setShowEventModal(false);
    setIsEditing(false);
    setEditEventIndex(null);
  };

  const handleRemoveEvent = (eventIndex) => {
    if (!selectedDate || !events[selectedDate]) return;

    const updatedEvents = events[selectedDate].filter(
      (_, index) => index !== eventIndex
    );
    setEvents((prev) => ({
      ...prev,
      [selectedDate]: updatedEvents,
    }));
  };

  const handleEditButtonClick = (event, index) => {
    setNewEvent(event);
    setIsEditing(true);
    setEditEventIndex(index);
    setShowEventModal(true);
  };

  const getFilteredEvents = () => {
    if (!selectedDate || !events[selectedDate]) return [];

    return events[selectedDate]
      .filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort(
        (a, b) => parseTimeString(a.startTime) - parseTimeString(b.startTime)
      );
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "work":
        return "bg-blue-100 text-blue-700";
      case "personal":
        return "bg-green-100 text-green-700";
      case "others":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const exportEventsAsJSON = () => {
    const monthEvents = Object.keys(events)
      .filter((dateKey) => {
        const date = new Date(dateKey);
        return (
          date.getFullYear() === currentDate.getFullYear() &&
          date.getMonth() === currentDate.getMonth()
        );
      })
      .reduce((acc, dateKey) => {
        acc[dateKey] = events[dateKey];
        return acc;
      }, {});

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(monthEvents, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `events-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportEventsAsCSV = () => {
    const monthEvents = Object.keys(events)
      .filter((dateKey) => {
        const date = new Date(dateKey);
        return (
          date.getFullYear() === currentDate.getFullYear() &&
          date.getMonth() === currentDate.getMonth()
        );
      })
      .reduce((acc, dateKey) => {
        events[dateKey].forEach((event) => {
          acc.push({
            date: dateKey,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            description: event.description,
            category: event.category,
          });
        });
        return acc;
      }, []);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Date,Title,Start Time,End Time,Description,Category"]
        .concat(
          monthEvents.map(
            (event) =>
              `${event.date},${event.title},${event.startTime},${event.endTime},${event.description},${event.category}`
          )
        )
        .join("\n");

    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", csvContent);
    downloadAnchorNode.setAttribute(
      "download",
      `events-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.csv`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const Event = ({ event, index, dateKey }) => {
    const [, drag] = useDrag({
      type: ItemTypes.EVENT,
      item: { event, index, dateKey },
    });

    return (
      <div
        ref={drag}
        className={`text-xs md:text-sm truncate rounded px-1 my-0.5 ${getCategoryColor(
          event.category
        )}`}
      >
        {event.title}
      </div>
    );
  };

  const DayCell = ({ dateInfo, index }) => {
    const [, drop] = useDrop({
      accept: ItemTypes.EVENT,
      drop: (item) => {
        const { event, index, dateKey } = item;
        const newDateKey = formatDateKey(dateInfo.date);

        if (dateKey !== newDateKey) {
          setEvents((prevEvents) => {
            const updatedEvents = { ...prevEvents };
            updatedEvents[dateKey] = updatedEvents[dateKey].filter(
              (_, i) => i !== index
            );
            if (updatedEvents[dateKey].length === 0) {
              delete updatedEvents[dateKey];
            }
            updatedEvents[newDateKey] = [
              ...(updatedEvents[newDateKey] || []),
              event,
            ];
            return updatedEvents;
          });
        }
      },
    });
    const isSelected =
      dateInfo.isCurrentMonth && formatDateKey(dateInfo.date) === selectedDate;
    const isWeekend =
      dateInfo.date &&
      (dateInfo.date.getDay() === 0 || dateInfo.date.getDay() === 6);

    return (
      <div
        ref={drop}
        onClick={() => dateInfo.isCurrentMonth && handleDateClick(dateInfo)}
        className={`
          relative p-1 md:p-2 border rounded-lg overflow-hidden
          ${
            dateInfo.isCurrentMonth
              ? "cursor-pointer hover:bg-gray-50"
              : "bg-gray-100"
          }
          ${isSelected ? "bg-gray-100 border-gray-800" : ""}
          ${isWeekend ? "text-red-800" : ""}  {}
          ${
            dateInfo.isCurrentMonth && isToday(dateInfo.date)
              ? "bg-blue-50"
              : ""
          }
          ${index % 7 === 0 || index % 7 === 6 ? "bg-gray-50" : ""}
          transition-colors duration-200
        `}
      >
        {dateInfo.day && (
          <div className="h-full flex flex-col">
            <div
              className={`
              font-semibold text-sm md:text-base
              ${isToday(dateInfo.date) ? "text-blue-600" : ""}
            `}
            >
              {dateInfo.day}
            </div>
            {dateInfo.isCurrentMonth &&
              events[formatDateKey(dateInfo.date)]?.length > 0 && (
                <div className="flex-1">
                  {events[formatDateKey(dateInfo.date)]
                    .slice(0, 2)
                    .map((event, i) => (
                      <Event
                        key={i}
                        event={event}
                        index={i}
                        dateKey={formatDateKey(dateInfo.date)}
                      />
                    ))}
                  {events[formatDateKey(dateInfo.date)].length > 2 && (
                    <div className="text-xs text-blue-600 mt-0.5">
                      +{events[formatDateKey(dateInfo.date)].length - 2} more
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 p-4 rounded-lg">
        <div className="container mx-auto ">
          <Card className="min-h-screen w-full lg:w-[85vw] lg:w-[70vw] mx-auto">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-4 bg-white sticky top-0 z-10 border-b">
              <div className="w-full flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold">
                  {currentDate.toLocaleDateString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </CardTitle>
                <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="bg-black text-white min-w-[120px]"
                      onClick={handlePreviousMonth}
                    >
                      Previous
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="bg-black text-white min-w-[120px]"
                      onClick={handleNextMonth}
                    >
                      Next
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="min-w-[120px]"
                      onClick={exportEventsAsJSON}
                    >
                      Export JSON
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="min-w-[120px]"
                      onClick={exportEventsAsCSV}
                    >
                      Export CSV
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 md:p-4 h-[calc(100vh-12rem)] overflow-y-auto">
              {}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-2 text-center font-semibold text-gray-600 border-b"
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.charAt(0)}</span>
                    </div>
                  )
                )}
              </div>

              {}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="grid grid-cols-7 gap-1 auto-rows-fr h-full"
              >
                {generateCalendarDays().map((dateInfo, index) => (
                  <DayCell key={index} dateInfo={dateInfo} />
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </div>

        {}
        <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
          <DialogContent className="w-[95%] sm:max-w-[90vw] md:max-w-[525px] max-h-[80vh] overflow-y-auto text-black rounded-lg ">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl break-words">
                {selectedDate
                  ? `Events for ${new Date(selectedDate).toLocaleDateString()}`
                  : "Events"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {isEditing ? "Edit Event" : "Add New Event"}
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="event-title">Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newEvent.category}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, category: e.target.value })
                    }
                    className="mt-1 block bg-white h-10 w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <Button
                  onClick={isEditing ? handleEditEvent : handleAddEvent}
                  className="w-full"
                >
                  {isEditing ? "Save Changes" : "Add Event"}
                </Button>
              </div>

              {getFilteredEvents().length > 0 && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="event-search">Search Events</Label>
                    <Input
                      id="event-search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search events..."
                      className="mt-1"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">Events</h3>
                  {getFilteredEvents().map((event, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-base sm:text-lg truncate max-w-[250px] sm:max-w-[350px]">
                              {event.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {event.startTime} - {event.endTime}
                            </p>
                            {event.description && (
                              <p className="text-sm mt-2 text-gray-700 truncate break-words max-w-[250px] sm:max-w-[350px]">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleEditButtonClick(event, index)
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleRemoveEvent(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
};

export default EventCalendar;
