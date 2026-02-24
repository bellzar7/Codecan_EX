enum MlmReferralStatus {
  PENDING = 0,
  ACTIVE = 1,
  REJECTED = 2,
}

interface MlmReferral {
  id: string;
  createdAt: Date;
  status: MlmReferralStatus;
  referrerId: string;
  referrer: User;
  referredId: string;
  referred: User;
  rewards: MlmReferralReward[];
  mlmBinaryNode?: MlmBinaryNode;
  mlmUnilevelNode?: MlmUnilevelNode;
}

interface MlmBinaryNode {
  id: string;
  referralId: string;
  referral: MlmReferral;
  parentId?: string;
  parent?: MlmBinaryNode;
  leftChildId?: string;
  leftChild?: MlmBinaryNode;
  rightChildId?: string;
  rightChild?: MlmBinaryNode;
  childs: MlmBinaryNode[];
  leftChildren: MlmBinaryNode[];
  rightChildren: MlmBinaryNode[];
}

interface MlmUnilevelNode {
  id: string;
  referralId: string;
  referral: MlmReferral;
  parentId?: string;
  parent?: MlmUnilevelNode;
  childs: MlmUnilevelNode[];
}

interface MlmReferralReward {
  id: string;
  reward: number;
  isClaimed: boolean;
  createdAt: Date;
  conditionId: string;
  condition: MlmReferralCondition;
  referralId: string;
  referral: MlmReferral;
}

enum MlmReferralConditionType {
  DEPOSIT = 0,
  TRADE = 1,
  INVESTENT = 2,
  INVESTMENT = 3,
  AI_INVESTMENT = 4,
  FOREX_INVESTMENT = 5,
  ICO_CONTRIBUTION = 6,
  STAKING = 7,
  ECOMMERCE_PURCHASE = 8,
  P2P_TRADE = 9,
}

interface MlmReferralCondition {
  id: string;
  name: string;
  title: string;
  description: string;
  type: MlmReferralConditionType;
  reward: number;
  rewardType: MlmReferralConditionRewardType;
  rewardWalletType: WalletType;
  rewardCurrency: string;
  rewardChain: string;
  referralReward: MlmReferralReward[];
}

enum MlmReferralConditionRewardType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
}

enum ReferralStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
}

enum ReferralConditionType {
  DEPOSIT = "DEPOSIT",
  TRADE = "TRADE",
  INVEST = "INVEST",
}

interface Referral {
  id: string;
  createdAt: Date;
  status: ReferralStatus;
  referrerId: string;
  referredId: string;
  referrer: User;
  referred: User;
  rewards: ReferralReward[];
}

interface ReferralReward {
  id: string;
  reward: number;
  isClaimed: boolean;
  createdAt: Date;
  referralId: string;
  referral: Referral;
}

interface ReferralCondition {
  id: string;
  type: ReferralConditionType;
  reward: number;
  rewardWalletType: WalletType;
  rewardCurrency: string;
  rewardChain: string;
}
