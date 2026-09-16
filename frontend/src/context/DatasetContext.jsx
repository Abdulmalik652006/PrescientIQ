import React, { createContext, useState, useContext, useEffect } from 'react'

const DatasetContext = createContext()

export const useDataset = () => useContext(DatasetContext)

const STORAGE_KEY = 'predictive_active_dataset'

export const DatasetProvider = ({ children }) => {
  const [activeDataset, setActiveDataset] = useState(null)
  const [isUploaded, setIsUploaded] = useState(false)

  // Load dataset from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.summary) {
          setActiveDataset(parsed)
          setIsUploaded(true)
        }
      }
    } catch (e) {
      console.error('Failed to load active dataset from storage:', e)
    }
  }, [])

  // Function to save newly uploaded dataset
  const saveUploadedDataset = (fileInfo, datasetData) => {
    const datasetPayload = {
      file: {
        name: fileInfo.name,
        size: fileInfo.size,
        type: fileInfo.name.split('.').pop()?.toUpperCase() || 'CSV'
      },
      summary: datasetData.summary || {
        rows: datasetData.performance?.length || 0,
        columns: 7,
        dateRange: 'Recent Dataset'
      },
      kpis: datasetData.kpis || null,
      performance: datasetData.performance || [],
      predictions: datasetData.predictions || [],
      riskData: datasetData.riskData || [],
      utilizationData: datasetData.utilizationData || [],
      insight: datasetData.insight || 'Custom uploaded dataset loaded successfully.',
      timestamp: new Date().toISOString()
    }

    setActiveDataset(datasetPayload)
    setIsUploaded(true)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datasetPayload))
    } catch (e) {
      console.error('Failed to persist dataset to storage:', e)
    }
  }

  // Clear uploaded dataset and revert to standard seed data
  const clearDataset = () => {
    setActiveDataset(null)
    setIsUploaded(false)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to remove dataset from storage:', e)
    }
  }

  return (
    <DatasetContext.Provider
      value={{
        activeDataset,
        isUploaded,
        saveUploadedDataset,
        clearDataset
      }}
    >
      {children}
    </DatasetContext.Provider>
  )
}
