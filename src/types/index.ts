export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'pessoa_fisica' | 'pessoa_juridica';
  cnpj?: string;
  cpf?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  rating: number;
  reviewCount: number;
  createdAt: string;
  isVerified: boolean;
}

export interface WasteItem {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: WasteCategory;
  subcategory: string;
  quantity: {
    value: number;
    unit: 'kg' | 'm3' | 'unidades' | 'toneladas';
  };
  condition: 'novo' | 'usado' | 'sobras_limpas' | 'contaminado';
  price: number;
  images: string[];
  location: {
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  technicalDetails?: {
    plasticType?: string;
    purity?: string;
    composition?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
  favorites: number;
}

export type WasteCategory = 
  | 'plasticos'
  | 'metais'
  | 'papel'
  | 'madeira'
  | 'tecidos'
  | 'eletronicos'
  | 'organicos'
  | 'outros';

export interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  wasteItemId: string;
  quantity: number;
  totalPrice: number;
  status: 'pendente' | 'confirmado' | 'em_transporte' | 'entregue' | 'cancelado';
  paymentMethod: 'pix' | 'boleto' | 'cartao' | 'dinheiro';
  deliveryMethod: 'retirada_local' | 'entrega' | 'transportadora';
  createdAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  buyerId: string;
  sellerId: string;
  wasteItemId: string;
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewedUserId: string;
  transactionId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface EcoImpact {
  totalWasteReused: number; // kg
  co2Saved: number; // kg
  transactionsCount: number;
  categoriesImpact: Record<WasteCategory, number>;
}