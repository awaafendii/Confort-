import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Réserver</Button>);

    const button = screen.getByRole('button', { name: 'Réserver' });
    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disables the button and blocks clicks while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} loading>
        Réserver
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Réserver' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
