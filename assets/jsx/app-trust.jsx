import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "/components/ui/card"
import { Input } from "/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUp, ArrowDown } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Sample data from the table with more dates for filtering
const mediaTrustData = [
  { date: "2023-01-01", org: "Gallup", indicator: "Trust in Media", country: "United States", value: 36, variable: "Trust" },
  { date: "2023-01-01", org: "Gallup", indicator: "Trust in Media", country: "Canada", value: 58, variable: "Trust" },
  { date: "2023-01-01", org: "Gallup", indicator: "Trust in Media", country: "United Kingdom", value: 42, variable: "Trust" },
  { date: "2023-01-01", org: "Gallup", indicator: "Trust in Media", country: "Germany", value: 47, variable: "Trust" },
  { date: "2023-01-01", org: "Gallup", indicator: "Trust in Media", country: "France", value: 39, variable: "Trust" },
  { date: "2023-01-01", org: "Gallup", indicator: "Trust in Media", country: "Japan", value: 45, variable: "Trust" },
  { date: "2023-01-01", org: "Gallup", indicator: "Trust in Media", country: "Australia", value: 53, variable: "Trust" },
  { date: "2023-01-01", org: "Gallup", indicator: "Trust in Media", country: "Brazil", value: 32, variable: "Trust" },
  { date: "2023-01-01", org: "Gallup", indicator: "Trust in Media", country: "India", value: 61, variable: "Trust" },
  { date: "2023-01-01", org: "Gallup", indicator: "Trust in Media", country: "South Africa", value: 48, variable: "Trust" },
  { date: "2022-12-01", org: "Gallup", indicator: "Trust in Media", country: "United States", value: 34, variable: "Trust" },
  { date: "2022-12-01", org: "Gallup", indicator: "Trust in Media", country: "Canada", value: 56, variable: "Trust" },
  { date: "2022-12-01", org: "Gallup", indicator: "Trust in Media", country: "United Kingdom", value: 40, variable: "Trust" },
  { date: "2023-01-01", org: "Pew Research", indicator: "Media Accuracy", country: "United States", value: 44, variable: "Accuracy" },
  { date: "2023-01-01", org: "Pew Research", indicator: "Media Accuracy", country: "Canada", value: 52, variable: "Accuracy" },
  { date: "2023-01-01", org: "Pew Research", indicator: "Media Accuracy", country: "Germany", value: 56, variable: "Accuracy" },
  { date: "2023-01-01", org: "Pew Research", indicator: "Media Accuracy", country: "France", value: 48, variable: "Accuracy" },
  { date: "2023-01-01", org: "Pew Research", indicator: "Media Accuracy", country: "Japan", value: 62, variable: "Accuracy" },
]

// Country to ISO code mapping
const countryToCode = {
  'United States': 'us',
  'Canada': 'ca',
  'United Kingdom': 'gb',
  'Germany': 'de',
  'France': 'fr',
  'Japan': 'jp',
  'Australia': 'au',
  'Brazil': 'br',
  'India': 'in',
  'South Africa': 'za'
}

