import { User, WasteItem, Transaction, Chat, ChatMessage, Review, EcoImpact } from '@/types';

// Local Storage keys
const STORAGE_KEYS = {
  USERS: 'eco_marketplace_users',
  CURRENT_USER: 'eco_marketplace_current_user',
  WASTE_ITEMS: 'eco_marketplace_waste_items',
  TRANSACTIONS: 'eco_marketplace_transactions',
  CHATS: 'eco_marketplace_chats',
  CHAT_MESSAGES: 'eco_marketplace_chat_messages',
  REVIEWS: 'eco_marketplace_reviews',
  ECO_IMPACT: 'eco_marketplace_eco_impact',
  FAVORITES: 'eco_marketplace_favorites'
};

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return [];
  }
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

// User functions
export const saveUser = (user: User): void => {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  saveToStorage(STORAGE_KEYS.USERS, users);
};

export const getUserById = (id: string): User | null => {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  return users.find(u => u.id === id) || null;
};

export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const authenticateUser = (email: string, password: string): User | null => {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  // Simplified authentication - in real app, password would be hashed
  const user = users.find(u => u.email === email);
  return user || null;
};

// Waste Items functions
export const saveWasteItem = (item: WasteItem): void => {
  const items = getFromStorage<WasteItem>(STORAGE_KEYS.WASTE_ITEMS);
  const existingIndex = items.findIndex(i => i.id === item.id);
  
  if (existingIndex >= 0) {
    items[existingIndex] = item;
  } else {
    items.push(item);
  }
  
  saveToStorage(STORAGE_KEYS.WASTE_ITEMS, items);
};

export const getWasteItems = (): WasteItem[] => {
  return getFromStorage<WasteItem>(STORAGE_KEYS.WASTE_ITEMS);
};

export const getWasteItemById = (id: string): WasteItem | null => {
  const items = getFromStorage<WasteItem>(STORAGE_KEYS.WASTE_ITEMS);
  return items.find(i => i.id === id) || null;
};

export const deleteWasteItem = (id: string): void => {
  const items = getFromStorage<WasteItem>(STORAGE_KEYS.WASTE_ITEMS);
  const filteredItems = items.filter(i => i.id !== id);
  saveToStorage(STORAGE_KEYS.WASTE_ITEMS, filteredItems);
};

// Transaction functions
export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
  const existingIndex = transactions.findIndex(t => t.id === transaction.id);
  
  if (existingIndex >= 0) {
    transactions[existingIndex] = transaction;
  } else {
    transactions.push(transaction);
  }
  
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
};

export const getTransactions = (): Transaction[] => {
  return getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
};

export const getUserTransactions = (userId: string): Transaction[] => {
  const transactions = getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
  return transactions.filter(t => t.buyerId === userId || t.sellerId === userId);
};

// Chat functions
export const saveChat = (chat: Chat): void => {
  const chats = getFromStorage<Chat>(STORAGE_KEYS.CHATS);
  const existingIndex = chats.findIndex(c => c.id === chat.id);
  
  if (existingIndex >= 0) {
    chats[existingIndex] = chat;
  } else {
    chats.push(chat);
  }
  
  saveToStorage(STORAGE_KEYS.CHATS, chats);
};

export const getUserChats = (userId: string): Chat[] => {
  const chats = getFromStorage<Chat>(STORAGE_KEYS.CHATS);
  return chats.filter(c => c.buyerId === userId || c.sellerId === userId);
};

export const saveChatMessage = (message: ChatMessage): void => {
  const messages = getFromStorage<ChatMessage>(STORAGE_KEYS.CHAT_MESSAGES);
  messages.push(message);
  saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, messages);
};

export const getChatMessages = (chatId: string): ChatMessage[] => {
  const messages = getFromStorage<ChatMessage>(STORAGE_KEYS.CHAT_MESSAGES);
  return messages.filter(m => m.chatId === chatId).sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};

// Reviews functions
export const saveReview = (review: Review): void => {
  const reviews = getFromStorage<Review>(STORAGE_KEYS.REVIEWS);
  reviews.push(review);
  saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
};

export const getUserReviews = (userId: string): Review[] => {
  const reviews = getFromStorage<Review>(STORAGE_KEYS.REVIEWS);
  return reviews.filter(r => r.reviewedUserId === userId);
};

// Favorites functions
export const getFavorites = (userId: string): string[] => {
  const favorites = getFromStorage<Record<string, string[]>>(STORAGE_KEYS.FAVORITES);
  const userFavorites = favorites.find(f => Object.keys(f)[0] === userId);
  return userFavorites ? userFavorites[userId] : [];
};

