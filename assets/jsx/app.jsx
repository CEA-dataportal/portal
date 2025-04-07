const { useState, useEffect } = React;
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR2FwL08wnzkm_Ev8sir1PuzCbk7bEQB0mOEanlYnjM9Wkge8u4AULXmkdkUX3wDWN1SPBtXaEmhmEa/pub?gid=1995455583&single=true&output=csv&force=on"; // framework
const INDICATORS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR2FwL08wnzkm_Ev8sir1PuzCbk7bEQB0mOEanlYnjM9Wkge8u4AULXmkdkUX3wDWN1SPBtXaEmhmEa/pub?gid=0&single=true&output=csv&force=on"; // indicator


function App() {
  const [elements, setElements] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState([]);

  const [selectedElements, setSelectedElements] = useState([]);
  const [highlighted, setHighlighted] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("framework");

  useEffect(() => {
    fetch(CSV_URL)
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        const data = parsed.data.map((row) => ({
          id: row.id,
          type: row.type,
          title: row.title,
          subtitle: row.subtitle || "",
          description: row.description || "",
          related: row.related ? row.related.split(",").map((r) => r.trim()) : [],
        }));
        setElements(data);
      });
  }, []);

  useEffect(() => {
    fetch(INDICATORS_CSV_URL)
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        setIndicators(parsed.data);
      });
  }, []);

  const toggleRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleClick = (el, event) => {
    const isMulti = event.metaKey || event.ctrlKey;
    if (el.type !== "outcome") {
      setSelectedElements([el]);
      setHighlighted(el.related);
      return;
    }

    if (isMulti) {
      const alreadySelected = selectedElements.find((sel) => sel.id === el.id);
      const newSelection = alreadySelected
        ? selectedElements.filter((sel) => sel.id !== el.id)
        : [...selectedElements, el];
      setSelectedElements(newSelection);
      const allRelated = newSelection.flatMap((sel) => sel.related);
      setHighlighted([...new Set(allRelated)]);
    } else {
      setSelectedElements([el]);
      setHighlighted(el.related);
    }
  };

  const groupByType = (type) => elements.filter((el) => el.type === type);
  const groupInputsBySubtitle = () => {
    const grouped = {};
    elements
      .filter((el) => el.type === "input")
      .forEach((el) => {
        const key = el.subtitle || "Other";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(el);
      });
    return grouped;
  };

  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const exportSelectionAsImage = () => {
    const node = document.getElementById("export-area");
    const allCards = node.querySelectorAll(".card");
    const allHeaders = node.querySelectorAll(".section-header-cell");

    allCards.forEach((card) => {
      if (
        !card.classList.contains("highlighted") &&
        !card.classList.contains("selected")
      ) {
        card.style.display = "none";
      }
    });

    allHeaders.forEach((header) => {
      header.style.visibility = "hidden";
    });

    html2canvas(node, { useCORS: true }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "selected-framework.png";
      link.href = canvas.toDataURL();
      link.click();

      allCards.forEach((card) => (card.style.display = ""));
      allHeaders.forEach((header) => (header.style.visibility = ""));
    });
  };

  const renderSection = (label, type) => {
    const isGrid = type === "goal" || type === "outcome";
    return (
      <div className="section-grid-row">
        <div className="section-header-cell">{label}</div>
        <div className={isGrid ? "section-card-grid" : "section-card-row"}>
          {groupByType(type).map((el) => {
            const isSelected = selectedElements.find((sel) => sel.id === el.id);
            const isRelated = highlighted.includes(el.id);
            return (
              <div
                key={el.id}
                className={`card ${el.type} ${
                  isRelated ? "highlighted" : ""
                } ${isSelected ? "selected" : ""}`}
                onClick={(e) => handleClick(el, e)}
              >
                <div className="tooltip">
                  {el.type === "goal" && el.subtitle && (
                    <p className="subtitle">{el.subtitle.toUpperCase()}</p>
                  )}
                  {el.type === "output" ? <h4>{el.title}</h4> : <h3>{el.title}</h3>}
                  <div className="tooltip-content">
                    <strong>{el.title}</strong>
                    {el.description && <div className="tooltip-desc">{el.description}</div>}
                    <div className="tooltip-type">{el.type}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-nav">
          <button
            className={`nav-btn ${activePage === "framework" ? "active" : ""}`}
            onClick={() => setActivePage("framework")}
          >
            Framework
          </button>
          <button
            className={`nav-btn ${activePage === "indicators" ? "active" : ""}`}
            onClick={() => setActivePage("indicators")}
          >
            Indicators
          </button>
        </div>
        <button className="export-btn" onClick={exportSelectionAsImage}>
          Export Selected View
        </button>
      </div>

      {/* Sidebar Toggle */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? "→" : "☰"}
      </button>

      {/* Framework View */}
      {activePage === "framework" && (
        <div id="export-area">
          <h2>Framework</h2>
          {renderSection("Goals", "goal")}
          {renderSection("Outcomes", "outcome")}

          <div className="section-grid-row">
            <div className="section-header-cell">Outputs</div>
            <div className="output-grid-wrapper">
              {chunkArray(groupByType("output"), 6).map((row, i) => (
                <div className="output-card-row" key={i}>
                  {row.map((el) => {
                    const isSelected = selectedElements.find((sel) => sel.id === el.id);
                    const isRelated = highlighted.includes(el.id);
                    return (
                      <div
                        key={el.id}
                        className={`card ${el.type} ${
                          isRelated ? "highlighted" : ""
                        } ${isSelected ? "selected" : ""}`}
                        onClick={(e) => handleClick(el, e)}
                      >
                        <div className="tooltip">
                          <h4>{el.title}</h4>
                          <div className="tooltip-content">
                            <strong>{el.title}</strong>
                            {el.description && (
                              <div className="tooltip-desc">{el.description}</div>
                            )}
                            <div className="tooltip-type">{el.type}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="section-grid-row">
            <div className="section-header-cell">Inputs</div>
            <div className="input-group-columns">
              {Object.entries(groupInputsBySubtitle()).map(([subtitle, inputs]) => (
                <div key={subtitle} className="input-group-column">
                  <div className="input-group-header">{subtitle}</div>
                  <div className="input-group-list-vertical">
                    {inputs.map((el) => {
                      const isSelected = selectedElements.find((sel) => sel.id === el.id);
                      const isRelated = highlighted.includes(el.id);
                      return (
                        <div
                          key={el.id}
                          className={`card ${el.type} ${
                            isRelated ? "highlighted" : ""
                          } ${isSelected ? "selected" : ""}`}
                          onClick={(e) => handleClick(el, e)}
                        >
                          <div className="tooltip">
                            <h3>{el.title}</h3>
                            <div className="tooltip-content">
                              <strong>{el.title}</strong>
                              {el.description && (
                                <div className="tooltip-desc">{el.description}</div>
                              )}
                              <div className="tooltip-type">{el.type}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Indicators View */}
      {activePage === "indicators" && (
        <div className="indicators-view">
          <h2>Indicators</h2>

          <div className="indicator-filters">
            <label htmlFor="typeFilter">Filter by Type:</label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="goal">Goal</option>
              <option value="outcome">Outcome</option>
              <option value="output">Output</option>
              <option value="input">Input</option>
            </select>
          </div>

          <table className="indicators-table">
            <thead>
              <tr>
                <th></th>
                <th>Indicator</th>
                <th>Dimension</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {indicators
                .filter((ind) => typeFilter === "all" || ind.type === typeFilter)
                .map((ind, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td>
                        <button
                          className="expand-btn"
                          onClick={() => toggleRow(index)}
                        >
                          {expandedRows.includes(index) ? "−" : "+"}
                        </button>
                      </td>
                      <td>{ind.indicator}</td>
                      <td>{ind.dimension}</td>
                      <td>
                        <span className={`type-label ${ind.type}`}>{ind.type}</span>
                      </td>
                      <td>{ind.category}</td>
                      <td>{ind.description}</td>
                    </tr>
                    {expandedRows.includes(index) && (
                      <tr className="calculation-row">
                        <td colSpan="6" className="calculation-cell">
                          <strong>Calculation:</strong> {ind.calculation || "N/A"}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
