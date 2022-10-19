///////////////////
// Shared variables
///////////////////
let map; 
const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
let lon = 139.692;
let lat = 35.689;
let profile = 'walking'; // Default routing profile
let minutes = 10; // Default duration
let marker;
let lngLat;
let apikey = "APIKEY";


/////////////////
// Initialization
/////////////////

// Overall function
InitializeMap();
InitializeIsochrone();

// Add Mapbox token and set map
function InitializeMap(){
    console.log("InitializeMap");
    mapboxgl.accessToken = apikey;
    map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Which map style to use
        center: [139.692, 35.689], // Starting position
        zoom: 11.5, // Starting zoom
    });
    marker = new mapboxgl.Marker({
        color: '#314ccd'
    });
    lngLat = {
        lon: lon,
        lat: lat
    };
    marker.setLngLat(lngLat).addTo(map);
};

// Initialize isochrone
function InitializeIsochrone(){
    console.log("InitializeIsochrone");
    map.on("load", function(){
        // Add the source and layer
        map.addSource('iso', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });
        map.addLayer(
            {
                id: 'isoLayer',
                type: 'fill',
                // Use "iso" as the data source for this layer
                source: 'iso',
                layout: {},
                paint: {
                    // The fill color for the layer is set to a light purple
                    'fill-color': '#5a3fc0',
                    'fill-opacity': 0.3
                }
            },
            'poi-label'
        );
        // Make the first API call
        getIso();
    });
}

///////////////
// Call a query
///////////////

// Call a query
async function getIso(){
    console.log("getIso");
    const query = await fetch(
        `${urlBase}${profile}/${lon},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
    );
    const data = await query.json();
    // Set the 'iso' source's data to what's returned by the API query
    map.getSource('iso').setData(data);
}

// Target the "params" form in the HTML
const params = document.getElementById('params');

// When a user changes the value of duration, change the parameter's value and make the API query again
params.addEventListener("change", () => {
    minutes = document.getElementById("duration").value;
    lon = document.getElementById("longitude").value;
    lat = document.getElementById("latitude").value;

    // Change the isochrone 
    getIso();

    // Move the center position
    lngLat = {
        lon: lon,
        lat: lat
    };
    marker.setLngLat(lngLat);

    // Move map
    map.flyTo({
        center: [lon, lat]
    });
});
