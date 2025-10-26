import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Transaction, TransactionType } from '../types';
import { HistoryIcon, StoreIcon, PrintIcon, XIcon } from '../components/Icons';
import { StudentEntryPass } from '../components/StudentEntryPass';

const TransactionRow = ({ tx }: { tx: Transaction }) => (
  <div className={`p-4 rounded-lg flex justify-between items-center ${tx.type === TransactionType.Recharge ? 'bg-green-50 dark:bg-green-900/50' : 'bg-red-50 dark:bg-red-900/50'}`}>
    <div>
      <p className="font-semibold text-gray-800 dark:text-gray-200">
        {tx.type === TransactionType.Purchase ? `Purchase at ${tx.stallName}` : 'Recharge by Admin'}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
    </div>
    <p className={`text-lg font-bold ${tx.type === TransactionType.Recharge ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {tx.type === TransactionType.Recharge ? '+' : '-'}₹{tx.amount.toFixed(2)}
    </p>
  </div>
);

const StudentWallet = () => {
  const { loggedInUser, transactions, stalls } = useApp();
  const student = loggedInUser as User;

  const [showEntryPass, setShowEntryPass] = useState(false);

  const studentTransactions = useMemo(() => {
    return transactions.filter(tx => tx.studentId === student.id);
  }, [transactions, student.id]);
  
  const handlePrint = () => {
    window.print();
  };


  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Balance Card & Entry Pass button */}
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
            <div className="flex-grow bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 rounded-2xl shadow-2xl flex flex-col justify-between">
                <div>
                  <p className="text-lg opacity-80">Current Balance</p>
                  <p className="text-5xl font-bold tracking-tight mt-1">₹{student.balance.toFixed(2)}</p>
                </div>
                <div className="mt-6">
                    <p className="text-sm opacity-80">{student.name}</p>
                    <p className="text-sm opacity-80">{student.class}</p>
                </div>
            </div>
            <div className="flex-shrink-0 md:w-64">
                 <button 
                    onClick={() => setShowEntryPass(true)}
                    className="w-full h-full bg-yellow-400 text-gray-900 font-bold p-6 rounded-2xl shadow-lg hover:bg-yellow-500 transition flex flex-col items-center justify-center text-lg text-center"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    View My <br/> Entry Pass
                 </button>
            </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transaction History */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <HistoryIcon className="w-7 h-7 mr-3 text-primary" />
              Transaction History
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {studentTransactions.length > 0 ? (
                studentTransactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No transactions yet.</p>
              )}
            </div>
          </div>

          {/* Available Stalls */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <StoreIcon className="w-7 h-7 mr-3 text-primary" />
              Available Stalls & Menus
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {stalls.map(stall => (
                <div key={stall.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{stall.name}</h3>
                  <ul className="mt-2 space-y-1">
                    {stall.menu.map(item => (
                      <li key={item.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                        <span>{item.name}</span>
                        <span className="font-semibold">₹{item.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Entry Pass Modal */}
      {showEntryPass && (
        <div id="pass-modal-container" className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 print:bg-white print:p-0">
          <div className="relative p-4 bg-gray-700/50 rounded-2xl shadow-lg print:bg-transparent print:p-0 print:shadow-none">
            <StudentEntryPass student={student} />
            <div className="mt-4 flex justify-center gap-4 print:hidden">
              <button onClick={() => setShowEntryPass(false)} className="bg-gray-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-gray-600 flex items-center gap-2">
                <XIcon className="w-5 h-5"/> Close
              </button>
              <button onClick={handlePrint} className="bg-green-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-green-600 flex items-center gap-2">
                <PrintIcon className="w-5 h-5"/> Print / Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentWallet;