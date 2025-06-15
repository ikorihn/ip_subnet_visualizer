# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an IP subnet visual calculator built with React + TypeScript + Vite. The project appears to be in early development stages with the default Vite React template still in place.

## Development Commands

This project uses pnpm as package manager

- `pnpm run dev` - Start development server with hot module replacement
- `pnpm run build` - Build for production (runs TypeScript compiler then Vite build)
- `pnpm run lint` - Run Biome linter on the codebase
- `pnpm run lint:fix` - Run Biome linter and auto-fix issues
- `pnpm run format` - Format code with Biome
- `pnpm run check` - Run Biome check (lint + format)
- `pnpm run preview` - Preview the production build locally

## Architecture

- **Frontend Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.3.5 with @vitejs/plugin-react
- **TypeScript Configuration**: Multi-config setup with separate configs for app and node environments
- **Linting & Formatting**: Biome with TypeScript and React support

## Key Files

- `src/App.tsx` - Main application component (currently the Vite default template)
- `vite.config.ts` - Vite configuration with React plugin
- `tsconfig.json` - Root TypeScript configuration that references app and node configs
- `eslint.config.js` - ESLint configuration

## Language

Claude Codeとのやり取りは日本語で行います。
アプリケーションのUIには英語を使用してください。

## Commit Rules

- NEVER ever mention a co-authored-by or similar aspects. In particular, never mention the tool used to create the commit message or PR.
