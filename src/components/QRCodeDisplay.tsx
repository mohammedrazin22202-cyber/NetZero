import React from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 180, label }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(
    value
  )}`;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
      <img
        src={qrUrl}
        alt="Payment QR Code"
        width={size}
        height={size}
        className="rounded-xl object-contain bg-white"
        loading="lazy"
      />
      {label && <p className="mt-2 text-xs font-medium text-slate-700 text-center">{label}</p>}
    </div>
  );
};
