import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { generateMockStats } from '@/lib/admin/mock-stats';
import { CorrelationsSection } from './CorrelationsSection';

const facts = generateMockStats().correlations;

describe('CorrelationsSection', () => {
  it('lists the facts sorted by |r|, in French number format', () => {
    render(<CorrelationsSection facts={facts} />);
    const rows = screen.getAllByRole('button', { expanded: false });
    expect(rows[0]).toHaveTextContent('Frontière sacrée');
    expect(screen.getByText('0,87')).toBeInTheDocument();
    expect(screen.getByText('-0,55')).toBeInTheDocument();
  });

  it('flags the pair with shared items as a method artefact', () => {
    render(<CorrelationsSection facts={facts} />);
    expect(screen.getAllByText('artefact de méthode')).toHaveLength(1);
    expect(screen.getByText(/theo_inspiration/)).toBeInTheDocument();
  });

  it('shows every hypothesis, marking the ones that could not be computed', () => {
    render(<CorrelationsSection facts={facts} />);
    expect(screen.getAllByText('H1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('H8').length).toBeGreaterThan(0);
    // Only H1 (religiosity x sacredBoundary) has a matching fact in the fixture.
    expect(screen.getAllByText(/non calculable/)).toHaveLength(7);
  });

  it('reveals the ranked interpretations when a row is expanded', () => {
    render(<CorrelationsSection facts={facts} />);
    const trigger = screen.getAllByRole('button', { expanded: false })[0];
    fireEvent.click(trigger);

    const details = screen.getByRole('button', { expanded: true }).closest('tbody');
    expect(details).not.toBeNull();
    const scope = within(details as HTMLElement);
    expect(scope.getAllByText(/Réserves/).length).toBeGreaterThan(0);
    expect(scope.getAllByText('Statistique').length).toBeGreaterThan(0);
    expect(scope.getAllByText('Interprétative').length).toBeGreaterThan(0);
    expect(scope.getAllByText('Globale').length).toBeGreaterThan(0);
    expect(scope.getAllByText(/Grade [ABCD]/).length).toBeGreaterThan(0);
  });

  it('says so when nothing could be correlated', () => {
    render(<CorrelationsSection facts={[]} />);
    expect(screen.getByText(/Aucune corrélation calculée/)).toBeInTheDocument();
  });
});
