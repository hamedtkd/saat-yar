export class AppDataSyncGuard {
  private dirty = false;
  private conflicted = false;
  private generation = 0;

  markLocalChange() {
    this.dirty = true;
    this.generation += 1;
  }

  hasLocalChanges() {
    return this.dirty;
  }

  currentGeneration() {
    return this.generation;
  }

  hasConflict() {
    return this.conflicted;
  }

  deferRemoteUpdate(isSaving: boolean) {
    if (!this.dirty && !isSaving) return false;
    this.conflicted = true;
    return true;
  }

  markConflict() {
    this.conflicted = true;
  }

  captureSaveGeneration() {
    return this.generation;
  }

  confirmSave(generation: number) {
    if (this.generation === generation) this.dirty = false;
  }

  failSave() {
    // Failed persistence leaves the dirty generation intact for retry or conflict resolution.
  }

  applyRemoteUpdate() {
    this.dirty = false;
    this.conflicted = false;
    this.generation += 1;
  }

  resolveConflict() {
    this.conflicted = false;
  }
}

export class OneShotPersistenceSkip {
  private pending = false;

  skipNext() {
    this.pending = true;
  }

  consume() {
    const pending = this.pending;
    this.pending = false;
    return pending;
  }
}

export function scheduleGuardedSave<T>(value: T, delay: number, canSave: () => boolean, save: (value: T) => void) {
  const timer = setTimeout(() => {
    if (canSave()) save(value);
  }, delay);
  return () => clearTimeout(timer);
}
