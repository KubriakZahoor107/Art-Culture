import axios from "axios";
async function fetchNominatim(q) {
    const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
            q,
            format: "jsonv2",
            addressdetails: 1,
            limit: 10,
        },
        headers: {
            "User-Agent": "ArtPlayUkraine/1.0",
        },
    });
    return data;
}
export const searchAddress = async (req, res, next) => {
    try {
        const q = String(req.query.q ?? "").trim();
        if (q.length < 3) {
            res.status(200).json([]);
            return;
        }
        const results = await fetchNominatim(q);
        const processed = results.map((item) => {
            const addr = item.address ?? {};
            const road = addr.road ?? "";
            const houseNumberRaw = addr.house_number ?? "";
            const city = addr.city ?? addr.town ?? addr.village ?? "";
            const state = addr.state ?? "";
            const postcode = addr.postcode ?? "";
            const roadFormatted = road
                ? road.toLowerCase().startsWith("вулиця")
                    ? road
                    : `вулиця ${road}`
                : "";
            const displayName = [
                roadFormatted,
                houseNumberRaw.toUpperCase(),
                city,
                state,
                postcode || "Нема індекса",
            ]
                .filter(Boolean)
                .join(", ");
            return {
                displayName,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
            };
        });
        res.status(200).json(processed);
    }
    catch (err) {
        console.error("Error fetching address:", err);
        next(err);
    }
};
export const searchMuseumAddress = async (req, res, next) => {
    try {
        const q = String(req.query.q ?? "").trim();
        if (q.length < 3) {
            res.status(200).json([]);
            return;
        }
        const results = await fetchNominatim(q);
        const processed = results.map((item) => {
            const addr = item.address ?? {};
            const road = addr.road ?? "";
            const houseNumberRaw = addr.house_number ?? "";
            const city = addr.city ?? addr.town ?? addr.village ?? "";
            const state = addr.state ?? "";
            const postcode = addr.postcode ?? "";
            const country = addr.country ?? "";
            const roadFormatted = road
                ? road.toLowerCase().startsWith("вулиця")
                    ? road
                    : `вулиця ${road}`
                : "";
            return {
                country,
                state,
                city,
                road: roadFormatted,
                houseNumber: houseNumberRaw.toUpperCase(),
                postcode,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
            };
        });
        res.status(200).json(processed);
    }
    catch (err) {
        console.error("Error fetching museum address:", err);
        next(err);
    }
};
//# sourceMappingURL=geoController.js.map