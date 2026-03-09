import { motion } from 'framer-motion';
import { FaCalendar, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';

const Timeline = ({ events }) => {
  const defaultEvents = [
    {
      month: 'March 2024',
      events: [
        { title: 'Education Drive in Chennai', beneficiaries: 450, location: 'Chennai' },
        { title: 'Health Camp in Mumbai', beneficiaries: 320, location: 'Mumbai' },
      ]
    },
    {
      month: 'February 2024',
      events: [
        { title: 'Food Distribution in Delhi', beneficiaries: 580, location: 'Delhi' },
        { title: 'Women Empowerment Workshop', beneficiaries: 210, location: 'Pune' },
      ]
    },
    {
      month: 'January 2024',
      events: [
        { title: 'Winter Relief Campaign', beneficiaries: 720, location: 'Multiple' },
      ]
    },
  ];

  const displayEvents = events || defaultEvents;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center space-x-2 mb-6">
        <FaCalendar className="text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Activity Timeline
        </h3>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
        {displayEvents.map((monthData, monthIndex) => (
          <div key={monthIndex} className="relative">
            {/* Month Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-2 z-10">
              <h4 className="text-sm font-semibold text-primary-600">
                {monthData.month}
              </h4>
            </div>

            {/* Events */}
            <div className="ml-4 space-y-4 mt-2">
              {monthData.events.map((event, eventIndex) => (
                <motion.div
                  key={eventIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (monthIndex * 0.2) + (eventIndex * 0.1) }}
                  className="relative pl-6 pb-4 border-l-2 border-primary-200 dark:border-primary-800 last:pb-0"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary-500 border-4 border-white dark:border-gray-900" />

                  {/* Event Card */}
                  <div className="glass-card rounded-lg p-4 hover:shadow-lg transition-all">
                    <h5 className="font-medium text-gray-800 dark:text-white mb-2">
                      {event.title}
                    </h5>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <FaUsers className="text-primary-500" />
                        <span>{event.beneficiaries} beneficiaries</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaMapMarkerAlt className="text-accent-500" />
                        <span>{event.location}</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Timeline;