///////////////////
// Shared variables
///////////////////
let map; 
let mapstyle = "streets-v11";
const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
let lon = 139.699766625;
let lat = 35.689480375;
let profile = 'walking'; // Default routing profile
let minutes = 10; // Default duration
let marker;
let lngLat;
let pin_color = '#314ccd';
let area_color = '#5a3fc0';
const APIKEY = config.apikey;


/////////////////
// Initialization
/////////////////

// Overall function
InitializeMap();
InitializeIsochrone();

// Add Mapbox token and set map
function InitializeMap(){
    console.log("InitializeMap");
    mapboxgl.accessToken = APIKEY;
    map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: `mapbox://styles/mapbox/${mapstyle}`, // Which map style to use
        center: [lon, lat], // Starting position
        zoom: 11.5, // Starting zoom
    });
    marker = new mapboxgl.Marker({
        color: pin_color
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
                    'fill-color': area_color,
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

// Get Isochrone
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

// Get longitude and latitude
async function getForwardGeocoding(placename){
    console.log("getForwardGeocoding");
    const query = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${placename}.json?access_token=${APIKEY}`,
        { method: 'GET' }
    );
    const data = await query.json();
    console.log(data['features']);

    // Set center position
    result = data['features'][0];
    lon = result['center'][0];
    lat = result['center'][1];
    document.getElementById('place-name').value = result['place_name'];    
    document.getElementById('longitude').value = lon;    
    document.getElementById('latitude').value = lat;    
}

// Get the place name
async function getReverseGeocoding(){
    console.log("getReverseGeocoding");
    const query = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${APIKEY}`,
        { method: 'GET' }
    );
    const data = await query.json();
    console.log(data);

    // Set the place name
    result = data['features'][0];
    document.getElementById('place-name').value = result['place_name']; // the name of the nearest place
}


//////////////////
// Event Listeners
//////////////////

// Target the "params" form in the HTML
const params = document.getElementById('params');

// When a user changes the value of duration, profile, or longitude or latitude change the parameter's value and make the API query again
params.addEventListener("change", (event) => {
    if(event.target.name === 'profile'){
        profile = event.target.value;
    }
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

    // Change the place name
    getReverseGeocoding();
});

// Target the map-style-form form in the HTML
const mapstyleform = document.getElementById('map-style-form');

// When a user changes the style of the map
mapstyleform.addEventListener("change", (event) => {
    mapstyle = event.target.value;

    // Initialize map
    InitializeMap();
    InitializeIsochrone();
});

// Target the center-position-form form in the HTML
const centerposform = document.getElementById('center-position-form');

// When a user changes the center position name
centerposform.addEventListener("change", (event) => {
    //Get longitude and latitude
    placename = event.target.value;
    console.log(placename)
    getForwardGeocoding(placename).then(value => {
        // Call this API call after finishing the ForwardGeocoding API call.
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
});

// Target the color-form form in the HTML
const colorform = document.getElementById('color-form');

// When a user changes the color
colorform.addEventListener("change", (event) => {
    //Get color
    color = event.target.value;
    if(color === 'blue'){
        pin_color = '#314ccd';
        area_color = '#5a3fc0';
    }
    else if(color === 'red'){
        pin_color = '#dc143c';
        area_color = '#db7093';
    }
    else if(color === 'green'){
        pin_color = '#006400';
        area_color = '#66cdaa';
    }

    // Initialize map
    InitializeMap();
    InitializeIsochrone();
});