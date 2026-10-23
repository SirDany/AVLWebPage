import * as migration_20261023_121903_initial from './20261023_121903_initial';
import * as migration_20261023_141653_celestial_focus from './20261023_141653_celestial_focus';
import * as migration_20261023_145813_project_showcase from './20261023_145813_project_showcase';

export const migrations = [
  {
    up: migration_20261023_121903_initial.up,
    down: migration_20261023_121903_initial.down,
    name: '20261023_121903_initial',
  },
  {
    up: migration_20261023_141653_celestial_focus.up,
    down: migration_20261023_141653_celestial_focus.down,
    name: '20261023_141653_celestial_focus',
  },
  {
    up: migration_20261023_145813_project_showcase.up,
    down: migration_20261023_145813_project_showcase.down,
    name: '20261023_145813_project_showcase'
  },
];
