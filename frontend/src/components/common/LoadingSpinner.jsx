import React from 'react'

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizes[size]} border-primary-500 border-t-transparent rounded-full animate-spin`} />
      {message && <p className="mt-4 text-secondary-500 text-sm">{message}</p>}
    </div>
  )
}

export default LoadingSpinner