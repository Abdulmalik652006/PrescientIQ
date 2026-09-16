import React from 'react'
import { Inbox } from 'lucide-react'

const EmptyState = ({ 
  title = 'No data available', 
  description = 'There is no data to display at this time.',
  icon: Icon = Inbox,
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
      <Icon className="w-12 h-12 text-secondary-400 mb-4" />
      <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
      <p className="text-secondary-500 text-sm mt-2 text-center max-w-md">{description}</p>
      {action && (
        <button onClick={action} className="mt-4 btn-primary text-sm">
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState