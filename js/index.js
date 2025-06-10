const initMap = (el_id, c, opt) => {
    const map = L.map(el_id).setView([c.lat, c.lng], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', opt).addTo(map);
    return map;
}

const initMarker = (lat, lng, map) => {
    return L.marker([lat, lng], { draggable: true }).addTo(map)
}

const MapRouting = (map, opt) => {
    const routingOptions = {
        ...opt, // Spread existing options
        router: new GoogleDirectionsRouter(), // Use the GoogleDirectionsRouter
        formatter: new L.Routing.Formatter(), // Optional: add a formatter if not already present
        routeLine: function(route, options) { // Optional: ensure routeLine is defined if not already
            return new L.Routing.Line(route, options);
        }
    };
    const control = L.Routing.control(routingOptions).addTo(map); // Store control
    return control; // Return it
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

class GoogleDirectionsRouter {
    constructor() {
        this.directionsService = new google.maps.DirectionsService();
    }

    route(waypoints, callback, context, options) {
        const googleWaypoints = waypoints.map(wp => new google.maps.LatLng(wp.latLng.lat, wp.latLng.lng));
        const request = {
            origin: googleWaypoints[0],
            destination: googleWaypoints[googleWaypoints.length - 1],
            waypoints: googleWaypoints.slice(1, -1).map(wp => ({ location: wp, stopover: true })),
            travelMode: google.maps.TravelMode.DRIVING,
        };

        this.directionsService.route(request, (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                const route = response.routes[0];
                const results = [{
                    name: route.summary || 'Google Route',
                    summary: {
                        totalDistance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
                        totalTime: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
                    },
                    coordinates: route.overview_path.map(p => L.latLng(p.lat(), p.lng())),
                    waypoints: waypoints, // Pass original Leaflet waypoints
                    inputWaypoints: waypoints, // Pass original input waypoints
                    instructions: route.legs.reduce((instr, leg) => {
                        leg.steps.forEach(step => {
                            instr.push({
                                type: this._mapInstructionType(step.maneuver),
                                text: step.instructions, // HTML, needs stripping or careful handling
                                distance: step.distance.value,
                                time: step.duration.value,
                                road: '', // Difficult to get directly
                                index: route.overview_path.findIndex(p => p.lat() === step.start_location.lat() && p.lng() === step.start_location.lng()) // Approximate
                            });
                        });
                        return instr;
                    }, []),
                }];
                callback.call(context, null, results);
            } else {
                callback.call(context, { status: status, message: 'Google Directions API request failed' });
            }
        });
    }

    _mapInstructionType(maneuver) {
        // Basic mapping, can be expanded
        if (!maneuver) return 'Straight';
        if (maneuver.includes('turn-left')) return 'Left';
        if (maneuver.includes('turn-right')) return 'Right';
        if (maneuver.includes('roundabout')) return 'Roundabout';
        if (maneuver.includes('merge')) return 'Merge';
        // ... add more mappings as needed
        return 'Straight'; // Default
    }
}