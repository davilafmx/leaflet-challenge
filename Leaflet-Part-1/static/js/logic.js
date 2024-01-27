//add the link to a variable
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

//request the url
d3.json(url).then(function (data) {
  console.log(data);
    createFeatures(data.features);
  });

  //Create the marker size
  function markerSize(magnitude) {
    return magnitude *2000;
  };

  //Set The colors for the markers
  function choosecolor(depth) {
    switch(true) {
      case depth > 90: return "red";
      case depth > 70: return "orangered";
      case depth > 50: return "orange"; 
      case depth > 30: return "gold"; 
      case depth > 10: return "yellow"; 
      default: return "green";                    
    }
  }

  //Set up the createFeatures function
  function createFeatures(earthquakeData) {

    // Set th epupups that describe the earthquakes
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>Location: ${feature.properties.place}
      </h3><hr><p>Date: ${new Date(feature.properties.time)}
      </p><p>Magnitude: ${feature.properties.mag}
      </p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    // Create a GeoJSON layer that contains the features and run the the onEachFeature function.
    var earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,

  //Use the markets to point the layers
      pointToLayer: function(feature, latlng) {

    //Set the style of the markers
        var markers = {
          radius: markerSize(feature.properties.mag*10),
            fillColor: choosecolor(feature.geometry.coordinates[2]),
            fillOpacity: 0.1,
            color: "black",
            stroke: true,
            weight: .5
        }
        return L.circle(latlng,markers);
      }
    });

    createMap(earthquakes);
  }

  //Set a function that adds the lyers to the map
  function createMap(earthquakes) {

    // Create the basemap layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create an object with the basemaps
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Overlay the maps
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create map and add the layers.
    let myMap = L.map("map", {
      center: [
        37.09, -100.71
      ],
      zoom: 4,
      layers: [street, earthquakes]
    });

//Add Legend the the map
var legend = L.control({position: "bottomright"});

legend.onAdd = function () {
  var div = L.DomUtil.create("div", "info legend"),
  depth = [-10,10,30,50,70,90];

  div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

// Generate labels with colored squares
  for (var i = 0; i < depth.length; i++) {
    div.innerHTML +=
      '<i style="background:' + choosecolor(depth[i] + 1) + ';">&emsp;</i> ' +
      depth[i] + (depth[i + 1] ? '&ndash;' + depth[i +1] + '<br>' : '+');
  }
  return div;
  };
  legend.addTo(myMap);

  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}