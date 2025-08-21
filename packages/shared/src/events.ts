export type EventType = 
  | 'user.registered'
  | 'user.login'
  | 'purchase.completed'
  | 'cashback.earned'
  | 'cashback.redeemed'
  | 'settlement.processed';

export interface BaseEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  userId?: string;
  merchantId?: string;
}

export interface UserRegisteredEvent extends BaseEvent {
  type: 'user.registered';
  userId: string;
  data: {
    email: string;
    regionId: string;
  };
}

export interface UserLoginEvent extends BaseEvent {
  type: 'user.login';
  userId: string;
  data: {
    email: string;
  };
}

export interface PurchaseCompletedEvent extends BaseEvent {
  type: 'purchase.completed';
  userId: string;
  merchantId: string;
  data: {
    transactionId: string;
    amount: number;
    cashbackAmount: number;
  };
}

export interface CashbackEarnedEvent extends BaseEvent {
  type: 'cashback.earned';
  userId: string;
  data: {
    amount: number;
    transactionId: string;
  };
}

export interface CashbackRedeemedEvent extends BaseEvent {
  type: 'cashback.redeemed';
  userId: string;
  data: {
    amount: number;
    walletMovementId: string;
  };
}

export interface SettlementProcessedEvent extends BaseEvent {
  type: 'settlement.processed';
  merchantId: string;
  data: {
    settlementId: string;
    amount: number;
  };
}

export type CashbackEvent = 
  | UserRegisteredEvent
  | UserLoginEvent
  | PurchaseCompletedEvent
  | CashbackEarnedEvent
  | CashbackRedeemedEvent
  | SettlementProcessedEvent;