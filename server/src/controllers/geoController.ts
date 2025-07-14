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

type AddressResult = {
  displayName: string
  lat: number
  lon: number
}

type MuseumAddressResult = {
  country: string
  state: string
  city: string
  road: string
  houseNumber: string
  postcode: string
  lat: number
  lon: number
}

async function fetchNominatim(q: string): Promise<NominatimResult[]> {
  const { data } = await axios.get<NominatimResult[]>(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q,
        format: "jsonv2",
        addressdetails: 1,
        limit: 10,
      },
      headers: {
        "User-Agent": "ArtPlayUkraine/1.0",
      },
    }
  )
  return data
}

export const searchAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const q = String(req.query.q ?? "").trim()
    if (q.length < 3) {
      res.status(200).json([])
      return
    }

    const results = await fetchNominatim(q)
    const processed: AddressResult[] = results.map((item) => {
      const addr = item.address ?? {}
      const road = addr.road ?? ""
      const houseNumberRaw = addr.house_number ?? ""
      const city = addr.city ?? addr.town ?? addr.village ?? ""
      const state = addr.state ?? ""
      const postcode = addr.postcode ?? ""

      const roadFormatted = road
        ? road.toLowerCase().startsWith("вулиця")
          ? road
          : `вулиця ${road}`
        : ""

      const displayName = [
        roadFormatted,
        houseNumberRaw.toUpperCase(),
        city,
        state,
        postcode || "Нема індекса",
      ]
        .filter(Boolean)
        .join(", ")

      return {
        displayName,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }
    })

    res.status(200).json(processed)
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
    const q = String(req.query.q ?? "").trim()
    if (q.length < 3) {
      res.status(200).json([])
      return
    }

    const results = await fetchNominatim(q)
    const processed: MuseumAddressResult[] = results.map((item) => {
      const addr = item.address ?? {}
      const road = addr.road ?? ""
      const houseNumberRaw = addr.house_number ?? ""
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
        houseNumber: houseNumberRaw.toUpperCase(),
        postcode,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }
    })

    res.status(200).json(processed)
  } catch (err) {
    console.error("Error fetching museum address:", err)
    next(err)
  }
}

