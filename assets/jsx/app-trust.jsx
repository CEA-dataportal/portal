import { useState, useEffect, useMemo } from 'react'
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

const mediaTrustData = [  { date: "2023-01-01", org: "Gallup", indicator: "Trust in Media", country: "United States", value: 36, variable: "Trust" },
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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [mapSvg, setMapSvg] = useState<string>('')

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const response = await fetch('/assets/svg/World_Map.svg')
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const svg = await response.text()
        setMapSvg(svg)
      } catch (error) {
        console.error('Error loading SVG:', error)
        setMapSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="20" fill="gray">Map not available</text></svg>')
      }
    }
    loadSvg()
  }, [])

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

  const getSortedData = () => {
    const filtered = getFilteredData()
    const sorted = [...filtered]
    if (sortConfig !== null) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof typeof a]
        const bVal = b[sortConfig.key as keyof typeof b]
        if (aVal == null || bVal == null) return 0
        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1
        return 0
      })
    }
    return sorted
  }

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null
    return sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
  }

  const getAvailableOptions = (key: 'country' | 'date' | 'indicator') => {
    const filtered = getFilteredData()
    return ['All', ...new Set(filtered.map(item => item[key]))]
  }

  const availableCountries = useMemo(() => getAvailableOptions('country'), [searchTerm, selectedDate, selectedIndicator])
  const availableDates = useMemo(() => getAvailableOptions('date'), [searchTerm, selectedCountry, selectedIndicator])
  const availableIndicators = useMemo(() => getAvailableOptions('indicator'), [searchTerm, selectedCountry, selectedDate])

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

  const getFillColor = (value: number) => {
    if (value >= 60) return '#4CAF50'
    if (value >= 40) return '#FFC107'
    return '#F44336'
  }

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
        } else {
          path.setAttribute('fill', '#CCCCCC')
          path.setAttribute('opacity', '0.5')
        }
      }
    })

    svgElement.setAttribute('role', 'img')
    svgElement.setAttribute('aria-label', 'World trust map by country')

    return new XMLSerializer().serializeToString(svgElement)
  }

  const sortedData = getSortedData()
  const indicatorCountData = getIndicatorCountData()
  const averageByIndicator = getAverageByIndicator()
  const processedSvg = processSvg(mapSvg)

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* ... UI rendering code stays the same, but fix placeholder logic as previously described */}
    </div>
  )
}
