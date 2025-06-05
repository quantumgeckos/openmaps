const initMap = (el_id, c, opt) => {
    const map = L.map(el_id).setView([c.lat, c.lng], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', opt).addTo(map);

    return map;
}

const Marker = () => {

}

const MapRouting = (map, opt) => {
    L.Routing.control(opt).addTo(map);
}