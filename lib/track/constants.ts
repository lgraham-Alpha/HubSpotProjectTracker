/** Default sourceIds treated as "key dates" on the track page when project.keyDateSourceIds is not set. */
export const DEFAULT_KEY_DATE_SOURCE_IDS = [
  'targeted_go_live',
  'actual_go_live',
  'targeted_installation',
  'actual_installation',
  'targeted_training',
  'actual_training',
] as const

export const KEY_DATE_OPTIONS: { id: string; label: string }[] = [
  { id: 'targeted_go_live', label: 'Targeted Go-Live' },
  { id: 'actual_go_live', label: 'Actual Go-Live' },
  { id: 'targeted_installation', label: 'Targeted Installation' },
  { id: 'actual_installation', label: 'Actual Installation' },
  { id: 'targeted_training', label: 'Targeted Training' },
  { id: 'actual_training', label: 'Actual Training' },
]
