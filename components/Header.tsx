import React from 'react';
import { useApp } from '../context/AppContext';
import { WalletIcon } from './Icons';

export const Header = () => {
  const { loggedInUser, logout } = useApp();

  return (
    <header className="bg-primary-700 dark:bg-gray-800 shadow-md sticky top-0 z-10 border-b border-primary-600 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <WalletIcon className="h-8 w-8 text-white" />
            <h1 className="ml-3 text-2xl font-bold text-white tracking-tight">
              Event Wallet
            </h1>
          </div>
          {loggedInUser && (
            <div className="flex items-center">
              <span className="text-white hidden sm:inline mr-4">
                Welcome, <span className="font-semibold">{loggedInUser.name}</span>
              </span>
              <button
                onClick={logout}
                className="bg-white text-primary hover:bg-primary-100 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 font-semibold py-2 px-4 rounded-md shadow transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};