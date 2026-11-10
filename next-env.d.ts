/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="esnext" />

declare namespace JSX {
  type Element = any;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface ElementAttributesProperty {
    props: {};
  }
  interface ElementChildrenAttribute {
    children: {};
  }
}

declare module "react" {
  export type ReactNode = any;
  export type JSX = any;
  export interface FormEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    currentTarget: EventTarget & T;
    target: EventTarget & T;
  }
  export interface ChangeEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    currentTarget: EventTarget & T;
    target: EventTarget & T;
  }
  export interface MouseEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    currentTarget: EventTarget & T;
    target: EventTarget & T;
  }
  export type FC<P = {}> = (props: P) => any;
  export type ComponentType<P = {}> = (props: P) => any;

  export function useState<S>(
    initialState: S | (() => S)
  ): [S, (value: S | ((prevState: S) => S)) => void];
  export function useState<S = undefined>(): [
    S | undefined,
    (value: S | undefined | ((prevState: S | undefined) => S | undefined)) => void
  ];
  export function useEffect(
    effect: () => void | (() => void),
    deps?: readonly any[]
  ): void;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: readonly any[]
  ): T;
  export function useRef<T>(initialValue: T): { current: T };

  const React: {
    createElement: (...args: any[]) => any;
    Fragment: any;
    useState: typeof useState;
    useEffect: typeof useEffect;
    useMemo: typeof useMemo;
    useCallback: typeof useCallback;
    useRef: typeof useRef;
  };
  export default React;
}

declare module "react/jsx-runtime" {
  export namespace JSX {
    type Element = any;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  export const Fragment: any;
  export function jsx(...args: any[]): any;
  export function jsxs(...args: any[]): any;
}

declare module "react/jsx-dev-runtime" {
  export namespace JSX {
    type Element = any;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  export const Fragment: any;
  export function jsxDEV(...args: any[]): any;
}

declare module "next" {
  export interface Metadata {
    title?: string | { default: string; template?: string };
    description?: string;
    [key: string]: any;
  }
}

declare module "next/link" {
  export interface LinkProps {
    href: string;
    className?: string;
    children?: any;
    target?: string;
    rel?: string;
    title?: string;
    onClick?: (e: any) => void;
    [key: string]: any;
  }
  const Link: (props: LinkProps) => any;
  export default Link;
}

declare module "next/navigation" {
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (href: string) => void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module "lucide-react" {
  import type { FC } from "react";
  export interface LucideProps {
    className?: string;
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    [key: string]: any;
  }
  export type LucideIcon = FC<LucideProps>;

  export const Calendar: LucideIcon;
  export const MonitorPlay: LucideIcon;
  export const Headphones: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Megaphone: LucideIcon;
  export const GraduationCap: LucideIcon;
  export const LogOut: LucideIcon;
  export const UserCheck: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Clock: LucideIcon;
  export const Info: LucideIcon;
  export const Building2: LucideIcon;
  export const Lock: LucideIcon;
  export const User: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Briefcase: LucideIcon;
  export const BookOpen: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Award: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const X: LucideIcon;
  export const MessageSquareQuote: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const FileCheck: LucideIcon;
  export const Home: LucideIcon;
  export const Maximize2: LucideIcon;
  export const Minimize2: LucideIcon;
  export const Percent: LucideIcon;
  export const Wallet: LucideIcon;
  export const Calculator: LucideIcon;
  export const Ban: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const MapPin: LucideIcon;
}

declare module "tailwindcss" {
  export interface Config {
    content: string[];
    theme?: Record<string, any>;
    plugins?: any[];
    [key: string]: any;
  }
}

declare module "*.css";
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";

