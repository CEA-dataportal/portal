const { useState, useEffect } = React;

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
    const item = {};
    headers.forEach((key, i) => {
      item[key] = key === 'value' ? parseFloat(values[i]) : values[i];
    });
    return item;
  });
}

function EnhancedDashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  useEffect(() => {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSOaHJvkHYWtyNwxgrmvAg7-PfNrzdV07da9wMhjutSpFS28H8m_MMTlXp4ZGLUvs_8mCZFJb4g96jl/pub?gid=0&single=true&output=csv")
      .then(res => res.text())
      .then(text => setData(parseCSV(text)))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const countries = ['All', ...new Set(data.map(item => item.country))];

  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesCountry = selectedCountry === 'All' || item.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const averageByIndicator = filteredData.reduce((acc, item) => {
    if (isNaN(item.value)) return acc;
    const existing = acc.find(i => i.indicator === item.indicator);
    if (existing) {
      existing.total += item.value;
      existing.count += 1;
    } else {
      acc.push({ indicator: item.indicator, total: item.value, count: 1 });
    }
    return acc;
  }, []).map(item => {
    const avg = Math.round((item.total / item.count) * 10) / 10;

    const values = filteredData
      .filter(d => d.indicator === item.indicator && !isNaN(d.value))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const latest = values[0];
    const previous = values[1];

    let changeLabel = 'no previous data';
    let changeClass = 'bg-gray-200 text-gray-600';

    if (latest && previous) {
      const change = Math.round((latest.value - previous.value) * 10) / 10;
      changeLabel = `${change > 0 ? '+' : ''}${change} from ${previous.date}`;
      changeClass = change > 0
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700';
    }

    return {
      indicator: item.indicator,
      average: avg,
      changeLabel,
      changeClass
    };
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-10">
      <h1 className="text-3xl font-bold text-center">Trust in Media Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          className="border rounded p-2 w-full md:w-1/2"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border rounded p-2 w-full md:w-1/2"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {averageByIndicator.map((item, i) => (
          <div key={i} className="p-4 bg-white rounded shadow">
            <h2 className="text-sm text-gray-500 mb-1">{item.indicator}</h2>
            <p className="text-2xl font-bold">{item.average}</p>
            <span className={`text-xs font-medium mt-1 inline-block rounded px-2 py-1 ${item.changeClass}`}>
              {item.changeLabel}
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded shadow divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Org</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Indicator</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Country</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Value</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Variable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{item.date}</td>
                <td className="px-4 py-2 text-sm">{item.org}</td>
                <td className="px-4 py-2 text-sm">{item.indicator}</td>
                <td className="px-4 py-2 text-sm">{item.country}</td>
                <td className="px-4 py-2 text-sm">{isNaN(item.value) ? 'N/A' : item.value}</td>
                <td className="px-4 py-2 text-sm">{item.variable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ReactDOM.render(<EnhancedDashboard />, document.getElementById('root'));