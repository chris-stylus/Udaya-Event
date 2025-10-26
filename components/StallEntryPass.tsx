import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Stall, Role } from '../types';

// Function to generate a unique ID string
const generatePassId = (stall: Stall) => {
    const year = 2025;
    const initials = stall.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const shortId = stall.id.slice(-4).toUpperCase();
    return `SCHFST-T-${year}-${initials}-${shortId}`;
};

export const StallEntryPass = React.forwardRef<HTMLDivElement, { stall: Stall }>(({ stall }, ref) => {
    const qrValue = JSON.stringify({ id: stall.id, role: Role.Stall });
    const passId = generatePassId(stall);

    return (
        <div ref={ref} className="w-[450px] h-[280px] bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#2c3e50] rounded-2xl shadow-2xl p-6 text-white font-sans flex flex-col justify-between relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10"></div>
            <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-amber-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-orange-600/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
                <h1 className="text-4xl font-extrabold tracking-wider bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">SCHOOL FEST 2025</h1>
                <h2 className="text-xl font-semibold text-amber-200 tracking-widest">STALL ACCESS PASS</h2>
            </div>

            <div className="flex items-center justify-between relative z-10">
                <div className="text-left">
                    <p className="text-sm text-gray-300">Stall Name:</p>
                    <p className="text-2xl font-bold tracking-wide">{stall.name.toUpperCase()}</p>
                </div>

                <div className="p-2 bg-white rounded-lg shadow-lg">
                     <QRCodeCanvas 
                        value={qrValue} 
                        size={120}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={false}
                        imageSettings={{
                            src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D97706"><path d="M12 2L2 7l10 5 10-5-10-5zm-1.13 10.37L2 12.61v2.76l8.87 4.43c.5.25 1.12.25 1.62 0L22 15.37v-2.76l-8.87-4.43a1.5 1.5 0 00-1.26 0z"/></svg>`,
                            x: undefined,
                            y: undefined,
                            height: 24,
                            width: 24,
                            excavate: true,
                        }}
                     />
                </div>
            </div>

            <div className="relative z-10 text-center">
                <p className="font-mono text-sm tracking-widest text-amber-200">{passId}</p>
                <p className="text-lg font-bold text-orange-300 mt-1">Scan to Login & Manage Stall</p>
            </div>
             <div className="absolute bottom-1 right-2 text-right text-[8px] text-gray-400 z-10">
                <p className="font-bold">Udaya Public School</p>
                <p>Mahadev Jharkhandi, Kunraghat, Gorakhpur</p>
            </div>
        </div>
    );
});
