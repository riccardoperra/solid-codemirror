// @refresh reload
import { Routes } from 'solid-start/root';
import { ErrorBoundary } from 'solid-start/error-boundary';

import './index.css';
import { Suspense } from 'solid-js';

export default function Root() {
  return (
    <>
      <main>
        <ErrorBoundary>
          <Suspense>
            <Routes />
          </Suspense>
        </ErrorBoundary>
      </main>
    </>
  );
}
