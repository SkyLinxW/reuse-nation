import { User, WasteItem, Transaction, Chat, ChatMessage, Review, EcoImpact } from '@/types';

// Cart item interface
export interface CartItem {
  id: string;
  wasteItemId: string;
  quantity: number;
  addedAt: string;
}

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  type: 'purchase' | 'sale' | 'message' | 'favorite' | 'review';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

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
  FAVORITES: 'eco_marketplace_favorites',
  CART: 'eco_marketplace_cart',
  NOTIFICATIONS: 'eco_marketplace_notifications'
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

export const getReviewsByUser = (userId: string): Review[] => {
  return getUserReviews(userId);
};

export const getWasteItemsBySeller = (sellerId: string): WasteItem[] => {
  const items = getFromStorage<WasteItem>(STORAGE_KEYS.WASTE_ITEMS);
  return items.filter(item => item.sellerId === sellerId);
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
      },
      {
        id: '3',
        name: 'GreenTech Soluções',
        email: 'contato@greentech.com',
        phone: '(11) 7777-7777',
        userType: 'pessoa_juridica',
        cnpj: '98.765.432/0001-10',
        address: {
          street: 'Av. Sustentável, 789',
          city: 'Curitiba',
          state: 'PR',
          zipCode: '80000-000'
        },
        rating: 4.7,
        reviewCount: 203,
        createdAt: new Date().toISOString(),
        isVerified: true
      },
      {
        id: '4',
        name: 'João Santos',
        email: 'joao@email.com',
        phone: '(85) 6666-6666',
        userType: 'pessoa_fisica',
        cpf: '987.654.321-00',
        address: {
          street: 'Rua Recicla, 321',
          city: 'Fortaleza',
          state: 'CE',
          zipCode: '60000-000'
        },
        rating: 4.6,
        reviewCount: 67,
        createdAt: new Date().toISOString(),
        isVerified: true
      },
      {
        id: '5',
        name: 'ReciclaMax',
        email: 'vendas@reciclamax.com',
        phone: '(51) 5555-5555',
        userType: 'pessoa_juridica',
        cnpj: '11.222.333/0001-44',
        address: {
          street: 'Rua da Reciclagem, 100',
          city: 'Porto Alegre',
          state: 'RS',
          zipCode: '90000-000'
        },
        rating: 4.9,
        reviewCount: 345,
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
      },
      {
        id: '3',
        sellerId: '3',
        title: 'Papel Offset Branco',
        description: 'Aparas de papel offset branco de alta qualidade. Ideal para produção de papel reciclado.',
        category: 'papel',
        subcategory: 'Papel branco',
        quantity: { value: 300, unit: 'kg' },
        condition: 'sobras_limpas',
        price: 1.80,
        images: [],
        location: {
          city: 'Curitiba',
          state: 'PR'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 156,
        favorites: 8
      },
      {
        id: '4',
        sellerId: '4',
        title: 'Alumínio Recuperado',
        description: 'Latas de alumínio prensadas e limpas. Perfeitas para reciclagem industrial.',
        category: 'metais',
        subcategory: 'Alumínio',
        quantity: { value: 150, unit: 'kg' },
        condition: 'usado',
        price: 4.20,
        images: [],
        location: {
          city: 'Fortaleza',
          state: 'CE'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 298,
        favorites: 18
      },
      {
        id: '5',
        sellerId: '5',
        title: 'Tecido de Algodão',
        description: 'Retalhos de tecido de algodão 100% natural. Cores variadas, ideal para artesanato.',
        category: 'tecidos',
        subcategory: 'Algodão',
        quantity: { value: 50, unit: 'kg' },
        condition: 'novo',
        price: 8.00,
        images: [],
        location: {
          city: 'Porto Alegre',
          state: 'RS'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 72,
        favorites: 15
      },
      {
        id: '6',
        sellerId: '1',
        title: 'Componentes Eletrônicos',
        description: 'Circuitos e componentes eletrônicos para recuperação de metais preciosos.',
        category: 'eletronicos',
        subcategory: 'Circuitos',
        quantity: { value: 25, unit: 'kg' },
        condition: 'usado',
        price: 12.50,
        images: [],
        location: {
          city: 'São Paulo',
          state: 'SP'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 189,
        favorites: 7
      },
      {
        id: '7',
        sellerId: '2',
        title: 'Madeira de Modelismo MDF',
        description: 'Placas de MDF cortadas especialmente para projetos de modelismo e artesanato. Espessuras variadas de 3mm a 15mm.',
        category: 'madeira',
        subcategory: 'MDF',
        quantity: { value: 50, unit: 'unidades' },
        condition: 'novo',
        price: 8.99,
        images: [],
        location: {
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 324,
        favorites: 28
      },
      {
        id: '8',
        sellerId: '3',
        title: 'Restos de Ferro Fundido',
        description: 'Peças de ferro fundido de demolição industrial. Excelente para refundição ou projetos de metalurgia.',
        category: 'metais',
        subcategory: 'Ferro',
        quantity: { value: 1.5, unit: 'toneladas' },
        condition: 'usado',
        price: 850.00,
        images: [],
        location: {
          city: 'Curitiba',
          state: 'PR'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 145,
        favorites: 9
      },
      {
        id: '9',
        sellerId: '4',
        title: 'Papel Kraft Marrom',
        description: 'Bobinas de papel kraft marrom usadas, ideais para embalagens ecológicas e projetos sustentáveis.',
        category: 'papel',
        subcategory: 'Kraft',
        quantity: { value: 800, unit: 'kg' },
        condition: 'usado',
        price: 1.20,
        images: [],
        location: {
          city: 'Fortaleza',
          state: 'CE'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 267,
        favorites: 11
      },
      {
        id: '10',
        sellerId: '5',
        title: 'Resíduos de Jeans',
        description: 'Retalhos de jeans 100% algodão de confecção. Perfeito para patchwork e upcycling de roupas.',
        category: 'tecidos',
        subcategory: 'Jeans',
        quantity: { value: 120, unit: 'kg' },
        condition: 'sobras_limpas',
        price: 6.50,
        images: [],
        location: {
          city: 'Porto Alegre',
          state: 'RS'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 198,
        favorites: 22
      },
      {
        id: '11',
        sellerId: '1',
        title: 'Plástico HDPE Colorido',
        description: 'Fragmentos de HDPE em diversas cores provenientes de reciclagem de brinquedos e utilidades domésticas.',
        category: 'plasticos',
        subcategory: 'HDPE',
        quantity: { value: 350, unit: 'kg' },
        condition: 'sobras_limpas',
        price: 3.20,
        images: [],
        location: {
          city: 'São Paulo',
          state: 'SP'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 412,
        favorites: 31
      },
      {
        id: '12',
        sellerId: '2',
        title: 'Madeira de Eucalipto',
        description: 'Toras de eucalipto tratado, ideais para construção civil e móveis rústicos. Madeira seca e pronta para uso.',
        category: 'madeira',
        subcategory: 'Eucalipto',
        quantity: { value: 8, unit: 'm3' },
        condition: 'usado',
        price: 220.00,
        images: [],
        location: {
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 167,
        favorites: 13
      },
      {
        id: '13',
        sellerId: '3',
        title: 'Sucata de Cobre',
        description: 'Fios e tubos de cobre recuperados de instalações elétricas e hidráulicas. Material de alta pureza.',
        category: 'metais',
        subcategory: 'Cobre',
        quantity: { value: 85, unit: 'kg' },
        condition: 'usado',
        price: 28.50,
        images: [],
        location: {
          city: 'Curitiba',
          state: 'PR'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 389,
        favorites: 47
      },
      {
        id: '14',
        sellerId: '4',
        title: 'Papelão Ondulado',
        description: 'Caixas de papelão ondulado desmontadas e prensadas. Excelente para reciclagem ou reutilização.',
        category: 'papel',
        subcategory: 'Papelão',
        quantity: { value: 600, unit: 'kg' },
        condition: 'usado',
        price: 0.80,
        images: [],
        location: {
          city: 'Fortaleza',
          state: 'CE'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 234,
        favorites: 8
      },
      {
        id: '15',
        sellerId: '5',
        title: 'Tecido de Poliéster',
        description: 'Sobras de tecido de poliéster de estamparia digital. Cores vibrantes e qualidade premium.',
        category: 'tecidos',
        subcategory: 'Poliéster',
        quantity: { value: 75, unit: 'kg' },
        condition: 'novo',
        price: 12.00,
        images: [],
        location: {
          city: 'Porto Alegre',
          state: 'RS'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 156,
        favorites: 19
      },
      {
        id: '16',
        sellerId: '1',
        title: 'Baterias de Notebook',
        description: 'Baterias de notebook usadas para recuperação de lítio e outros materiais valiosos. Descarte responsável.',
        category: 'eletronicos',
        subcategory: 'Baterias',
        quantity: { value: 40, unit: 'unidades' },
        condition: 'usado',
        price: 15.00,
        images: [],
        location: {
          city: 'São Paulo',
          state: 'SP'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 278,
        favorites: 16
      },
      {
        id: '17',
        sellerId: '2',
        title: 'Restos Orgânicos Compostáveis',
        description: 'Resíduos orgânicos de restaurante, perfeitos para compostagem e produção de adubo orgânico.',
        category: 'organicos',
        subcategory: 'Compostáveis',
        quantity: { value: 200, unit: 'kg' },
        condition: 'sobras_limpas',
        price: 0.50,
        images: [],
        location: {
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 89,
        favorites: 4
      },
      {
        id: '18',
        sellerId: '3',
        title: 'Plástico PP Transparente',
        description: 'Embalagens de polipropileno transparente de indústria alimentícia. Limpo e pronto para reciclagem.',
        category: 'plasticos',
        subcategory: 'PP',
        quantity: { value: 280, unit: 'kg' },
        condition: 'sobras_limpas',
        price: 2.80,
        images: [],
        location: {
          city: 'Curitiba',
          state: 'PR'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 345,
        favorites: 24
      },
      {
        id: '19',
        sellerId: '4',
        title: 'Madeira de Pinus Tratado',
        description: 'Ripas e tábuas de pinus tratado com autoclave. Resistente à umidade, ideal para área externa.',
        category: 'madeira',
        subcategory: 'Pinus',
        quantity: { value: 12, unit: 'm3' },
        condition: 'usado',
        price: 180.00,
        images: [],
        location: {
          city: 'Fortaleza',
          state: 'CE'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 201,
        favorites: 15
      },
      {
        id: '20',
        sellerId: '5',
        title: 'Aço Inoxidável Industrial',
        description: 'Chapas e perfis de aço inoxidável 304 de desmontagem industrial. Excelente estado de conservação.',
        category: 'metais',
        subcategory: 'Aço Inox',
        quantity: { value: 500, unit: 'kg' },
        condition: 'usado',
        price: 12.80,
        images: [],
        location: {
          city: 'Porto Alegre',
          state: 'RS'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 467,
        favorites: 52
      },
      {
        id: '21',
        sellerId: '1',
        title: 'Revista e Livros Usados',
        description: 'Lote de revistas e livros usados para reciclagem de papel ou projetos artísticos.',
        category: 'papel',
        subcategory: 'Livros',
        quantity: { value: 150, unit: 'kg' },
        condition: 'usado',
        price: 1.50,
        images: [],
        location: {
          city: 'São Paulo',
          state: 'SP'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 123,
        favorites: 6
      },
      {
        id: '22',
        sellerId: '2',
        title: 'Tecido de Lã Virgem',
        description: 'Sobras de tecido de lã virgem de alta qualidade. Cores neutras, perfeito para roupas de inverno.',
        category: 'tecidos',
        subcategory: 'Lã',
        quantity: { value: 45, unit: 'kg' },
        condition: 'novo',
        price: 25.00,
        images: [],
        location: {
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 189,
        favorites: 31
      },
      {
        id: '23',
        sellerId: '3',
        title: 'Placas de Circuito Impresso',
        description: 'PCBs de equipamentos eletrônicos para recuperação de metais preciosos e componentes.',
        category: 'eletronicos',
        subcategory: 'PCBs',
        quantity: { value: 60, unit: 'kg' },
        condition: 'usado',
        price: 18.00,
        images: [],
        location: {
          city: 'Curitiba',
          state: 'PR'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 298,
        favorites: 23
      },
      {
        id: '24',
        sellerId: '4',
        title: 'Borracha de Pneu Triturada',
        description: 'Borracha de pneu triturada para pavimentação ecológica e fabricação de produtos reciclados.',
        category: 'outros',
        subcategory: 'Borracha',
        quantity: { value: 1.2, unit: 'toneladas' },
        condition: 'usado',
        price: 450.00,
        images: [],
        location: {
          city: 'Fortaleza',
          state: 'CE'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 167,
        favorites: 12
      },
      {
        id: '25',
        sellerId: '5',
        title: 'Casca de Arroz',
        description: 'Casca de arroz limpa e seca, ideal para biomassa, compostagem ou substrato para plantas.',
        category: 'organicos',
        subcategory: 'Biomassa',
        quantity: { value: 5, unit: 'toneladas' },
        condition: 'sobras_limpas',
        price: 80.00,
        images: [],
        location: {
          city: 'Porto Alegre',
          state: 'RS'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 234,
        favorites: 18
      },
      {
        id: '26',
        sellerId: '1',
        title: 'Vidro Temperado Quebrado',
        description: 'Fragmentos de vidro temperado de construção civil. Seguro para reciclagem industrial.',
        category: 'outros',
        subcategory: 'Vidro',
        quantity: { value: 800, unit: 'kg' },
        condition: 'usado',
        price: 0.60,
        images: [],
        location: {
          city: 'São Paulo',
          state: 'SP'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 189,
        favorites: 22
      },
      {
        id: '7',
        sellerId: '2',
        title: 'Restos Orgânicos Compostáveis',
        description: 'Material orgânico ideal para compostagem. Livre de contaminantes químicos.',
        category: 'organicos',
        subcategory: 'Restos vegetais',
        quantity: { value: 100, unit: 'kg' },
        condition: 'novo',
        price: 0.50,
        images: [],
        location: {
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 45,
        favorites: 3
      },
      {
        id: '8',
        sellerId: '3',
        title: 'Cobre Recuperado',
        description: 'Fios de cobre recuperados de instalações elétricas. Alta pureza.',
        category: 'metais',
        subcategory: 'Cobre',
        quantity: { value: 80, unit: 'kg' },
        condition: 'usado',
        price: 18.00,
        images: [],
        location: {
          city: 'Curitiba',
          state: 'PR'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 267,
        favorites: 31
      }
    ];
    
    demoItems.forEach(saveWasteItem);
  }
};

// Cart functions
export const getCartItems = (userId: string): CartItem[] => {
  const carts = getFromStorage<Record<string, CartItem[]>>(STORAGE_KEYS.CART);
  const userCart = carts.find(c => Object.keys(c)[0] === userId);
  return userCart ? userCart[userId] : [];
};

export const addToCart = (userId: string, wasteItemId: string, quantity: number = 1): void => {
  let carts = getFromStorage<Record<string, CartItem[]>>(STORAGE_KEYS.CART);
  const userCart = getCartItems(userId);
  
  const existingItem = userCart.find(item => item.wasteItemId === wasteItemId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    userCart.push({
      id: Date.now().toString(),
      wasteItemId,
      quantity,
      addedAt: new Date().toISOString()
    });
  }
  
  carts = carts.filter(c => Object.keys(c)[0] !== userId);
  carts.push({ [userId]: userCart });
  saveToStorage(STORAGE_KEYS.CART, carts);
};

export const removeFromCart = (userId: string, wasteItemId: string): void => {
  let carts = getFromStorage<Record<string, CartItem[]>>(STORAGE_KEYS.CART);
  const userCart = getCartItems(userId).filter(item => item.wasteItemId !== wasteItemId);
  
  carts = carts.filter(c => Object.keys(c)[0] !== userId);
  carts.push({ [userId]: userCart });
  saveToStorage(STORAGE_KEYS.CART, carts);
};

export const updateCartQuantity = (userId: string, wasteItemId: string, quantity: number): void => {
  let carts = getFromStorage<Record<string, CartItem[]>>(STORAGE_KEYS.CART);
  const userCart = getCartItems(userId);
  
  const item = userCart.find(item => item.wasteItemId === wasteItemId);
  if (item) {
    item.quantity = quantity;
  }
  
  carts = carts.filter(c => Object.keys(c)[0] !== userId);
  carts.push({ [userId]: userCart });
  saveToStorage(STORAGE_KEYS.CART, carts);
};

export const clearCart = (userId: string): void => {
  let carts = getFromStorage<Record<string, CartItem[]>>(STORAGE_KEYS.CART);
  carts = carts.filter(c => Object.keys(c)[0] !== userId);
  saveToStorage(STORAGE_KEYS.CART, carts);
};

export const getCartTotal = (userId: string): number => {
  const cartItems = getCartItems(userId);
  return cartItems.reduce((total, cartItem) => {
    const wasteItem = getWasteItemById(cartItem.wasteItemId);
    if (wasteItem) {
      return total + (wasteItem.price * cartItem.quantity);
    }
    return total;
  }, 0);
};

// Notification functions
export const getNotifications = (userId: string): Notification[] => {
  const notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  return notifications.filter(n => n.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const createNotification = (notification: Notification): void => {
  const notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  notifications.push(notification);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
};

export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
};

export const getUnreadNotificationCount = (userId: string): number => {
  const notifications = getNotifications(userId);
  return notifications.filter(n => !n.read).length;
};

// Purchase function
export const createPurchaseTransaction = (
  buyerId: string,
  cartItems: CartItem[],
  paymentMethod: Transaction['paymentMethod'],
  deliveryMethod: Transaction['deliveryMethod']
): Transaction[] => {
  const transactions: Transaction[] = [];
  
  cartItems.forEach(cartItem => {
    const wasteItem = getWasteItemById(cartItem.wasteItemId);
    if (wasteItem) {
      const transaction: Transaction = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        buyerId,
        sellerId: wasteItem.sellerId,
        wasteItemId: wasteItem.id,
        quantity: cartItem.quantity,
        totalPrice: wasteItem.price * cartItem.quantity,
        status: 'pendente',
        paymentMethod,
        deliveryMethod,
        createdAt: new Date().toISOString()
      };
      
      saveTransaction(transaction);
      transactions.push(transaction);
      
      // Update eco impact
      updateEcoImpact(transaction, wasteItem);
      
      // Create notifications
      createNotification({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: buyerId,
        type: 'purchase',
        title: 'Compra realizada',
        message: `Sua compra de ${wasteItem.title} foi processada com sucesso!`,
        read: false,
        createdAt: new Date().toISOString(),
        relatedId: transaction.id
      });
      
      createNotification({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: wasteItem.sellerId,
        type: 'sale',
        title: 'Nova venda',
        message: `Você vendeu ${wasteItem.title}!`,
        read: false,
        createdAt: new Date().toISOString(),
        relatedId: transaction.id
      });
    }
  });
  
  return transactions;
};

// Recommendation engine
export const getRecommendedItems = (userId: string): WasteItem[] => {
  const userTransactions = getUserTransactions(userId);
  const userFavorites = getFavorites(userId);
  const allItems = getWasteItems().filter(item => item.isActive && item.sellerId !== userId);
  
  // Get categories from user's previous purchases and favorites
  const userCategories = new Set([
    ...userTransactions.map(t => {
      const item = getWasteItemById(t.wasteItemId);
      return item?.category;
    }).filter(Boolean),
    ...userFavorites.map(id => {
      const item = getWasteItemById(id);
      return item?.category;
    }).filter(Boolean)
  ]);
  
  // Recommend items from similar categories
  const recommended = allItems
    .filter(item => userCategories.has(item.category))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);
  
  // If not enough recommendations, add popular items
  if (recommended.length < 6) {
    const popularItems = allItems
      .filter(item => !recommended.includes(item))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6 - recommended.length);
    
    recommended.push(...popularItems);
  }
  
  return recommended;
};