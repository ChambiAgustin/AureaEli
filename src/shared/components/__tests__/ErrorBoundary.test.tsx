import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

const ProblemChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test crash in Sanctuary');
  }
  return <div>Santuario en Calma</div>;
};

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renderiza a sus hijos correctamente cuando no hay excepciones', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Santuario en Calma')).toBeDefined();
  });

  it('captura errores de renderizado y muestra la UI de contingencia sensorial', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Pausa en el Santuario')).toBeDefined();
    expect(screen.getByText('Reiniciar Santuario')).toBeDefined();
  });

  it('permite un fallback personalizado si es provisto', () => {
    render(
      <ErrorBoundary fallback={<div>Fallback Personalizado</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Fallback Personalizado')).toBeDefined();
  });
});
