
import { User } from '../types';

export const AI_WHITELIST = ["ramos", "madariaga", "vega", "lopez"];

export const canUseAI = (user: User | null): { allowed: boolean; reason?: string } => {
  return { 
    allowed: true, 
  };
};
