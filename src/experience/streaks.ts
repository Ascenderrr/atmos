import { streakFieldConfig, type StreakFieldConfig } from '../config/scene';

// Progress-velocity (per second) → streak opacity. Pure so the motion
// reactivity is unit-testable without a frame loop.
export function streakOpacityForVelocity(
  velocity: number,
  config: StreakFieldConfig = streakFieldConfig,
): number {
  return Math.min(Math.max(velocity, 0) * config.velocityGain, config.maxOpacity);
}
