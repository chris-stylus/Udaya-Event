import React, { useState, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType, Role, User, Stall, MenuItem } from '../types';
import { BarChartIcon, UsersIcon, StoreIcon, XIcon, PrintIcon, TrashIcon, SearchIcon } from '../components/Icons';
import { StudentEntryPass } from '../components/StudentEntryPass';
import { StallEntryPass } from '../components/StallEntryPass';

const StatCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
  <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 ${color}`}>
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const TransactionRow = ({ tx }: { tx: Transaction }) => (
    <tr className="border-b border-gray-200 dark:border-gray-700">
        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-300">{new Date(tx.timestamp).toLocaleString()}</td>
        <td className="py-3 px-4 text-sm">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === TransactionType.Recharge ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                {tx.type}
            </span>
        </td>
        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-300 font-mono text-right">₹{tx.amount.toFixed(2)}</td>
        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{tx.studentName}</td>
        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{tx.stallName || 'N/A'}</td>
    </tr>
);

const AdminDashboard = () => {
    const { users, stalls, transactions, rechargeStudent, addStudent, addStall, updateStallMenu, deleteStudent, deleteStall } = useApp();
    const [activeTab, setActiveTab] = useState('reporting');
    const [selectedUserForRecharge, setSelectedUserForRecharge] = useState<User | null>(null);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [showQR, setShowQR] = useState<{ type: Role, data: User | Stall } | null>(null);

    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentClass, setNewStudentClass] = useState('');
    const [newStallName, setNewStallName] = useState('');
    
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [stallSearchTerm, setStallSearchTerm] = useState('');
    
    const [editingStall, setEditingStall] = useState<Stall | null>(null);
    const [stallMenu, setStallMenu] = useState<MenuItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');


    const stats = useMemo(() => {
        const totalRecharged = transactions
            .filter(tx => tx.type === TransactionType.Recharge)
            .reduce((sum, tx) => sum + tx.amount, 0);
        const totalSales = transactions
            .filter(tx => tx.type === TransactionType.Purchase)
            .reduce((sum, tx) => sum + tx.amount, 0);
        const salesByStall = stalls.map(stall => ({
            ...stall,
            totalSales: transactions
                .filter(tx => tx.type === TransactionType.Purchase && tx.stallId === stall.id)
                .reduce((sum, tx) => sum + tx.amount, 0),
        }));
        return { totalRecharged, totalSales, salesByStall };
    }, [transactions, stalls]);
    
    const filteredUsers = useMemo(() => 
        users.filter(user => 
            user.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || 
            user.class.toLowerCase().includes(studentSearchTerm.toLowerCase())
        ), [users, studentSearchTerm]);

    const filteredStalls = useMemo(() =>
        stalls.filter(stall => 
            stall.name.toLowerCase().includes(stallSearchTerm.toLowerCase())
        ), [stalls, stallSearchTerm]);

    const handleRecharge = async () => {
        if (!selectedUserForRecharge || !rechargeAmount) return;
        const amount = parseFloat(rechargeAmount);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid positive amount.");
            return;
        }
        const { success, message } = await rechargeStudent(selectedUserForRecharge.id, amount);
        alert(message);
        if (success) {
            setSelectedUserForRecharge(null);
            setRechargeAmount('');
        }
    };
    
    const handleAddStudent = () => {
        if (!newStudentName || !newStudentClass) return;
        const newUser = addStudent(newStudentName, newStudentClass);
        setShowQR({ type: Role.Student, data: newUser });
        setNewStudentName('');
        setNewStudentClass('');
    };
    
    const handleDeleteStudent = (studentId: string, studentName: string) => {
        if (window.confirm(`Are you sure you want to delete ${studentName}? All associated transaction data will be lost forever. This action cannot be undone.`)) {
            deleteStudent(studentId);
        }
    }

    const handleAddStall = () => {
        if (!newStallName) return;
        const newStall = addStall(newStallName);
        setShowQR({ type: Role.Stall, data: newStall });
        setNewStallName('');
    };
    
    const handleDeleteStall = (stallId: string, stallName: string) => {
        if (window.confirm(`Are you sure you want to delete the stall "${stallName}"? All its sales data will be lost forever. This action cannot be undone.`)) {
            deleteStall(stallId);
        }
    };
    
    const handleEditMenu = (stall: Stall) => {
        setEditingStall(stall);
        setStallMenu([...stall.menu]);
    };

    const handleSaveMenu = () => {
        if (!editingStall) return;
        updateStallMenu(editingStall.id, stallMenu);
        setEditingStall(null);
    };

    const addMenuItem = () => {
        if (!newItemName || !newItemPrice) return;
        const price = parseFloat(newItemPrice);
        if (isNaN(price) || price <= 0) {
            alert("Invalid price");
            return;
        }
        setStallMenu([...stallMenu, { id: `item-${Date.now()}`, name: newItemName, price }]);
        setNewItemName('');
        setNewItemPrice('');
    };

    const removeMenuItem = (itemId: string) => {
        setStallMenu(stallMenu.filter(item => item.id !== itemId));
    };
    
    const handlePrint = () => {
        window.print();
    };


    const renderReporting = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Total Recharged" value={`₹${stats.totalRecharged.toFixed(2)}`} color="border-green-500" />
                <StatCard title="Total Sales" value={`₹${stats.totalSales.toFixed(2)}`} color="border-blue-500" />
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Sales by Stall</h3>
                <div className="space-y-4">
                    {stats.salesByStall.map(stall => (
                        <div key={stall.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="font-medium text-gray-700 dark:text-gray-200">{stall.name}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">₹{stall.totalSales.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Transaction Log</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-sm">Time</th>
                                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-sm">Type</th>
                                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-sm text-right">Amount</th>
                                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-sm">Student</th>
                                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-sm">Stall</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
    
    const renderManageStudents = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add New Student</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Student Name" className="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                    <input type="text" value={newStudentClass} onChange={e => setNewStudentClass(e.target.value)} placeholder="Class (e.g., 9A)" className="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                    <button onClick={handleAddStudent} className="bg-primary text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-primary-700 transition">Add Student &amp; Get Pass</button>
                </div>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Student List</h3>
                    <div className="relative mt-2 sm:mt-0">
                         <input type="text" value={studentSearchTerm} onChange={e => setStudentSearchTerm(e.target.value)} placeholder="Search by name or class..." className="w-full sm:w-64 p-2 pl-10 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                         <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute top-1/2 left-3 -translate-y-1/2"/>
                    </div>
                </div>
                <div className="space-y-3">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="flex flex-wrap justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{user.class}</p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                                <p className="font-mono text-lg font-semibold text-gray-800 dark:text-gray-200">₹{user.balance.toFixed(2)}</p>
                                <button onClick={() => setShowQR({ type: Role.Student, data: user })} className="text-primary hover:text-primary-700 font-semibold text-sm sm:text-base">View Pass</button>
                                <button onClick={() => setSelectedUserForRecharge(user)} className="bg-green-500 text-white font-semibold py-2 px-3 sm:px-4 rounded-md shadow hover:bg-green-600 transition text-sm sm:text-base">Recharge</button>
                                <button onClick={() => handleDeleteStudent(user.id, user.name)} className="bg-red-600 text-white p-2 rounded-md shadow hover:bg-red-700 transition">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderManageStalls = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add New Stall</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input type="text" value={newStallName} onChange={e => setNewStallName(e.target.value)} placeholder="Stall Name" className="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                    <button onClick={handleAddStall} className="bg-primary text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-primary-700 transition">Add Stall &amp; Get Pass</button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Stall List</h3>
                    <div className="relative mt-2 sm:mt-0">
                        <input type="text" value={stallSearchTerm} onChange={e => setStallSearchTerm(e.target.value)} placeholder="Search by name..." className="w-full sm:w-64 p-2 pl-10 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                        <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute top-1/2 left-3 -translate-y-1/2"/>
                    </div>
                </div>
                <div className="space-y-3">
                    {filteredStalls.map(stall => (
                        <div key={stall.id} className="flex flex-wrap justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="font-semibold text-gray-900 dark:text-white">{stall.name}</p>
                            <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                                <button onClick={() => setShowQR({ type: Role.Stall, data: stall })} className="text-primary hover:text-primary-700 font-semibold">View Pass</button>
                                <button onClick={() => handleEditMenu(stall)} className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-yellow-600 transition">Manage Menu</button>
                                <button onClick={() => handleDeleteStall(stall.id, stall.name)} className="bg-red-600 text-white p-2 rounded-md shadow hover:bg-red-700 transition">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'reporting', label: 'Reporting', icon: <BarChartIcon className="w-5 h-5 mr-2" /> },
        { id: 'students', label: 'Manage Students', icon: <UsersIcon className="w-5 h-5 mr-2" /> },
        { id: 'stalls', label: 'Manage Stalls', icon: <StoreIcon className="w-5 h-5 mr-2" /> },
    ];

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8 px-4 sm:px-6" aria-label="Tabs">
                        {tabs.map(tab => (
                             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {activeTab === 'reporting' && renderReporting()}
            {activeTab === 'students' && renderManageStudents()}
            {activeTab === 'stalls' && renderManageStalls()}

            {/* Recharge Modal */}
            {selectedUserForRecharge && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Recharge Wallet</h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">For: <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedUserForRecharge.name}</span></p>
                        <input type="number" value={rechargeAmount} onChange={e => setRechargeAmount(e.target.value)} placeholder="Amount in ₹" className="w-full p-2 border rounded-md mb-4 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" autoFocus />
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setSelectedUserForRecharge(null)} className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                            <button onClick={handleRecharge} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600">Confirm Recharge</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Entry Pass Modal */}
            {showQR && (
                <div 
                    id="pass-modal-container"
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20 p-4"
                    onClick={() => setShowQR(null)}
                >
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        {showQR.type === Role.Student ? 
                            <StudentEntryPass student={showQR.data as User} /> : 
                            <StallEntryPass stall={showQR.data as Stall} />}
                        
                        <div className="mt-4 flex justify-center gap-4 print:hidden">
                            <button onClick={() => setShowQR(null)} className="bg-gray-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-gray-600 flex items-center gap-2">
                                <XIcon className="w-5 h-5"/> Close
                            </button>
                            <button onClick={handlePrint} className="bg-green-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-green-600 flex items-center gap-2">
                                <PrintIcon className="w-5 h-5"/> Print / Download
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Menu Modal */}
            {editingStall && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Manage Menu for {editingStall.name}</h3>
                        <div className="mb-4 space-y-2 max-h-64 overflow-y-auto">
                            {stallMenu.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                    <span className="text-gray-800 dark:text-gray-200">{item.name} - ₹{item.price}</span>
                                    <button onClick={() => removeMenuItem(item.id)} className="text-red-500 hover:text-red-700"><XIcon className="w-5 h-5" /></button>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-4">
                             <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Item Name" className="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                             <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="Price" className="w-24 p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                             <button onClick={addMenuItem} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600">Add</button>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setEditingStall(null)} className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                            <button onClick={handleSaveMenu} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600">Save Menu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;