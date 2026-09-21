# ADR-001: Mobile Framework Selection (Flutter vs React Native vs Native)

## Status
Accepted

## Context
Teacher OS targets private tutors, students, and parents primarily in Egypt and MENA. The target user base uses predominantly mid-range to budget Android smartphones (MediaTek, Qualcomm 600/700 series) with intermittent network connectivity. Requirements include:
1. Flawless bidirectional RTL/LTR rendering for Arabic typography.
2. 60fps smooth rendering on budget devices.
3. Rapid multi-platform support (Android, iOS, Web Admin).
4. Strong offline-first state architecture.

## Decision
We select **Flutter (Dart)** with **Riverpod Clean Feature-First Architecture**.

## Consequences
### Positive
- Direct canvas rendering via Impeller/Skia guarantees identical pixel-perfect RTL rendering across Android and iOS versions.
- Superior performance on lower-tier Android devices compared to JS bridge architectures.
- Shared domain models and presentation logic across Teacher, Student, and Parent portals.

### Negative
- Initial binary download size is slightly larger (~15-20MB), which we will optimize using dynamic app bundles and tree shaking.
