import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { User, Role } from '../types';

// Function to generate a unique ID string
const generatePassId = (student: User) => {
    const year = 2025;
    const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const classId = student.class.replace(/\s/g, '');
    const shortId = student.id.slice(-4).toUpperCase();
    return `SCHFST-S-${year}-${initials}${classId}-${shortId}`;
};


export const StudentEntryPass = React.forwardRef<HTMLDivElement, { student: User }>(({ student }, ref) => {
    const qrValue = JSON.stringify({ id: student.id, role: Role.Student });
    const passId = generatePassId(student);

    return (
        <div ref={ref} className="w-[450px] h-[280px] bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] rounded-2xl shadow-2xl p-6 text-white font-sans flex flex-col justify-between relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
                <h1 className="text-4xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-300 to-yellow-300 bg-clip-text text-transparent">SCHOOL FEST 2025</h1>
                <h2 className="text-xl font-semibold text-cyan-200 tracking-widest">STUDENT ENTRY PASS</h2>
            </div>

            <div className="flex items-center justify-between relative z-10">
                <div className="text-left">
                    <p className="text-sm text-gray-300">Student Name:</p>
                    <p className="text-xl font-bold">{student.name.toUpperCase()}</p>
                    <p className="text-sm text-gray-300 mt-2">Class:</p>
                    <p className="text-xl font-bold">{student.class}</p>
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
                            src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231E40AF"><path d="M12 2L2 7l10 5 10-5-10-5zm-1.13 10.37L2 12.61v2.76l8.87 4.43c.5.25 1.12.25 1.62 0L22 15.37v-2.76l-8.87-4.43a1.5 1.5 0 00-1.26 0z"/></svg>`,
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
                <p className="font-mono text-sm tracking-widest text-cyan-200">{passId}</p>
                <p className="text-lg font-bold text-yellow-300 mt-1">Tap & Scan to Pay & Play!</p>
            </div>
             <div className="absolute bottom-1 right-2 text-right text-[8px] text-gray-400 z-10">
                <p className="font-bold">Udaya Public School</p>
                <p>Mahadev Jharkhandi, Kunraghat, Gorakhpur</p>
            </div>
        </div>
    );
});