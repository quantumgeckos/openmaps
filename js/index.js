const initMap = (el_id, c, opt) => {
    const map = L.map(el_id).setView([c.lat, c.lng], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', opt).addTo(map);
    return map;
}

const initMarker = (loc, map) => {
    return L.marker([loc.lat, loc.lng], { draggable: true }).addTo(map)
}

const ReverseGeocode = async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'FATools/1.0 (galang.izqd@gmail.com)'
        }
    });
    const data = await response.json();
    return data;
}

function initRouting(map) {
  return L.Routing.control({
    router: L.Routing.mapbox('pk.eyJ1IjoicXVhbnR1bWdlY2tvIiwiYSI6ImNtYnE1MjcwMDAwMzMybW9zMmZkM3JzbTUifQ.G5Ws0tOJ7-aJhyvvKSAucA'),
    waypoints: [],
    routeWhileDragging: true
  }).addTo(map);
}

function setWaypoints(startLatLng, endLatLng) {
  if (routingControl) {  
    routingControl.setWaypoints([
      L.latLng(startLatLng.lat, startLatLng.lng),
      L.latLng(endLatLng.lat, endLatLng.lng)
    ]);
  }
}

function clearWaypoints() {
  if (routingControl) {
    routingControl.setWaypoints([]);
  }
}
