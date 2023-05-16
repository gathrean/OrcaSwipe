var map = L.map('map');
map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var coordinates;
var targetPin = undefined;

map.on('click', (e) => {
    if (targetPin != undefined) {
        map.removeLayer(targetPin)
    }
    coordinates = e.latlng;
    targetPin = L.marker(coordinates).addTo(map);
    targetPin.bindPopup("<b>Your pod is here?</b>").openPopup();
})