export default function FullyFilteredMediaDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('All')
  const [selectedDate, setSelectedDate] = useState('All')
  const [selectedIndicator, setSelectedIndicator] = useState('All')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [mapSvg, setMapSvg] = useState<string>('')

  // Load the SVG map
  useEffect(() => {
    fetch('https://simplemaps.com/static/demos/resources/svg-library/svgs/world.svg')
      .then(response => response.text())
      .then(svg => setMapSvg(svg))
      .catch(error => console.error('Error loading SVG:', error))
  }, [])

  // Get filtered data based on all active filters
  const getFilteredData = () => {
    return mediaTrustData.filter(item => {
      const matchesSearch = Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
      const matchesCountry = selectedCountry === 'All' || item.country === selectedCountry
      const matchesDate = selectedDate === 'All' || item.date === selectedDate
      const matchesIndicator = selectedIndicator === 'All' || item.indicator === selectedIndicator
      return matchesSearch && matchesCountry && matchesDate && matchesIndicator
    })
  }

  // Get unique values for filters based on current filters
  const getAvailableCountries = () => {
    const filtered = getFilteredData()
    return ['All', ...new Set(filtered.map(item => item.country))]
  }

  const getAvailableDates = () => {
    const filtered = getFilteredData()
    return ['All', ...new Set(filtered.map(item => item.date))]
  }

  const getAvailableIndicators = () => {
    const filtered = getFilteredData()
    return ['All', ...new Set(filtered.map(item => item.indicator))]
  }

  // Sorting logic
  const getSortedData = () => {
    const filtered = getFilteredData()
    const sorted = [...filtered]
    if (sortConfig !== null) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    return sorted
  }

  const requestSort = (key: string) => {
    let direction = 'ascending'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null
    return sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
  }

  // Prepare chart data - count of countries by indicator (filtered)
  const getIndicatorCountData = () => {
    const filtered = getFilteredData()
    return filtered.reduce((acc, item) => {
      const existing = acc.find(i => i.indicator === item.indicator)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ indicator: item.indicator, count: 1 })
      }
      return acc
    }, [] as { indicator: string; count: number }[])
  }

  // Calculate average value by indicator (filtered)
  const getAverageByIndicator = () => {
    const filtered = getFilteredData()
    return filtered.reduce((acc, item) => {
      const existing = acc.find(i => i.indicator === item.indicator)
      if (existing) {
        existing.total += item.value
        existing.count += 1
      } else {
        acc.push({ indicator: item.indicator, total: item.value, count: 1 })
      }
      return acc
    }, [] as { indicator: string; total: number; count: number }[])
      .map(item => ({
        indicator: item.indicator,
        average: Math.round((item.total / item.count) * 10) / 10,
        count: item.count
      }))
  }

  // Get fill color based on value
  const getFillColor = (value: number) => {
    if (value >= 60) return '#4CAF50' // Green for high trust
    if (value >= 40) return '#FFC107' // Yellow for medium trust
    return '#F44336' // Red for low trust
  }

  // Process SVG to add interactivity with current filters
  const processSvg = (svgString: string) => {
    if (!svgString) return svgString

    const filteredData = getFilteredData()
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgElement = doc.querySelector('svg')

    if (!svgElement) return svgString

    const paths = svgElement.querySelectorAll('path')

    paths.forEach(path => {
      const countryId = path.id.toLowerCase()
      const countryName = Object.keys(countryToCode).find(
        key => countryToCode[key as keyof typeof countryToCode] === countryId
      )

      if (countryName) {
        const countryData = filteredData.find(item => 
          item.country === countryName && 
          (selectedDate === 'All' || item.date === selectedDate) &&
          (selectedIndicator === 'All' || item.indicator === selectedIndicator)
        )

        if (countryData) {
          path.setAttribute('fill', getFillColor(countryData.value))
          path.setAttribute('opacity', hoveredCountry === countryName ? '1' : '0.7')
          path.setAttribute('stroke', '#FFFFFF')
          path.setAttribute('stroke-width', '0.5')
          path.setAttribute('class', 'cursor-pointer transition-opacity duration-200')
          path.addEventListener('mouseenter', () => setHoveredCountry(countryName))
          path.addEventListener('mouseleave', () => setHoveredCountry(null))
        } else {
          path.setAttribute('fill', '#CCCCCC')
          path.setAttribute('opacity', '0.5')
        }
      }
    })

    return new XMLSerializer().serializeToString(svgElement)
  }

  const processedSvg = processSvg(mapSvg)
  const sortedData = getSortedData()
  const indicatorCountData = getIndicatorCountData()
  const averageByIndicator = getAverageByIndicator()
  const availableCountries = getAvailableCountries()
  const availableDates = getAvailableDates()
  const availableIndicators = getAvailableIndicators()

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Trust in Media Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Select 
              value={selectedCountry} 
              onValueChange={setSelectedCountry}
              disabled={availableCountries.length <= 1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={selectedDate} 
              onValueChange={setSelectedDate}
              disabled={availableDates.length <= 1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map(date => (
                  <SelectItem key={date} value={date}>{date}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={selectedIndicator} 
              onValueChange={setSelectedIndicator}
              disabled={availableIndicators.length <= 1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by indicator" />
              </SelectTrigger>
              <SelectContent>
                {availableIndicators.map(indicator => (
                  <SelectItem key={indicator} value={indicator}>{indicator}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {averageByIndicator.length > 0 ? (
              averageByIndicator.map((item, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.indicator}</CardDescription>
                    <CardTitle className="text-3xl font-bold">{item.average}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Average across {item.count} countries</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>No data available</CardTitle>
                  <CardDescription>Try adjusting your filters</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          {/* World Map Visualization Section */}
          <div className="h-[500px] mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Trust in Media by Country</CardTitle>
                <CardDescription>
                  {selectedDate !== 'All' && `Date: ${selectedDate} | `}
                  {selectedIndicator !== 'All' && `Indicator: ${selectedIndicator}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {mapSvg ? (
                    <>
                      <div 
                        className="border rounded-lg overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: processedSvg }}
                      />
                      {hoveredCountry && (
                        <div className="absolute bg-white p-2 rounded shadow-lg border border-gray-200">
                          <p className="font-semibold">{hoveredCountry}</p>
                          {sortedData.find(c => c.country === hoveredCountry) && (
                            <>
                              <p>Value: {sortedData.find(c => c.country === hoveredCountry)?.value}</p>
                              <p>Indicator: {sortedData.find(c => c.country === hoveredCountry)?.indicator}</p>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-80">
                      <p>Loading world map...</p>
                    </div>
                  )}
                  <div className="flex justify-center mt-4 space-x-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#F44336] mr-2"></div>
                      <span>Low (0-39)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#FFC107] mr-2"></div>
                      <span>Medium (40-59)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#4CAF50] mr-2"></div>
                      <span>High (60+)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <div className="h-[400px] mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Countries by Indicator</CardTitle>
                <CardDescription>Number of countries reporting each indicator</CardDescription>
              </CardHeader>
              <CardContent>
                {indicatorCountData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={indicatorCountData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="indicator" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Number of Countries" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-80">
                    <p>No data available for current filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Data Table Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('date')}
                  >
                    Date {getSortIcon('date')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indicator
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('country')}
                  >
                    Country {getSortIcon('country')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('value')}
                  >
                    Value {getSortIcon('value')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variable
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.length > 0 ? (
                  sortedData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.org}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.indicator}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.country}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.value}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.variable}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No data found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}