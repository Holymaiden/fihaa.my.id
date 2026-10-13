'use client';

import type { ReactNode } from 'react';
import { Component } from 'react';

interface WorldErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: () => void;
}

interface WorldErrorBoundaryState {
  failed: boolean;
}

// Catches errors from the 3D scene (shader compile, model load, …) so the
// HTML layer and the way to 2D stay usable.
class WorldErrorBoundary extends Component<
  WorldErrorBoundaryProps,
  WorldErrorBoundaryState
> {
  state: WorldErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): WorldErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('3D world failed to render', error);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default WorldErrorBoundary;
