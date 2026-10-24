export type CircuitKind = 'series' | 'parallel';

// Each disconnected lamp opens its own branch. There is only one branch in series.
export function lampStates(kind: CircuitKind, connected: readonly [boolean, boolean]): [boolean, boolean] {
  return kind === 'series'
    ? [connected[0] && connected[1], connected[0] && connected[1]]
    : [connected[0], connected[1]];
}
