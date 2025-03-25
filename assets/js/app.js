// Define the CSV file URL
const csvFileUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2FwL08wnzkm_Ev8sir1PuzCbk7bEQB0mOEanlYnjM9Wkge8u4AULXmkdkUX3wDWN1SPBtXaEmhmEa/pub?gid=0&single=true&output=csv&force=on';

const predefinedOrder = [
    "All",
    "Safety Behaviours",
    "Social Cohesion",
    "Community-led Action",
    "Efficient Response",
    "Trusted Response"
  ];
  
  let selectedDimension = "All";
  let selectedCategory = "All";
  let selectedType = "All";
  let impactIndicators = [];
  let dimensions = [];
  let categories = [];
  let types = [];
  
  const dimensionTagsContainer = document.getElementById('dimension-tags');
  const categoryFilter = document.getElementById('category-filter');
  const typeFilter = document.getElementById('type-filter');
  const impactIndicatorsContainer = document.getElementById('impact-indicators');
  const toggleFiltersButton = document.getElementById('toggle-filters');
  const filtersContainer = document.getElementById('filters');
  const totalIndicatorsContainer = document.getElementById('total-indicators');
  
  async function fetchData() {
    try {
      const response = await fetch(csvFileUrl);
      const text = await response.text();
      const rows = text.split('\n');
      const headers = rows[0].split(',');
  
      // Debugging: Log the headers to ensure they are correct
      console.log("Headers:", headers);
  
      impactIndicators = rows.slice(1).map(row => {
        const values = row.split(',');
        const indicator = {};
        headers.forEach((header, index) => {
          indicator[header.trim().toLowerCase().replace(/ /g, '-')] = values[index].trim();
        });
  
        // Debugging: Log each indicator to ensure it is correctly mapped
        console.log("Parsed Indicator:", indicator);
  
        return {
          id: parseInt(indicator.id, 10),
          dimension: indicator.dimension,
          indicator: indicator.indicator, // Use 'indicator' instead of 'indicatorTitle'
          description: indicator.description,
          category: indicator.category,
          type: indicator.type, // Use 'type' instead of 'impact'
        };
      });
  
      // Filter out any indicators that are undefined or incomplete
      impactIndicators = impactIndicators.filter(indicator => indicator.id !== undefined && indicator.dimension !== undefined && indicator.indicator !== undefined);
  
      // Debugging: Log the filtered impact indicators
      console.log("Filtered Impact Indicators:", impactIndicators);
  
      // Extract unique dimensions
      dimensions = ["All", ...new Set(impactIndicators.map(indicator => indicator.dimension))];
  
      // Extract unique categories
      categories = ["All", ...new Set(impactIndicators.map(indicator => indicator.category))];
  
      // Extract unique types
      types = ["All", ...new Set(impactIndicators.map(indicator => indicator.type))];
  
      // Sort dimensions based on predefined order
      dimensions.sort((a, b) => {
        return predefinedOrder.indexOf(a) - predefinedOrder.indexOf(b);
      });
  
      // Debugging: Log the sorted dimensions
      console.log("Sorted Dimensions:", dimensions);
  
      // Debugging: Log the unique categories
      console.log("Unique Categories:", categories);
  
      // Debugging: Log the unique types
      console.log("Unique Types:", types);
  
      renderDimensionTags();
      renderCategoryFilter();
      renderTypeFilter();
      renderImpactIndicators();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  function renderDimensionTags() {
    dimensionTagsContainer.innerHTML = '';
    dimensions.forEach((dimension, index) => {
      const tag = document.createElement('div');
      tag.className = `tag Dim${index + 1} ${dimension === selectedDimension ? 'active' : ''}`;
      tag.textContent = dimension.charAt(0).toUpperCase() + dimension.slice(1);
      tag.addEventListener('click', () => {
        selectedDimension = dimension;
        renderDimensionTags();
        renderImpactIndicators();
      });
      dimensionTagsContainer.appendChild(tag);
    });
  }
  
  function renderCategoryFilter() {
    categoryFilter.innerHTML = '';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      if (category === selectedCategory) {
        option.selected = true;
      }
      categoryFilter.appendChild(option);
    });
  
    categoryFilter.addEventListener('change', () => {
      selectedCategory = categoryFilter.value;
      renderImpactIndicators();
    });
  }
  
  function renderTypeFilter() {
    typeFilter.innerHTML = '';
    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      if (type === selectedType) {
        option.selected = true;
      }
      typeFilter.appendChild(option);
    });
  
    typeFilter.addEventListener('change', () => {
      selectedType = typeFilter.value;
      renderImpactIndicators();
    });
  }
  
  function renderImpactIndicators() {
    impactIndicatorsContainer.innerHTML = '';
    const filteredIndicators = impactIndicators.filter(indicator => {
      return (selectedDimension === "All" || indicator.dimension === selectedDimension) &&
             (selectedCategory === "All" || indicator.category === selectedCategory) &&
             (selectedType === "All" || indicator.type === selectedType);
    });
  
    filteredIndicators.forEach(indicator => {
      const card = document.createElement('div');
      card.className = `bg-white rounded-lg shadow-md hover-shadow-lg transition-shadow duration-300 p-6`;
      card.innerHTML = `
        <div class="mb-4">
        <div class="text-lg text-gray-400 uppercase font-light">${indicator.type}</div>
          <h4 class="text-lg font-semibold mt-2">${indicator.indicator}</h4>
        </div>
        <div class="mb-4">
          <p class="text-gray-600">${indicator.description}</p>
        </div>
        <div class="flex justify-between items-center">
          <div class="text-xs text-gray-500 font-semibold">
           ${indicator.category.charAt(0).toUpperCase() + indicator.category.slice(1)} 
          </div>
          <button class="flex items-center text-blue-500 hover:text-blue-700">
            Learn More <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `;
      impactIndicatorsContainer.appendChild(card);
    });
  
    // Update the total indicators count
    totalIndicatorsContainer.textContent = filteredIndicators.length;
  }
  
  // Toggle filters visibility
  toggleFiltersButton.addEventListener('click', () => {
    filtersContainer.classList.toggle('hidden');
  });
  
  // Fetch data and render the initial UI
  fetchData();