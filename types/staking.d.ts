// Enums
enum StakingStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  COMPLETED = "COMPLETED",
}

enum StakeStatus {
  ACTIVE = "ACTIVE",
  RELEASED = "RELEASED",
  WITHDRAWN = "WITHDRAWN",
}

enum RewardStatus {
  PENDING = "PENDING",
  DISTRIBUTED = "DISTRIBUTED",
}

// Model Types
interface StakingPool {
  id: string;
  name: string;
  description: string;
  currency: string;
  chain: string;
  icon?: string;
  type: WalletType;
  minStake: number;
  maxStake: number;
  status: StakingStatus;
  durations: StakingDuration[];
  stakes: StakingLog[];
  createdAt: Date;
}

interface StakingDuration {
  id: string;
  poolId: number;
  duration: number; // Duration in days
  interestRate: number; // Annual interest rate as a percentage
  pool: StakingPool;
  createdAt: Date;
}

interface StakingLog {
  id: string;

  userId: string;
  poolId: string;
  amount: number; // Amount of tokens staked
  stakeDate: Date; // Date when the stake was made
  releaseDate: Date; // Date when the stake can be withdrawn
  status: StakeStatus;
  rewards: StakingReward[];
  pool: StakingPool;
  transaction: Transaction;
  createdAt: Date;
}

interface StakingReward {
  id: string;
  stakeId: string;
  amount: number; // Reward amount
  rewardDate: Date; // Date when the reward was distributed
  status: RewardStatus;
  stake: StakingLog;
  createdAt: Date;
}

interface CreateStakeInput {
  userId: string;
  poolId: string;
  amount: number;
}

interface UpdateStakeInput {
  stakeId: string;
  amount?: number;
  status?: StakeStatus;
}

interface CreatePoolInput {
  name: string;
  description: string;
  tokenName: string;
  minStake: number;
  maxStake: number;
}

interface UpdatePoolInput {
  poolId: string;
  name?: string;
  description?: string;
  tokenName?: string;
  minStake?: number;
  maxStake?: number;
  status?: StakingStatus;
}
