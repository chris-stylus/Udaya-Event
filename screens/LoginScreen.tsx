import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { QrCodeIcon, CameraIcon, XIcon } from '../components/Icons';
import { QrScanner } from '../components/QrScanner';

export const LoginScreen = () => {
  const { admin, login, loginWithQRData } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(Role.Admin, admin.id, password);
    if (!result.success) {
      setError(result.message || 'Login failed');
    } else {
      setError('');
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    setShowScanner(false);
    const result = loginWithQRData(decodedText);
    if (!result.success) {
      setError(result.message || 'Login failed from QR scan');
    } else {
      setError('');
    }
  };

  const handleScanError = (errorMessage: string) => {
    console.error(errorMessage);
    setShowScanner(false);
    setError(errorMessage || 'Failed to scan QR code. Please try again.');
  };
  
  const renderAdminLogin = () => (
      <form onSubmit={handleAdminLogin} className="space-y-4">
        <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-200">Admin Login</h3>
        <input 
            type="password" 
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Enter password"
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
            autoFocus
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" className="w-full p-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition">
            Login as Admin
        </button>
        <button type="button" onClick={() => { setShowAdminLogin(false); setError(''); }} className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:underline">
            Back to QR Scan
        </button>
    </form>
  );

  const renderQrScanLogin = () => (
    <div className="space-y-6">
        <div className="text-center">
            <QrCodeIcon className="mx-auto h-16 w-16 text-primary" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Scan Your Pass
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                To log in, scan the QR code on your official pass.
            </p>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center -mt-2">{error}</p>}
        
        <button 
          type="button" 
          onClick={() => { setShowScanner(true); setError(''); }}
          className="w-full flex justify-center items-center gap-3 p-4 bg-primary text-white font-bold text-lg rounded-lg shadow-md hover:bg-primary-700 transition"
        >
            <CameraIcon className="w-7 h-7" />
            Scan to Login
        </button>

        <div className="text-center">
            <button type="button" onClick={() => { setShowAdminLogin(true); setError(''); }} className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                Are you an Admin?
            </button>
        </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          {showAdminLogin ? renderAdminLogin() : renderQrScanLogin()}
        </div>
      </div>
      
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl w-full max-w-md relative">
            <button onClick={() => setShowScanner(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-200 z-10 p-1 bg-white/50 dark:bg-black/50 rounded-full">
                <XIcon className="w-6 h-6"/>
            </button>
            <h3 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">Scan QR Code</h3>
            <div className="overflow-hidden rounded-lg border dark:border-gray-600">
                <QrScanner
                    readerId="login-qr-scanner"
                    onScanSuccess={handleScanSuccess}
                    onScanFailure={handleScanError}
                />
            </div>
          </div>
        </div>
      )}
    </>
  );
};