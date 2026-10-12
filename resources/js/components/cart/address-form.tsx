import L from 'leaflet';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { MapPin, Satellite } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Leaflet's default marker paths break after Vite production builds.
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: shadow,
});

type AddressFormValues = {
    full_name: string;
    phone: string;
    alternate_phone: string;
    date_of_birth: string;
    address_line_1: string;
    address_line_2: string;
    landmark: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude: string;
    longitude: string;
    is_default: boolean;
};

const emptyForm = (): AddressFormValues => ({
    full_name: '',
    phone: '',
    alternate_phone: '',
    date_of_birth: '',
    address_line_1: '',
    address_line_2: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    latitude: '',
    longitude: '',
    is_default: true,
});

type ReverseGeocodeResult = {
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    pincode_approximate?: boolean;
    display_name?: string;
    detected_area?: string;
};

type PincodeLookupResult = {
    city: string;
    state: string;
    country: string;
    area: string;
    latitude?: number | null;
    longitude?: number | null;
    map_label?: string;
    verified?: boolean;
};

type MapCenterTarget = {
    lat: number;
    lng: number;
    zoom?: number;
    label?: string;
    key: number;
};

async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
    });

    const response = await fetch(`/geocode/reverse?${params.toString()}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
    });

    if (!response.ok) {
        return {};
    }

    return (await response.json()) as ReverseGeocodeResult;
}

async function lookupPincode(pincode: string): Promise<PincodeLookupResult | null> {
    if (!/^\d{6}$/.test(pincode)) {
        return null;
    }

    const response = await fetch(`/geocode/pincode/${pincode}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
    });

    if (!response.ok) {
        return null;
    }

    return (await response.json()) as PincodeLookupResult;
}

type AddressMapPickerProps = {
    latitude?: number | null;
    longitude?: number | null;
    centerTarget?: MapCenterTarget | null;
    detectedArea?: string | null;
    onLocationChange: (payload: ReverseGeocodeResult & { latitude: number; longitude: number }) => void;
};

