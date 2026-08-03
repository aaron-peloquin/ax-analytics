---
trigger: model_decision
description: Functional programming standards, immutable data patterns, and type-safe composition in TypeScript. Use when writing pure functions, handling side effects, avoiding classes for logic, or using FP utilities.
---

# Functional Programming in TypeScript Guidelines

Write predictable, side-effect-free, and highly composable code by prioritizing expressions over statements and immutability over mutable state.

## Core Principles
- **Immutability by Default**: Mark object properties and arrays with `readonly`. Never mutate inputs or shared state.
- **Pure Functions**: Functions must always return the same output for the same input and cause zero observable side effects.
- **Expression-Oriented**: Prefer ternary operators, `switch` expressions, and array methods (`map`, `filter`, `reduce`) over statement loops (`for`, `while`).
- **Data First / Data Last**: Keep utility functions consistent; pass data as the last argument when building reusable pipelines.

> [!IMPORTANT]
> A file should only contain 1 function. This makes it more readable.

> [!TIP]
> If your file is over 300 lines, you need to abstract it out to smaller, more composable, helper functions.

## Code Style & Immutability
- **Readonly types**: Use `Readonly<T>` or `readonly T[]` / `ReadonlyArray<T>` explicitly.
- **Object updates**: Use the spread operator (`{ ...state, active: true }`) instead of direct assignment.
- **No classes for state**: Use plain old data objects (PODOs) combined with standalone functions instead of class instances with internal mutable fields.

> [!TIP]
> Prior to making a new function, search for an existing one and use that instead (make minor adjustments if needed, be sensible and use your best judgement).

## Error Handling & Nullability
- **No `null` or `undefined`**: Model optional values via union types (`T | undefined`) or explicit wrapper types like `Option<T>` / `Either<L, R>` if using libraries like `fp-ts` or `Effect`.
- **Exhaustive checking**: Use `never` type assertions in `switch` default branches to guarantee compile-time safety for union matching.

## Anti-Patterns to Avoid
- **Reassignment**: Do not use `let` when `const` works.
- **Side effects in loops/callbacks**: Never trigger network requests, console logs, or DOM updates directly inside a `map` or `filter`.
- **Implicit `any`**: Maintain strict TypeScript configuration (`noImplicitAny`, `strictNullChecks`).
