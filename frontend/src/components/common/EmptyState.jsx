import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'No data found', description = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-secondary-400" />
    </div>
    <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-200 mb-1">{title}</h3>
    {description && <p className="text-secondary-500 dark:text-secondary-400 text-sm max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