export function AddressMapPicker({ latitude, longitude, centerTarget, detectedArea, onLocationChange }: AddressMapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const streetLayerRef = useRef<L.TileLayer | null>(null);
    const satelliteLayerRef = useRef<L.TileLayer | null>(null);
    const onLocationChangeRef = useRef(onLocationChange);
    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
    const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number } | null>(
        latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null,
    );

    useEffect(() => {
        onLocationChangeRef.current = onLocationChange;
    }, [onLocationChange]);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) {
            return;
        }

        const initialLat = latitude ?? 20.5937;
        const initialLng = longitude ?? 78.9629;

        mapInstance.current = L.map(mapRef.current).setView([initialLat, initialLng], latitude ? 16 : 5);

        streetLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        });

        satelliteLayerRef.current = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
                attribution: '&copy; Esri',
            },
        );

        streetLayerRef.current.addTo(mapInstance.current);

        markerRef.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(mapInstance.current);

        const updateFromCoords = async (lat: number, lng: number) => {
            setActiveCoords({ lat, lng });
            const result = await reverseGeocode(lat, lng);
            onLocationChangeRef.current({ ...result, latitude: lat, longitude: lng });
        };

        markerRef.current.on('dragend', () => {
            const position = markerRef.current?.getLatLng();

            if (position) {
                void updateFromCoords(position.lat, position.lng);
            }
        });

        mapInstance.current.on('click', (event) => {
            markerRef.current?.setLatLng(event.latlng);
            void updateFromCoords(event.latlng.lat, event.latlng.lng);
        });

        if (latitude != null && longitude != null) {
            void updateFromCoords(latitude, longitude);
        }

        return () => {
            mapInstance.current?.remove();
            mapInstance.current = null;
            markerRef.current = null;
            streetLayerRef.current = null;
            satelliteLayerRef.current = null;
        };
    }, [latitude, longitude]);

    useEffect(() => {
        if (!centerTarget || !mapInstance.current || !markerRef.current) {
            return;
        }

        const { lat, lng, zoom = 15 } = centerTarget;
        mapInstance.current.flyTo([lat, lng], zoom, { duration: 0.8 });
        markerRef.current.setLatLng([lat, lng]);
        setActiveCoords({ lat, lng });
        void reverseGeocode(lat, lng).then((result) => {
            onLocationChangeRef.current({ ...result, latitude: lat, longitude: lng });
        });
    }, [centerTarget]);

    useEffect(() => {
        if (!mapInstance.current || !streetLayerRef.current || !satelliteLayerRef.current) {
            return;
        }

        if (mapStyle === 'satellite') {
            mapInstance.current.removeLayer(streetLayerRef.current);
            satelliteLayerRef.current.addTo(mapInstance.current);
            return;
        }

        mapInstance.current.removeLayer(satelliteLayerRef.current);
        streetLayerRef.current.addTo(mapInstance.current);
    }, [mapStyle]);

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Location is not supported on this device.');
            return;
        }

        setLocating(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng, accuracy } = position.coords;
                mapInstance.current?.setView([lat, lng], 17);
                markerRef.current?.setLatLng([lat, lng]);
                setActiveCoords({ lat, lng });
                const result = await reverseGeocode(lat, lng);
                onLocationChangeRef.current({ ...result, latitude: lat, longitude: lng });

                if (accuracy > 500) {
                    setLocationError(
                        'GPS accuracy is low. Switch to Satellite view, drag the pin to your rooftop, and confirm your pincode manually.',
                    );
                } else {
                    setLocationError(
                        'Street names may not appear on the map in some areas. Use Satellite view and drag the pin to your exact building.',
                    );
                }

                setLocating(false);
            },
            (error) => {
                setLocating(false);
                setLocationError(
                    error.code === error.PERMISSION_DENIED
                        ? 'Location permission denied. Enter pincode first, then drag the pin on the map.'
                        : 'Unable to detect current location. Enter pincode first, then drag the pin on the map.',
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            },
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Label>Fine-tune location on map</Label>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMapStyle((current) => (current === 'street' ? 'satellite' : 'street'))}
                    >
                        <Satellite className="size-3.5" />
                        {mapStyle === 'street' ? 'Satellite' : 'Street'} View
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={useCurrentLocation} disabled={locating}>
                        <MapPin className="size-3.5" />
                        {locating ? 'Detecting...' : 'Use GPS'}
                    </Button>
                </div>
            </div>
            <p className="text-xs text-slate-500">
                Step 1: Enter your 6-digit pincode above. Step 2: Drag the pin to your home. Satellite view helps when
                street names are missing.
            </p>
            {locationError && <p className="text-xs text-amber-700">{locationError}</p>}
            <div ref={mapRef} className="h-64 w-full overflow-hidden rounded-lg border border-slate-200" />
            {(detectedArea || activeCoords) && (
                <div className="rounded-lg border border-[#313C8D]/15 bg-[#F5F7FC] p-3 text-sm">
                    <p className="font-semibold text-[#313C8D]">Detected near</p>
                    <p className="mt-1 text-slate-700">{detectedArea || 'Move the pin to detect this area.'}</p>
                    {activeCoords && (
                        <p className="mt-2 text-xs text-slate-500">
                            Pin: {activeCoords.lat.toFixed(5)}, {activeCoords.lng.toFixed(5)} — drag if this is not your
                            home
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

type AddressFormProps = {
    initialValues?: Partial<AddressFormValues>;
    submitLabel?: string;
    onSubmit: (values: AddressFormValues) => void;
    processing?: boolean;
};

export function AddressForm({
    initialValues,
    submitLabel = 'Save Address',
    onSubmit,
    processing = false,
}: AddressFormProps) {
    const [form, setForm] = useState<AddressFormValues>({
        ...emptyForm(),
        ...initialValues,
    });
    const [pincodeEdited, setPincodeEdited] = useState(Boolean(initialValues?.pincode));
    const [pincodeHint, setPincodeHint] = useState<string | null>(null);
    const [pincodeLookupError, setPincodeLookupError] = useState<string | null>(null);
    const [detectedArea, setDetectedArea] = useState<string | null>(null);
    const [mapCenterTarget, setMapCenterTarget] = useState<MapCenterTarget | null>(null);
    const mapCenterKey = useRef(0);

    const updateField = (field: keyof AddressFormValues, value: string | boolean) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const applyPincodeLookup = useCallback(async (pincode: string) => {
        if (!/^\d{6}$/.test(pincode)) {
            setPincodeHint(null);
            setPincodeLookupError(null);
            return;
        }

        const result = await lookupPincode(pincode);

        if (!result) {
            setPincodeLookupError(null);
            setPincodeHint('Pincode format looks valid. Confirm city/state manually if needed.');
            return;
        }

        if (result.verified === false) {
            setPincodeLookupError(null);
            setPincodeHint('Online pincode lookup is temporarily unavailable. You can still save if your pincode is correct.');
        } else {
            setPincodeLookupError(null);
            setPincodeHint(
                result.area
                    ? `Verified: ${result.area}, ${result.city}, ${result.state}`
                    : `Verified: ${result.city}, ${result.state}`,
            );
        }

        if (result.map_label) {
            setDetectedArea(result.map_label);
        }

        setForm((current) => ({
            ...current,
            city: result.city || current.city,
            state: result.state || current.state,
            country: result.country || current.country,
        }));

        if (result.latitude != null && result.longitude != null) {
            mapCenterKey.current += 1;
            setMapCenterTarget({
                lat: result.latitude,
                lng: result.longitude,
                zoom: 14,
                label: result.map_label,
                key: mapCenterKey.current,
            });
        }
    }, []);

    const handleLocationChange = useCallback(
        (payload: ReverseGeocodeResult & { latitude: number; longitude: number }) => {
            const areaLabel = payload.detected_area || payload.display_name || null;
            if (areaLabel) {
                setDetectedArea(areaLabel);
            }

            setForm((current) => ({
                ...current,
                latitude: String(payload.latitude),
                longitude: String(payload.longitude),
                address_line_1: payload.address_line_1 || current.address_line_1,
                address_line_2: payload.address_line_2 || current.address_line_2,
                city: payload.city || current.city,
                state: payload.state || current.state,
                country: payload.country || current.country,
                pincode: pincodeEdited ? current.pincode : payload.pincode || current.pincode,
            }));

            if (!pincodeEdited && payload.pincode) {
                setPincodeHint('Detected from map — please verify your pincode.');
            }
        },
        [pincodeEdited],
    );

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit(form);
            }}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" value={form.full_name} onChange={(e) => updateField('full_name', e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="alternate_phone">Alternate Number</Label>
                    <Input id="alternate_phone" value={form.alternate_phone} onChange={(e) => updateField('alternate_phone', e.target.value)} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="date_of_birth">Date of Birth (optional)</Label>
                    <Input
                        id="date_of_birth"
                        type="date"
                        value={form.date_of_birth}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => updateField('date_of_birth', e.target.value)}
                    />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="address_line_1">House / Flat No</Label>
                    <Input id="address_line_1" value={form.address_line_1} onChange={(e) => updateField('address_line_1', e.target.value)} required />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="address_line_2">Area / Street</Label>
                    <Input id="address_line_2" value={form.address_line_2} onChange={(e) => updateField('address_line_2', e.target.value)} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input id="landmark" value={form.landmark} onChange={(e) => updateField('landmark', e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                        id="pincode"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setPincodeEdited(true);
                            setPincodeHint(null);
                            setPincodeLookupError(null);
                            updateField('pincode', value);
                        }}
                        onBlur={() => {
                            void applyPincodeLookup(form.pincode);
                        }}
                        required
                    />
                    {pincodeHint && <p className="text-xs text-emerald-700">{pincodeHint}</p>}
                    {pincodeLookupError && <p className="text-xs text-red-600">{pincodeLookupError}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="city">City / District</Label>
                    <Input id="city" value={form.city} onChange={(e) => updateField('city', e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={form.state} onChange={(e) => updateField('state', e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={form.country} onChange={(e) => updateField('country', e.target.value)} required />
                </div>
            </div>

            <AddressMapPicker
                latitude={form.latitude ? Number(form.latitude) : null}
                longitude={form.longitude ? Number(form.longitude) : null}
                centerTarget={mapCenterTarget}
                detectedArea={detectedArea}
                onLocationChange={handleLocationChange}
            />

            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(event) => updateField('is_default', event.target.checked)}
                />
                Set as default address
            </label>

            <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                {submitLabel}
            </Button>
        </form>
    );
}

export type { AddressFormValues };
