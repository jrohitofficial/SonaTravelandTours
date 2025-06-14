import React, { useState, useEffect } from 'react';

const DateSelector = ({ onDateChange, initialDate }) => {
  const today = new Date();  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  // Create a ref for the date cards container
  const dateCardsContainerRef = React.useRef(null);
  
  // Current date for the demo - use June 6, 2025 as specified in context
  // If initialDate is provided, use it instead
  const currentDate = initialDate ? new Date(initialDate) : new Date('2025-06-06');
  const [selectedDate, setSelectedDate] = useState(formatMonthDateOnly(currentDate));
  const [visibleDates, setVisibleDates] = useState([]);
  const [currentStartDate, setCurrentStartDate] = useState(new Date(yesterday));
  const [isSearching, setIsSearching] = useState(false);
  
  // Format date for display
  function formatDateForDisplay(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  // Format day only
  function formatDayOnly(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  // Format month and date only
  function formatMonthDateOnly(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  // Check if date is today
  function isToday(date) {
    return date.toDateString() === today.toDateString();
  }  // Update selectedDate when initialDate changes and adjust the current view
  useEffect(() => {
    if (initialDate) {
      const date = new Date(initialDate);
      const formattedDate = formatMonthDateOnly(date);
      setSelectedDate(formattedDate);
      
      // Adjust the current view to make the selected date visible
      // We need to shift the currentStartDate to include this date
      const targetDate = new Date(date);
      
      // Check if the date is within the currently visible range
      const endOfCurrentRange = new Date(currentStartDate);
      endOfCurrentRange.setDate(currentStartDate.getDate() + 10);
      
      // If the selected date is outside the current view range, adjust the view
      if (targetDate < currentStartDate || targetDate > endOfCurrentRange) {
        // Set the start date 3 days before the target to center it in view
        const newStartDate = new Date(targetDate);
        newStartDate.setDate(targetDate.getDate() - 3);
        
        // But don't go earlier than today
        const todayDate = new Date();
        if (newStartDate < todayDate) {
          newStartDate.setDate(todayDate.getDate());
        }
        
        setCurrentStartDate(newStartDate);
      }
    }
  }, [initialDate]);
  // Generate dates for display
  useEffect(() => {
    const generateDates = () => {
      const dates = [];
      const startDate = new Date(currentStartDate);
      
      for (let i = 0; i < 11; i++) {
        const newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + i);
        
        // Only disable exactly yesterday's date, not all past dates
        const isYesterday = newDate.toDateString() === yesterday.toDateString();
        
        dates.push({
          fullDate: newDate,
          day: formatDayOnly(newDate),
          date: formatMonthDateOnly(newDate),
          isDisabled: isYesterday,
          isToday: isToday(newDate)
        });
      }
      
      setVisibleDates(dates);
    };
    
    generateDates();
  }, [currentStartDate]);
  
  // Effect to scroll to the selected date when dates change
  useEffect(() => {
    // Give a small timeout to ensure the DOM has updated
    const scrollTimeout = setTimeout(() => {
      if (dateCardsContainerRef.current) {
        const selectedCard = document.getElementById('selected-date-card');
        if (selectedCard) {
          // Get container dimensions
          const container = dateCardsContainerRef.current;
          const containerRect = container.getBoundingClientRect();
          const cardRect = selectedCard.getBoundingClientRect();
          
          // Calculate the scroll position to center the card
          const scrollLeft = selectedCard.offsetLeft - (containerRect.width / 2) + (cardRect.width / 2);
          
          // Smooth scroll to the position
          container.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: 'smooth'
          });
        }
      }
    }, 100);
    
    return () => clearTimeout(scrollTimeout);
  }, [visibleDates, selectedDate]);
  // Navigate to previous set of dates
  const handlePrevious = () => {
    const newStartDate = new Date(currentStartDate);
    newStartDate.setDate(currentStartDate.getDate() - 7);
    
    // Don't go earlier than yesterday
    const yesterdayPlus1 = new Date(yesterday);
    yesterdayPlus1.setDate(yesterday.getDate() + 1); // Today
    
    if (newStartDate < yesterdayPlus1) {
      newStartDate.setDate(yesterdayPlus1.getDate());
    }
    setCurrentStartDate(newStartDate);
  };

  // Navigate to next set of dates
  const handleNext = () => {
    const newStartDate = new Date(currentStartDate);
    newStartDate.setDate(currentStartDate.getDate() + 7);
    setCurrentStartDate(newStartDate);
  };  // Handle date selection
  const handleDateSelect = (dateItem) => {
    if (!dateItem.isDisabled) {
      // Set the selected date immediately
      setSelectedDate(dateItem.date);
      setIsSearching(true);
      
      // Scroll to the selected date immediately for better feedback
      if (dateCardsContainerRef.current) {
        const index = visibleDates.findIndex(d => d.date === dateItem.date);
        if (index !== -1) {
          const scrollAmount = index * 83; // Approximate width of each date card + margin
          dateCardsContainerRef.current.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
      }
      
      // Format date in a format the parent component can use
      const formattedDate = dateItem.fullDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      // Notify parent component about date change
      if (onDateChange) {
        onDateChange(formattedDate, dateItem.fullDate);
        
        // Reset searching state after a bit
        setTimeout(() => {
          setIsSearching(false);
        }, 1200);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-gray-800">Select Travel Date</h3>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Left Arrow */}
        <button 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handlePrevious}
          aria-label="Previous dates"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>        {/* Date Cards */}
        <div 
          ref={dateCardsContainerRef}
          className="flex overflow-x-auto space-x-3 pb-2 no-scrollbar"
        >
          {visibleDates.map((dateItem, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(dateItem)}
              disabled={dateItem.isDisabled}
              id={selectedDate === dateItem.date ? 'selected-date-card' : ''}
              className={`
                rounded-lg p-2 min-w-[80px] h-[58px] flex flex-col items-center justify-center
                transition-all font-medium
                ${dateItem.isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                ${selectedDate === dateItem.date 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : dateItem.isToday
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              aria-pressed={selectedDate === dateItem.date}
            >
              <span className="text-sm font-semibold">
                {dateItem.day}
              </span>
              <span className="text-sm mt-1">
                {dateItem.date}
              </span>
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleNext}
          aria-label="Next dates"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DateSelector;