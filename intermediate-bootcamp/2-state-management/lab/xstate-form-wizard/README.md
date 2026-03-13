# Lab: XState Multi-Step Form Wizard

Build a statically-verified checkout flow using XState state machines.

## State Machine

```tsx
const checkoutMachine = createMachine({
  id: "checkout",
  initial: "personalInfo",
  context: {
    personalInfo: {},
    address: {},
    payment: {},
    errors: {}
  },
  states: {
    personalInfo: {
      on: {
        NEXT: {
          target: "address",
          guard: "isPersonalInfoValid",
          actions: assign({ personalInfo: (_, event) => event.data })
        }
      }
    },
    address: {
      on: {
        NEXT: { target: "payment", guard: "isAddressValid" },
        BACK: "personalInfo"
      }
    },
    payment: {
      on: {
        SUBMIT: "submitting",
        BACK: "address"
      }
    },
    submitting: {
      invoke: {
        src: "submitOrder",
        onDone: "success",
        onError: { target: "payment", actions: assign({ errors: ... }) }
      }
    },
    success: { type: "final" }
  }
}, {
  guards: {
    isPersonalInfoValid: (ctx, event) => {
      return !!event.data.name && !!event.data.email;
    }
  }
});
```

## Features
- 4 steps: personal → address → payment → success
- Client-side validation with guards
- Back button (except first step)
- Progress indicator
- Error handling with retry
- Final review before submit

## Files to Create
```
src/
  machines/
    checkoutMachine.ts    ← State machine definition
  steps/
    PersonalInfo.tsx      ← Step 1: name, email
    Address.tsx           ← Step 2: street, city, zip
    Payment.tsx           ← Step 3: card number, cvv
    Success.tsx           ← Step 4: confirmation
  components/
    CheckoutWizard.tsx    ← Main component
    ProgressBar.tsx       ← Step indicator
  App.tsx
```

## Time: 3-4 hours
