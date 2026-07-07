import { createContext, useContext } from 'react';

/** Navigate to a screen by its key (see SCREENS in App.tsx). */
export type NavigateFn = (key: string) => void;

/**
 * Lightweight navigation so any screen can jump to another (e.g. the Home
 * splash's cards) without threading callbacks through props.
 */
export const NavigationContext = createContext<NavigateFn>(() => {});

export const useNavigate = (): NavigateFn => useContext(NavigationContext);

/** Opens the drawer menu, so the Home splash can offer a "get started" action. */
export const MenuContext = createContext<() => void>(() => {});

export const useOpenMenu = (): (() => void) => useContext(MenuContext);
