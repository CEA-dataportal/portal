const { useState, useEffect } = React

function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().toLowerCase())

  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v =>
      v.replace(/^"|"$/g, '').trim()
    )

    const item = {}

    headers.forEach((key, index) => {
      const val = values[index]
      if (key === 'value') {
        item.value = parseFloat(val)
      } else {
        item[key] = val
      }
    })

    return item
  })
}

function FullyFilteredMediaDashboard() {
  const [mediaTrustData, setMediaTrustData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOaHJvkHYWtyNwxgrmvAg7-PfNrzdV07da9wMhjutSpFS28H8m_MMTlXp4ZGLUvs_8mCZFJb4g96jl/pub?gid=0&single=true&output=csv"
        )
        const text = await res.text()
        const data = parseCSV(text)
        setMediaTrustData(data)
      } catch (error) {
        console.error("Failed to fetch CSV data:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Minimal Media Dashboard</h1>
      {mediaTrustData.length === 0 ? (
        <p className="text-center text-gray-500">Loading or no data available.</p>
      ) : (
        <ul className="space-y-2">
          {mediaTrustData.slice(0, 10).map((item, index) => (
            <li key={index} className="border p-4 rounded shadow-sm bg-gray-100">
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

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<FullyFilteredMediaDashboard />)