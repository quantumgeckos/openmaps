const initMap = (el_id, c, opt) => {
    const map = L.map(el_id).setView([c.lat, c.lng], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', opt).addTo(map);
    return map;
}

const initMarker = (lat, lng, map) => {
    return L.marker([lat, lng], { draggable: true }).addTo(map)
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