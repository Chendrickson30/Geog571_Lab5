//LAB 5: Interactive Narrative Cartography
// 1.	Fetches a point geojson file (an example of this would be the airports geojson we’ve used in class).
// 2.	Fetches a polygon geojson file (for example, country or state outlines, etc.).
// 3.	Uses turf.js (or a library of your choice) to add up the total number of points in each polygon and creates a choropleth map of these counts.
// 4.	Uses additional data of some sort (total area of a polygon, total population, etc.) to normalize the data and create a second polygon based on rates.
// 5.	Each map should at least have a title and a legend, scale bar and so forth are optional. Title can be in the HTML and not the map itself.

var map = L.map('map').setView([37.8, -96], 4);

var Stadia_StamenToner = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map);

// Fetch point GeoJSON file
fetch('data/usSpadefoot_points.geojson')
    .then(response => response.json())
    .then(pointData => {
        // Calculate total number of observations
        var totalObservations = pointData.features.length;
        console.log("Total observations:", totalObservations);

        // Fetch polygon GeoJSON file
        fetch('data/usSpadefoot_polygons.geojson')
            .then(response => response.json())
            .then(polygonData => {
                // Initialize an object to store counts
                var counts = {};

                // Loop through each feature in the polygon data
                polygonData.features.forEach(polygon => {
                    // Initialize count for the current polygon
                    counts[polygon.properties.name] = 0;

                    // Loop through each feature in the point data
                    pointData.features.forEach(point => {
                        // Check if the point is within the current polygon
                        if (turf.booleanPointInPolygon(point.geometry.coordinates, polygon)) {
                            // Increment the count for the current polygon
                            counts[polygon.properties.name]++;
                        }
                    });
                });

                // Create choropleth map
                var geojsonLayer = L.geoJSON(polygonData, {
                    style: function (feature) {
                        var count = counts[feature.properties.name] || 0;
                        var color = getColor(count);
                        return { color: '#000', weight: 1, fillColor: color, fillOpacity: 0.8 };
                    },
                    onEachFeature: onEachFeature
                }).addTo(map);

                function getColor(d) {
                    return d > 500 ? '#800026' :
                        d > 200 ? '#BD0026' :
                        d > 100 ? '#E31A1C' :
                        d > 50 ? '#FC4E2A' :
                        d > 10 ? '#FD8D3C' :
                        d > 1 ? '#FEB24C' :
                        '#FFEDA0';
                }
               
                // Add legend
                var legend = L.control({ position: 'bottomright' });
                legend.onAdd = function (map) {
                    var div = L.DomUtil.create('div', 'info legend');
                    var grades = [0, 1, 10, 50, 100, 200, 500];
                    var labels = [];

                    for (var i = 0; i < grades.length; i++) {
                        div.innerHTML +=
                            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                    }

                    return div;
                };
                legend.addTo(map);

                // Control that shows state info on hover
                var info = L.control();

                info.onAdd = function (map) {
                    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                    this.update();
                    return this._div;
                };

                info.update = function (props) {
                    this._div.innerHTML = '<h4>US Spadefoot Toad Observations</h4>' + (props ?
                        '<b>' + props.name + '</b><br />' + (counts[props.name] || 0) + ' iNaturalist Observations' :
                        'Hover over a state');
                };

                info.addTo(map);

                function highlightFeature(e) {
                    var layer = e.target;

                    layer.setStyle({
                        weight: 5,
                        color: '#fc4e2a',
                        dashArray: '',
                        fillOpacity: 0.7
                    });

                    layer.bringToFront();
                    info.update(layer.feature.properties);
                }

                function resetHighlight(e) {
                    var layer = e.target;
                    geojsonLayer.resetStyle(layer);
                    info.update();
                }

                function onEachFeature(feature, layer) {
                    layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight
                    });
                }
            })
            .catch(error => console.error('Error loading polygon GeoJSON file:', error));
    })
    .catch(error => console.error('Error loading point GeoJSON file:', error));



