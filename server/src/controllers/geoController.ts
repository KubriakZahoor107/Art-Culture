// server/src/controllers/geoController.ts
import { Request, Response, NextFunction } from "express"
import axios from "axios"

interface NominatimAddress {
  road?: string
  house_number?: string
  city?: string
  town?: string
  village?: string
  state?: string
  postcode?: string
  country?: string
}

interface NominatimResult {
  address?: NominatimAddress
  lat: string
  lon: string
}

export const searchAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = String(req.query.q ?? "")
    if (query.length < 3) {
      res.json([])
      return
    }

    const response = await axios.get<NominatimResult[]>(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          format: "jsonv2",
          addressdetails: 1,
          limit: 10,
        },
        headers: {
          "User-Agent": "ArtPlayUkraine/1.0",
        },
      }
    )

    const processedData = response.data.map((item) => {
      const addr = item.address ?? {}
      const road = addr.road ?? ""
      const house_number = addr.house_number ?? ""
      const city = addr.city ?? addr.town ?? addr.village ?? ""
      const state = addr.state ?? ""
      const postcode = addr.postcode ?? ""

      const roadFormatted = road
        ? road.toLowerCase().startsWith("вулиця")
          ? road
          : `вулиця ${road}`
        : ""

      const display_name = [
        roadFormatted,
        house_number.toUpperCase(),
        city,
        state,
        postcode || "Нема індекса",
      ]
        .filter(Boolean)
        .join(", ")

      return {
        display_name,
        lat: item.lat,
        lon: item.lon,
      }
    })

    res.json(processedData)
  } catch (err) {
    console.error("Error fetching address:", err)
    next(err)
  }
}

export const searchMuseumAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = String(req.query.q ?? "")
    if (query.length < 3) {
      res.json([])
      return
    }

    const response = await axios.get<NominatimResult[]>(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          format: "jsonv2",
          addressdetails: 1,
          limit: 10,
        },
        headers: {
          "User-Agent": "ArtPlayUkraine/1.0",
        },
      }
    )

    const processedData = response.data.map((item) => {
      const addr = item.address ?? {}
      const road = addr.road ?? ""
      const house_number = addr.house_number ?? ""
      const city = addr.city ?? addr.town ?? addr.village ?? ""
      const state = addr.state ?? ""
      const postcode = addr.postcode ?? ""
      const country = addr.country ?? ""

      const roadFormatted = road
        ? road.toLowerCase().startsWith("вулиця")
          ? road
          : `вулиця ${road}`
        : ""

      return {
        country,
        state,
        city,
        road: roadFormatted,
        house_number: house_number.toUpperCase(),
        postcode,
        lat: item.lat,
        lon: item.lon,
      }
    })

    res.json(processedData)
  } catch (err) {
    console.error("Error fetching museum address:", err)
    next(err)
  }
}
