The math utility offers a cryptographically strong `random` helper with two overloads: `random()` yields a decimal in `[0, 1)`, and `random(min, max)` yields a uniform random integer inclusive of both bounds. It prefers `crypto.randomInt`/`getRandomValues` and falls back to a rejection-sampling algorithm so the distribution stays uniform.

## When to use

- Generating a non-predictable random decimal for probability or sampling logic.
- Producing a random integer within a range, for example picking an array index or a lottery number.
- Anywhere a stronger generator than built-in `Math.random` is preferred.

## Key features

- **Two overloads** — `random()` for a `[0, 1)` decimal, `random(min, max)` for an inclusive integer.
- **Cryptographically secure** — Backed by Node `crypto.randomInt` / `webcrypto` when available, with an unbiased rejection-sampling fallback.
- **Safe validation** — Non-finite or non-integer bounds throw a `TypeError`.
- **Tolerant ordering** — If `min > max` the two are swapped automatically, so the range stays valid.

## Sample code

```ts
import { random } from '@tiny-codes/react-easy';

// Decimal in [0, 1)
const ratio = random(); // e.g. 0.5123

// Inclusive integer in [1, 6], like rolling a die
const dice = random(1, 6);

// Range is auto-swapped when min > max
const clamped = random(10, 1); // same as random(1, 10)
```

## Usage notes

- The no-arg form returns a float in `[0, 1)`; the two-arg form returns an integer in `[min, max]`, both inclusive.
- Both `min` and `max` must be provided together — passing only one, a non-finite number, or a non-integer throws a `TypeError`.
- When `min` is greater than `max` they are swapped before sampling, so no `RangeError` is raised.
- The integer range is uniform (no modulo bias) thanks to rejection sampling; performance is not a concern for typical ranges.
