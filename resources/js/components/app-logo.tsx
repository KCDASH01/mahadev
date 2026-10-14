import { useState } from 'react';
import { homeBrand } from '@/data/home-brand';

export default function AppLogo() {
    const [hasError, setHasError] = useState(false);

    return (
        <>
            <div className="flex h-8 w-11 items-center justify-center overflow-hidden rounded-md bg-black">
                {!hasError ? (
                    <img
                        src={homeBrand.logoTransparent}
                        alt={homeBrand.name}
                        className="h-full w-full object-contain"
                        onError={() => setHasError(true)}
                    />
                ) : (
                    <span className="text-xs font-bold text-slate-800">
                        {homeBrand.name.slice(0, 2).toUpperCase()}
                    </span>
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Mahadev Admin
                </span>
            </div>
        </>
    );
}
