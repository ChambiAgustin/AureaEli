import React from 'react';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'body-sm' | 'caption';
export type TypographyColor = 'tierra' | 'arena' | 'crema' | 'oliva' | 'bosque' | 'gold' | 'terracota' | 'magenta' | 'light' | 'muted' | 'dark' | 'inherit';
export type TypographyWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
  color?: TypographyColor;
  weight?: TypographyWeight;
  italic?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantMapping: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as,
  color = 'dark',
  weight,
  italic = false,
  className = '',
  children,
  ...props
}) => {
  const Component = as || variantMapping[variant];

  // Resolve dynamic classes
  const classes = [
    `font-${variant}`,
    `color-${color}`,
    weight ? `weight-${weight}` : '',
    italic ? 'italic' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Typography;
