import React, { useState } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 180, label }) => {
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(
    value
  )}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 max-w-full">
      {!hasError ? (
        <img
          src={qrUrl}
          alt="Payment QR Code"
          width={size}
          height={size}
          onError={() => setHasError(true)}
          className="rounded-xl object-contain bg-white"
          loading="lazy"
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-4 text-center border border-slate-200 dark:border-slate-700"
        >
          <QrCode className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
            QR unavailable offline
          </p>
        </div>
      )}

      {label && (
        <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200 text-center max-w-[220px]">
          {label}
        </p>
      )}

      <button
        type="button"
        onClick={handleCopy}
        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        <span>{copied ? 'Copied Details!' : 'Copy Payment Data'}</span>
      </button>
    </div>
  );
};