export const toggleFavorite = (userId: string, itemId: string): void => {
  let favorites = getFromStorage<Record<string, string[]>>(STORAGE_KEYS.FAVORITES);
  const userFavorites = getFavorites(userId);
  
  if (userFavorites.includes(itemId)) {
    const updated = userFavorites.filter(id => id !== itemId);
    favorites = favorites.filter(f => Object.keys(f)[0] !== userId);
    favorites.push({ [userId]: updated });
  } else {
    favorites = favorites.filter(f => Object.keys(f)[0] !== userId);
    favorites.push({ [userId]: [...userFavorites, itemId] });
  }
  
  saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
};

// Eco Impact functions
export const getEcoImpact = (): EcoImpact => {
  const impacts = getFromStorage<EcoImpact>(STORAGE_KEYS.ECO_IMPACT);
  return impacts[0] || {
    totalWasteReused: 0,
    co2Saved: 0,
    transactionsCount: 0,
    categoriesImpact: {
      plasticos: 0,
      metais: 0,
      papel: 0,
      madeira: 0,
      tecidos: 0,
      eletronicos: 0,
      organicos: 0,
      outros: 0
    }
  };
};

export const updateEcoImpact = (transaction: Transaction, wasteItem: WasteItem): void => {
  const currentImpact = getEcoImpact();
  const wasteWeight = wasteItem.quantity.value;
  
  // Simplified CO2 calculation - different materials have different impact
  const co2FactorByCategory = {
    plasticos: 2.1, // kg CO2 per kg
    metais: 3.5,
    papel: 1.2,
    madeira: 0.8,
    tecidos: 1.8,
    eletronicos: 4.2,
    organicos: 0.3,
    outros: 1.5
  };
  
  const co2Saved = wasteWeight * co2FactorByCategory[wasteItem.category];
  
  const updatedImpact: EcoImpact = {
    totalWasteReused: currentImpact.totalWasteReused + wasteWeight,
    co2Saved: currentImpact.co2Saved + co2Saved,
    transactionsCount: currentImpact.transactionsCount + 1,
    categoriesImpact: {
      ...currentImpact.categoriesImpact,
      [wasteItem.category]: currentImpact.categoriesImpact[wasteItem.category] + wasteWeight
    }
  };
  
  saveToStorage(STORAGE_KEYS.ECO_IMPACT, [updatedImpact]);
};

// Initialize demo data
export const initializeDemoData = (): void => {
  const existingUsers = getFromStorage<User>(STORAGE_KEYS.USERS);
  if (existingUsers.length === 0) {
    // Create demo users
    const demoUsers: User[] = [
      {
        id: '1',
        name: 'EcoIndústria Ltda',
        email: 'contato@ecoindustria.com',
        phone: '(11) 9999-9999',
        userType: 'pessoa_juridica',
        cnpj: '12.345.678/0001-90',
        address: {
          street: 'Rua das Indústrias, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        rating: 4.8,
        reviewCount: 152,
        createdAt: new Date().toISOString(),
        isVerified: true
      },
      {
        id: '2',
        name: 'Maria Silva',
        email: 'maria@email.com',
        phone: '(11) 8888-8888',
        userType: 'pessoa_fisica',
        cpf: '123.456.789-00',
        address: {
          street: 'Rua dos Artesãos, 456',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipCode: '20000-000'
        },
        rating: 4.9,
        reviewCount: 89,
        createdAt: new Date().toISOString(),
        isVerified: true
      }
    ];
    
    demoUsers.forEach(saveUser);
    
    // Create demo waste items
    const demoItems: WasteItem[] = [
      {
        id: '1',
        sellerId: '1',
        title: 'Sobras de Plástico PET',
        description: 'Sobras limpas de produção de embalagens PET. Material de alta qualidade, ideal para reciclagem.',
        category: 'plasticos',
        subcategory: 'PET',
        quantity: { value: 500, unit: 'kg' },
        condition: 'sobras_limpas',
        price: 2.50,
        images: [],
        location: {
          city: 'São Paulo',
          state: 'SP'
        },
        technicalDetails: {
          plasticType: 'PET',
          purity: '98%',
          composition: 'Politereftalato de etileno'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 234,
        favorites: 12
      },
      {
        id: '2',
        sellerId: '2',
        title: 'Madeira de Demolição',
        description: 'Madeira de qualidade proveniente de demolição controlada. Perfeita para móveis rústicos.',
        category: 'madeira',
        subcategory: 'Madeira de lei',
        quantity: { value: 2, unit: 'm3' },
        condition: 'usado',
        price: 150.00,
        images: [],
        location: {
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 87,
        favorites: 5
      }
    ];
    
    demoItems.forEach(saveWasteItem);
  }
};