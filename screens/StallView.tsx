import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Stall, Transaction, TransactionType, User, Role } from '../types';
import { QrCodeIcon, XIcon, CameraIcon } from '../components/Icons';
import { QrScanner } from '../components/QrScanner';

const StallView = () => {
    const { loggedInUser, users, transactions, makePurchase } = useApp();
    const stall = loggedInUser as Stall;

    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [cart, setCart] = useState<Map<string, number>>(new Map());
    const [scanError, setScanError] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    const stallTransactions = useMemo(() => {
        return transactions.filter(tx => tx.type === TransactionType.Purchase && tx.stallId === stall.id);
    }, [transactions, stall.id]);

    const totalSales = useMemo(() => {
        return stallTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    }, [stallTransactions]);
    
    const cartTotal = useMemo(() => {
        let total = 0;
        for(const [itemId, quantity] of cart.entries()) {
            const item = stall.menu.find(i => i.id === itemId);
            if (item) {
                total += item.price * quantity;
            }
        }
        return total;
    }, [cart, stall.menu]);

    const handleOpenPaymentModal = () => {
        setPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setPaymentModalOpen(false);
        setSelectedStudent(null);
        setCart(new Map());
        setScanError('');
        setIsScanning(false);
    };

    const addToCart = (itemId: string) => {
        const newCart = new Map(cart);
        newCart.set(itemId, (newCart.get(itemId) || 0) + 1);
        setCart(newCart);
    };

    const removeFromCart = (itemId: string) => {
        const newCart = new Map(cart);
        const currentQuantity = newCart.get(itemId);
        if (currentQuantity && currentQuantity > 1) {
            newCart.set(itemId, currentQuantity - 1);
        } else {
            newCart.delete(itemId);
        }
        setCart(newCart);
    };
    
    const handlePayment = async () => {
        if (!selectedStudent) return;
        const { success, message } = await makePurchase(selectedStudent.id, stall.id, cart);
        alert(message);
        if (success) {
            handleClosePaymentModal();
        }
    };
    
    const handleStudentScanSuccess = (decodedText: string) => {
        setIsScanning(false);
        setScanError('');
        setSelectedStudent(null);

        try {
            const parsed = JSON.parse(decodedText);
            if (parsed.role !== Role.Student || !parsed.id) {
                throw new Error('Not a valid student QR code.');
            }
            const student = users.find(u => u.id === parsed.id);
            if (student) {
                setSelectedStudent(student);
            } else {
                setScanError('Student not found in the system.');
            }
        } catch (e) {
            setScanError('Invalid QR code format. Please scan a valid student pass.');
        }
    };
    
    const isPaymentDisabled = cartTotal <= 0 || (selectedStudent && cartTotal > selectedStudent.balance);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Total Sales</h2>
                        <p className="text-4xl font-bold text-primary mt-2">₹{totalSales.toFixed(2)}</p>
                    </div>
                    <button onClick={handleOpenPaymentModal} className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-primary-700 transition flex items-center justify-center text-lg">
                        <QrCodeIcon className="w-6 h-6 mr-3" />
                        New Payment
                    </button>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Transaction History</h2>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {stallTransactions.length > 0 ? stallTransactions.map(tx => (
                            <div key={tx.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">Sale to {tx.studentName}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                                </div>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">+₹{tx.amount.toFixed(2)}</p>
                            </div>
                        )) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No sales yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Payment</h2>
                            <button onClick={handleClosePaymentModal} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                                <XIcon className="w-8 h-8"/>
                            </button>
                        </div>
                        
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                            {/* Left Side: Student Selection & Menu */}
                            <div className="p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">1. Scan Student Pass</h3>
                                    
                                    {!isScanning && !selectedStudent && (
                                        <button onClick={() => { setIsScanning(true); setScanError(''); }} className="w-full flex justify-center items-center gap-3 p-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition">
                                            <CameraIcon className="w-6 h-6" />
                                            Scan Student Pass
                                        </button>
                                    )}

                                    {isScanning && (
                                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                            <QrScanner 
                                                readerId="payment-qr-scanner"
                                                onScanSuccess={handleStudentScanSuccess}
                                                onScanFailure={(err) => { setScanError(err); setIsScanning(false); }}
                                            />
                                        </div>
                                    )}
                                    
                                    {scanError && <p className="text-red-500 text-sm mt-2">{scanError}</p>}
                                    
                                    {selectedStudent && (
                                        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-md text-center">
                                            <p className="font-semibold text-green-800 dark:text-green-200">Student Scanned: {selectedStudent.name}</p>
                                            <button onClick={() => { setSelectedStudent(null); setCart(new Map()); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1">Scan another student</button>
                                        </div>
                                    )}
                                </div>
                                
                                {selectedStudent && (
                                    <div className="flex-grow overflow-y-auto pr-2">
                                        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">2. Add items to cart</h3>
                                        <div className="space-y-2">
                                            {stall.menu.map(item => (
                                                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">₹{item.price.toFixed(2)}</p>
                                                    </div>
                                                    <button onClick={() => addToCart(item.id)} className="bg-primary text-white w-8 h-8 rounded-full font-bold text-xl hover:bg-primary-700 transition">+</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Right Side: Cart & Confirmation */}
                            <div className="p-6 bg-gray-50 dark:bg-gray-900 flex flex-col">
                                {selectedStudent ? (
                                    <>
                                        <div className="flex justify-between items-baseline mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cart for {selectedStudent.name}</h3>
                                            <p className="text-md font-semibold text-gray-600 dark:text-gray-400">Balance: <span className="text-blue-600 dark:text-blue-400">₹{selectedStudent.balance.toFixed(2)}</span></p>
                                        </div>
                                        <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                                            {Array.from(cart.entries()).map(([itemId, quantity]) => {
                                                const item = stall.menu.find(i => i.id === itemId);
                                                if (!item) return null;
                                                return (
                                                    <div key={itemId} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">₹{item.price.toFixed(2)} x {quantity}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-lg text-gray-900 dark:text-white">₹{(item.price * quantity).toFixed(2)}</p>
                                                            <button onClick={() => removeFromCart(item.id)} className="bg-red-500 text-white w-7 h-7 rounded-full font-bold text-lg hover:bg-red-600 transition">-</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {cart.size === 0 && <p className="text-center text-gray-500 dark:text-gray-400 mt-10">Cart is empty.</p>}
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                            <div className="flex justify-between text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                                <span>Total</span>
                                                <span>₹{cartTotal.toFixed(2)}</span>
                                            </div>
                                             {selectedStudent && cartTotal > selectedStudent.balance && <p className="text-red-500 dark:text-red-400 font-semibold text-center mb-2">Error: Cart total exceeds student's balance.</p>}
                                            <button onClick={handlePayment} disabled={isPaymentDisabled} className="w-full bg-green-500 text-white font-bold py-4 rounded-lg text-xl disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition">
                                                Confirm Payment
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                                        <QrCodeIcon className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-600"/>
                                        <p>Please scan a student's pass to begin a transaction.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StallView;