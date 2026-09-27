import { Component, type ReactNode } from 'react';

interface BoundaryProps {
  onError: () => void;
  children: ReactNode;
}

// Last-resort catcher around the 3D experience: a render crash degrades to
// the ERROR state (static content) instead of a blank page.
export class ExperienceErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