//total observations = 8708

//Map of cout ratios 
var map2 = L.map('map2').setView([37.8, -96], 4);

var Stadia_StamenToner = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map2);

// Fetch point GeoJSON file
fetch('data/usSpadefoot_points.geojson')
    .then(response => response.json())
    .then(pointData => {
        // Calculate total number of observations
        var totalObservations = pointData.features.length;
        console.log("Total observations:", totalObservations);

        // Fetch polygon GeoJSON file
        fetch('data/usSpadefoot_polygons.geojson')
            .then(response => response.json())
            .then(polygonData => {
                // Initialize an object to store rates
                var rates = {};

                // Initialize an object to store counts
                var counts = {};

                // Loop through each feature in the polygon data
                polygonData.features.forEach(polygon => {
                    // Initialize count for the current polygon
                    counts[polygon.properties.name] = 0;

                    // Loop through each feature in the point data
                    pointData.features.forEach(point => {
                        // Check if the point is within the current polygon
                        if (turf.booleanPointInPolygon(point.geometry.coordinates, polygon)) {
                            // Increment the count for the current polygon
                            counts[polygon.properties.name]++;
                        }
                    });

                    // Calculate rate for the current polygon
                    rates[polygon.properties.name] = counts[polygon.properties.name] / totalObservations;
                });

                // Create choropleth map
                var geojsonLayer = L.geoJSON(polygonData, {
                    style: function (feature) {
                        var rate = rates[feature.properties.name] || 0;
                        var color = getColor(rate);
                        return { color: '#000', weight: 1, fillColor: color, fillOpacity: 0.8 };
                    },
                    onEachFeature: onEachFeature
                }).addTo(map2);

                function getColor(d) {
                    return d > 0.15 ? '#800026' :
                        d > 0.05 ? '#BD0026' :
                        d > 0.02 ? '#E31A1C' :
                        d > 0.01 ? '#FC4E2A' :
                        d > 0.005 ? '#FD8D3C' :
                        d > 0.0001 ? '#FEB24C' :
                        '#FFEDA0';
                }

                // Add legend
                var legend = L.control({ position: 'bottomright' });
                legend.onAdd = function (map) {
                    var div = L.DomUtil.create('div', 'info legend');
                    var grades = [0, 0.0001, 0.005, 0.01, 0.02, 0.05, 0.15];
                    var labels = ['0 observations', '0.01 - 0.05%', '0.05 - 1%', '1-2%', '2-5%', '5-15%', '15-20%'];

                    for (var i = 0; i < grades.length; i++) {
                        div.innerHTML +=
                            '<i style="background:' + getColor(grades[i] + 0.001) + '"></i> ' +
                            labels[i] + '<br>';
                    }

                    return div;
                };
                legend.addTo(map2);

                // Control that shows state info on hover
                var info = L.control();

                info.onAdd = function (map2) {
                    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                    this.update();
                    return this._div;
                };

                info.update = function (props) {
                    this._div.innerHTML = '<h4>US Spadefoot Toad Observations</h4>' + (props ?
                        '<b>' + props.name + '</b><br />' + (rates[props.name] ? (rates[props.name] * 100).toFixed(2) + '% of observations' : 'No observations') :
                        'Hover over a state');
                };

                info.addTo(map2);

                function highlightFeature(e) {
                    var layer = e.target;

                    layer.setStyle({
                        weight: 5,
                        color: '#fc4e2a',
                        dashArray: '',
                        fillOpacity: 0.7
                    });

                    layer.bringToFront();
                    info.update(layer.feature.properties);
                }

                function resetHighlight(e) {
                    geojsonLayer.resetStyle(e.target);
                    info.update();
                }

                function onEachFeature(feature, layer) {
                    layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight
                    });
                }
            })
            .catch(error => console.error('Error loading polygon GeoJSON file:', error));
    })
    .catch(error => console.error('Error loading point GeoJSON file:', error));
