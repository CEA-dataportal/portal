const { useState, useEffect } = React;
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR2FwL08wnzkm_Ev8sir1PuzCbk7bEQB0mOEanlYnjM9Wkge8u4AULXmkdkUX3wDWN1SPBtXaEmhmEa/pub?gid=1995455583&single=true&output=csv&force=on"; // replace with your actual link


function App() {
    const [elements, setElements] = useState([]);
    const [selectedElements, setSelectedElements] = useState([]);
    const [highlighted, setHighlighted] = useState([]);
  
    useEffect(() => {
      fetch(CSV_URL)
        .then(res => res.text())
        .then(csvText => {
          const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
          });
  
          const data = parsed.data.map(row => ({
            id: row.id,
            type: row.type,
            title: row.title,
            subtitle: row.subtitle || "",
            description: row.description || "",
            related: row.related ? row.related.split(",").map(r => r.trim()) : []
          }));
  
          setElements(data);
        });
    }, []);
  
    const handleClick = (el, event) => {
      const isMulti = event.metaKey || event.ctrlKey;
  
      if (el.type !== "outcome") {
        setSelectedElements([el]);
        setHighlighted(el.related);
        return;
      }
  
      if (isMulti) {
        const alreadySelected = selectedElements.find(sel => sel.id === el.id);
        const newSelection = alreadySelected
          ? selectedElements.filter(sel => sel.id !== el.id)
          : [...selectedElements, el];
  
        setSelectedElements(newSelection);
        const allRelated = newSelection.flatMap(sel => sel.related);
        setHighlighted([...new Set(allRelated)]);
      } else {
        setSelectedElements([el]);
        setHighlighted(el.related);
      }
    };
  
    const groupByType = (type) => elements.filter(el => el.type === type);
  
    const groupInputsBySubtitle = () => {
      const grouped = {};
      elements
        .filter(el => el.type === "input")
        .forEach(el => {
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
  
    const renderSection = (label, type) => {
      const isGrid = type === "goal" || type === "outcome";
      return (
        <div className="section-grid-row">
          <div className="section-header-cell">{label}</div>
          <div className={isGrid ? "section-card-grid" : "section-card-row"}>
            {groupByType(type).map(el => {
              const isSelected = selectedElements.find(sel => sel.id === el.id);
              const isRelated = highlighted.includes(el.id);
  
              return (
                <div
                  key={el.id}
                  className={`card ${el.type} 
                    ${isRelated ? "highlighted" : ""}
                    ${isSelected ? "selected" : ""}
                  `}
                  onClick={(e) => handleClick(el, e)}
                >
                  <div className="tooltip">
                    {el.type === "goal" && el.subtitle && (
                      <p className="subtitle">{el.subtitle.toUpperCase()}</p>
                    )}
                    {el.type === "output" ? <h4>{el.title}</h4> : <h3>{el.title}</h3>}
                    <div className="tooltip-content">
                      <strong>{el.title}</strong>
                      {el.type === "goal" && el.subtitle && (
                        <div className="tooltip-sub">{el.subtitle}</div>
                      )}
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
      );
    };
  
    const exportSelectionAsImage = () => {
      const node = document.getElementById("export-area");
  
      const allCards = node.querySelectorAll(".card");
      const allHeaders = node.querySelectorAll(".section-header-cell");
  
      // Hide unselected/unrelated cards
      allCards.forEach(card => {
        if (
          !card.classList.contains("highlighted") &&
          !card.classList.contains("selected")
        ) {
          card.style.display = "none";
        }
      });
  
      // Hide vertical headers (to avoid top/bottom duplication)
      allHeaders.forEach(header => {
        header.style.visibility = "hidden";
      });
  
      // Export as canvas
      html2canvas(node, { useCORS: true }).then(canvas => {
        const link = document.createElement("a");
        link.download = "selected-framework.png";
        link.href = canvas.toDataURL();
        link.click();
  
        // Restore cards & headers
        allCards.forEach(card => {
          card.style.display = "";
        });
        allHeaders.forEach(header => {
          header.style.visibility = "";
        });
      });
    };
  
    return (
      <div>
        <h1>Framework Visualization</h1>
  
        <div id="export-area">
          {renderSection("Goals", "goal")}
          {renderSection("Outcomes", "outcome")}
  
          <div className="section-grid-row">
            <div className="section-header-cell">Outputs</div>
            <div className="output-grid-wrapper">
              {chunkArray(groupByType("output"), 6).map((row, i) => (
                <div className="output-card-row" key={i}>
                  {row.map(el => {
                    const isSelected = selectedElements.find(sel => sel.id === el.id);
                    const isRelated = highlighted.includes(el.id);
  
                    return (
                      <div
                        key={el.id}
                        className={`card ${el.type} 
                          ${isRelated ? "highlighted" : ""}
                          ${isSelected ? "selected" : ""}
                        `}
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
                    {inputs.map(el => {
                      const isSelected = selectedElements.find(sel => sel.id === el.id);
                      const isRelated = highlighted.includes(el.id);
  
                      return (
                        <div
                          key={el.id}
                          className={`card ${el.type} 
                            ${isRelated ? "highlighted" : ""}
                            ${isSelected ? "selected" : ""}
                          `}
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
  
        {/* Hint box for multi-select */}
        <div className="multi-select-hint">
          Hold <kbd>⌘</kbd> / <kbd>Ctrl</kbd> and click outcomes to multi-select
        </div>
  
        {/* Export button */}
        <button onClick={exportSelectionAsImage} className="export-btn">
          Export Selected View
        </button>
      </div>
    );
  }
  
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);