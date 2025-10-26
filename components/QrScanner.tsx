import React, { useEffect, useRef, useState, useMemo } from 'react';
import { FlashlightOnIcon, FlashlightOffIcon } from './Icons';

declare const Html5Qrcode: any;

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
  readerId: string;
}

const beepSoundBase64 = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVdpS00A";

export const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onScanFailure, readerId }) => {
  const html5QrCodeRef = useRef<any>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  
  const beepSound = useMemo(() => new Audio(beepSoundBase64), []);

  useEffect(() => {
    if (typeof Html5Qrcode === 'undefined') {
      console.error('Html5Qrcode library not found.');
      if (onScanFailure) onScanFailure('QR Scanner library failed to load.');
      return;
    }

    const html5QrCode = new Html5Qrcode(readerId);
    html5QrCodeRef.current = html5QrCode;
    
    const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
      beepSound.play().catch(e => console.error("Error playing sound:", e));
      onScanSuccess(decodedText);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: 'environment' },
      config,
      qrCodeSuccessCallback,
      (errorMessage: string) => {}
    ).then(() => {
        // After camera starts, check for flashlight capability
        const stream = html5QrCodeRef.current?._stream;
        if (stream) {
            const track = stream.getVideoTracks()[0];
            if (track && 'torch' in track.getCapabilities()) {
                 setHasFlash(true);
            }
        }
    }).catch((err: any) => {
      console.error(`Unable to start scanning: ${err}`);
      if (onScanFailure) {
        onScanFailure(`Camera permission denied or camera not found. Please check your browser settings.`);
      }
    });

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        // Turn off flash if it was on
        const track = html5QrCodeRef.current._stream?.getVideoTracks()[0];
        if (track && track.getCapabilities().torch) {
            track.applyConstraints({ advanced: [{ torch: false }] });
        }
        html5QrCodeRef.current.stop().catch((err: any) => {
            console.error('Failed to stop the QR scanner.', err);
        });
      }
    };
  }, [readerId, onScanSuccess, onScanFailure, beepSound]);
  
  const toggleFlash = async () => {
    if (html5QrCodeRef.current && hasFlash) {
        const stream = html5QrCodeRef.current._stream;
        if(stream) {
            const track = stream.getVideoTracks()[0];
            try {
                await track.applyConstraints({ advanced: [{ torch: !isFlashOn }]});
                setIsFlashOn(!isFlashOn);
            } catch(err) {
                console.error('Failed to toggle flash', err);
            }
        }
    }
  };

  return (
    <div className="relative">
      <div id={readerId} style={{ width: '100%' }} />
      {hasFlash && (
        <button 
            onClick={toggleFlash}
            className={`absolute bottom-4 right-4 p-3 rounded-full text-white transition-colors ${isFlashOn ? 'bg-yellow-500' : 'bg-gray-800/70 hover:bg-gray-700'}`}
            aria-label="Toggle Flashlight"
        >
            {isFlashOn ? <FlashlightOnIcon className="w-6 h-6" /> : <FlashlightOffIcon className="w-6 h-6" />}
        </button>
      )}
    </div>
  );
};
