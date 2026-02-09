# CSS Box Model Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     MARGIN (transparent)                    │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                      BORDER                         │   │
│   │                                                     │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │              PADDING                        │   │   │
│   │   │                                             │   │   │
│   │   │   ┌─────────────────────────────────────┐   │   │   │
│   │   │   │           CONTENT                   │   │   │   │
│   │   │   │                                     │   │   │   │
│   │   │   │  - Text                             │   │   │   │
│   │   │   │  - Images                           │   │   │   │
│   │   │   │  - Child elements                   │   │   │   │
│   │   │   │                                     │   │   │   │
│   │   │   │  width: 200px                       │   │   │   │
│   │   │   │  height: 100px                      │   │   │   │
│   │   │   │                                     │   │   │   │
│   │   │   └─────────────────────────────────────┘   │   │   │
│   │   │                                             │   │   │
│   │   │           padding: 20px                     │   │   │
│   │   │                                             │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   │                                                     │   │
│   │              border: 2px solid                      │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│                    margin: 10px                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Total Width Calculation:
━━━━━━━━━━━━━━━━━━━━━━━

box-sizing: content-box (default)
Total width = width + padding-left + padding-right + border-left + border-right
            = 200 + 20 + 20 + 2 + 2
            = 244px

box-sizing: border-box (recommended)
Total width = width (padding and border included)
            = 200px
```
