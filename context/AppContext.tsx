import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { User, Stall, Admin, Transaction, LoggedInUser, Role, TransactionType, MenuItem } from '../types';

// --- INITIAL MOCK DATA ---
const createInitialData = () => {
  const students: User[] = [
    { id: 'user-1', name: 'Alice', class: 'Class 9A', role: Role.Student, balance: 1000 },
    { id: 'user-2', name: 'Bob', class: 'Class 10B', role: Role.Student, balance: 500 },
    { id: 'user-3', name: 'Charlie', class: 'Class 9A', role: Role.Student, balance: 750 },
  ];

  const stalls: Stall[] = [
    { id: 'stall-1', name: 'Snack Shack', role: Role.Stall, menu: [
      { id: 'item-1-1', name: 'Popcorn', price: 50 },
      { id: 'item-1-2', name: 'Soda', price: 30 },
      { id: 'item-1-3', name: 'Chips', price: 20 },
    ]},
    { id: 'stall-2', name: 'Game Zone', role: Role.Stall, menu: [
      { id: 'item-2-1', name: 'Ring Toss', price: 100 },
      { id: 'item-2-2', name: 'Dart Throw', price: 75 },
    ]},
  ];
  
  const admin: Admin = { id: 'admin-1', name: 'Principal Smith', role: Role.Admin };

  const transactions: Transaction[] = [];

  return { students, stalls, admin, transactions };
};


interface AppContextType {
  loggedInUser: LoggedInUser | null;
  users: User[];
  stalls: Stall[];
  admin: Admin;
  transactions: Transaction[];
  login: (role: Role, id: string, password?: string) => { success: boolean, message?: string };
  loginWithQRData: (qrData: string) => { success: boolean, message?: string };
  logout: () => void;
  rechargeStudent: (studentId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  makePurchase: (studentId: string, stallId: string, cart: Map<string, number>) => Promise<{ success: boolean; message: string }>;
  addStudent: (name: string, className: string) => User;
  addStall: (name: string) => Stall;
  updateStallMenu: (stallId: string, menu: MenuItem[]) => void;
  deleteStudent: (studentId: string) => void;
  deleteStall: (stallId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [initialData] = useState(createInitialData);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [users, setUsers] = useState<User[]>(initialData.students);
  const [stalls, setStalls] = useState<Stall[]>(initialData.stalls);
  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);

  const login = (role: Role, id: string, password?: string): { success: boolean, message?: string } => {
    if (role === Role.Admin) {
        if (id === initialData.admin.id && password === 'admin123') {
            setLoggedInUser(initialData.admin);
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials for admin.' };
    }
    
    if (role === Role.Student) {
        const user = users.find(u => u.id === id);
        if (user) {
            setLoggedInUser(user);
            return { success: true };
        }
    }
    
    if (role === Role.Stall) {
        const stall = stalls.find(s => s.id === id);
        if (stall) {
            setLoggedInUser(stall);
            return { success: true };
        }
    }

    return { success: false, message: 'User or stall not found.' };
  };

  const loginWithQRData = (qrData: string): { success: boolean, message?: string } => {
    try {
        const parsedData = JSON.parse(qrData);
        if (!parsedData.id || !parsedData.role) {
            return { success: false, message: 'Invalid QR code data. Missing id or role.' };
        }

        if (parsedData.role === Role.Student) {
            const user = users.find(u => u.id === parsedData.id);
            if (user) {
                setLoggedInUser(user);
                return { success: true };
            }
        } else if (parsedData.role === Role.Stall) {
            const stall = stalls.find(s => s.id === parsedData.id);
            if (stall) {
                setLoggedInUser(stall);
                return { success: true };
            }
        }
        
        return { success: false, message: 'User or stall for this QR code not found.' };

    } catch (e) {
        return { success: false, message: 'Invalid QR code format. Please scan again.' };
    }
  };

  const logout = () => setLoggedInUser(null);

  const addStudent = (name: string, className: string): User => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        class: className,
        role: Role.Student,
        balance: 0,
      };
      setUsers(prev => [...prev, newUser]);
      return newUser;
  };
  
  const deleteStudent = (studentId: string) => {
      setUsers(prev => prev.filter(user => user.id !== studentId));
      setTransactions(prev => prev.filter(tx => tx.studentId !== studentId));
  };

  const addStall = (name: string): Stall => {
      const newStall: Stall = {
        id: `stall-${Date.now()}`,
        name,
        role: Role.Stall,
        menu: [],
      };
      setStalls(prev => [...prev, newStall]);
      return newStall;
  };
  
