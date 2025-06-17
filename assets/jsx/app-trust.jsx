import { useState, useEffect } from 'react'

type MediaTrustItem = {
  date: string
  country: string
  indicator: string
  value: number
}

export default function FullyFilteredMediaDashboard() {
  const [mediaTrustData, setMediaTrustData] = useState<MediaTrustItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSOaHJvkHYWtyNwxgrmvAg7-PfNrzdV07da9wMhjutSpFS28H8m_MMTlXp4ZGLUvs_8mCZFJb4g96jl/pub?gid=0&single=true&output=csv")
        const text = await res.text()
        const rows = text.trim().split('\n')
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase())

        const data = rows.slice(1).map(row => {
          const values = row.split(',')
          const item: any = {}
          headers.forEach((key, i) => {
            item[key] = key === 'value' ? Number(values[i]) : values[i]
          })
          return item as MediaTrustItem
        })

        setMediaTrustData(data)
      } catch (error) {
        console.error("Failed to fetch CSV data:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Minimal Media Dashboard</h1>
      {mediaTrustData.length === 0 ? (
        <p>Loading or no data available.</p>
      ) : (
        <ul className="space-y-2">
          {mediaTrustData.slice(0, 10).map((item, index) => (
            <li key={index} className="border p-2 rounded">
              <p><strong>Date:</strong> {item.date}</p>
              <p><strong>Country:</strong> {item.country}</p>
              <p><strong>Indicator:</strong> {item.indicator}</p>
              <p><strong>Value:</strong> {item.value}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