  const deleteStall = (stallId: string) => {
    setStalls(prev => prev.filter(stall => stall.id !== stallId));
    // Also remove transactions associated with this stall
    setTransactions(prev => prev.filter(tx => tx.stallId !== stallId));
  };

  const updateStallMenu = (stallId: string, menu: MenuItem[]) => {
      setStalls(prevStalls => prevStalls.map(s => s.id === stallId ? { ...s, menu } : s));
  };

  const rechargeStudent = async (studentId: string, amount: number): Promise<{ success: boolean; message: string }> => {
    // In a real app, this would use Firestore's runTransaction for atomicity.
    return new Promise(resolve => {
      if (loggedInUser?.role !== Role.Admin) {
        return resolve({ success: false, message: 'Only admins can recharge accounts.' });
      }
      if (amount <= 0) {
        return resolve({ success: false, message: 'Recharge amount must be positive.' });
      }

      let studentName = '';
      setUsers(currentUsers => {
        const newUsers = [...currentUsers];
        const studentIndex = newUsers.findIndex(u => u.id === studentId);
        if (studentIndex === -1) {
          resolve({ success: false, message: 'Student not found.' });
          return currentUsers;
        }
        
        const updatedStudent = { ...newUsers[studentIndex] };
        updatedStudent.balance += amount;
        newUsers[studentIndex] = updatedStudent;
        studentName = updatedStudent.name;
        return newUsers;
      });

      if (studentName) {
        const newTransaction: Transaction = {
          id: `trans-${Date.now()}`,
          type: TransactionType.Recharge,
          amount,
          timestamp: new Date(),
          studentId,
          studentName,
          adminId: loggedInUser.id,
        };
        setTransactions(prev => [newTransaction, ...prev]);
        resolve({ success: true, message: 'Recharge successful.' });
      }
    });
  };

  const makePurchase = async (studentId: string, stallId: string, cart: Map<string, number>): Promise<{ success: boolean; message: string }> => {
    // In a real app, this would use Firestore's runTransaction for atomicity.
    return new Promise(resolve => {
      if (loggedInUser?.role !== Role.Stall || loggedInUser.id !== stallId) {
        return resolve({ success: false, message: 'Unauthorized transaction.' });
      }

      const stall = stalls.find(s => s.id === stallId);
      if (!stall) return resolve({ success: false, message: 'Stall not found.' });
      
      const transactionItems: { name: string, price: number, quantity: number }[] = [];
      let total = 0;
      for (const [itemId, quantity] of cart.entries()) {
        const menuItem = stall.menu.find(m => m.id === itemId);
        if (menuItem && quantity > 0) {
          total += menuItem.price * quantity;
          transactionItems.push({ name: menuItem.name, price: menuItem.price, quantity });
        }
      }

      if (total <= 0) return resolve({ success: false, message: 'Cart is empty or total is zero.' });

      let studentName = '';
      setUsers(currentUsers => {
        const newUsers = [...currentUsers];
        const studentIndex = newUsers.findIndex(u => u.id === studentId);
        if (studentIndex === -1) {
          resolve({ success: false, message: 'Student not found.' });
          return currentUsers;
        }
        
        const updatedStudent = { ...newUsers[studentIndex] };
        if (updatedStudent.balance < total) {
          resolve({ success: false, message: 'Insufficient balance.' });
          return currentUsers;
        }
        updatedStudent.balance -= total;
        newUsers[studentIndex] = updatedStudent;
        studentName = updatedStudent.name;
        return newUsers;
      });

      if (studentName) {
        const newTransaction: Transaction = {
          id: `trans-${Date.now()}`,
          type: TransactionType.Purchase,
          amount: total,
          timestamp: new Date(),
          studentId,
          studentName,
          stallId,
          stallName: stall.name,
          items: transactionItems,
        };
        setTransactions(prev => [newTransaction, ...prev]);
        resolve({ success: true, message: 'Purchase successful!' });
      }
    });
  };
  
  const contextValue = useMemo(() => ({
    loggedInUser,
    users,
    stalls,
    admin: initialData.admin,
    transactions,
    login,
    loginWithQRData,
    logout,
    rechargeStudent,
    makePurchase,
    addStudent,
    addStall,
    updateStallMenu,
    deleteStudent,
    deleteStall,
  }), [loggedInUser, users, stalls, initialData.admin, transactions]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};