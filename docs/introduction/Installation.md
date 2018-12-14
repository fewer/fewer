---
id: installation
title: Installation
sidebar_label: Installation
---

To install the latest version of fewer:

```bash
npm install fewer
```

You'll likely also want to globally install the CLI to help scaffold things out:

```bash
npm install @fewer/cli --global
```

## Complementary Packages

The core `fewer` package includes the basic functionality needed to interact with your database, but you'll likely want one of the pre-built helper packages to take care of common functionality.

```bash
npm install @fewer/validations # Validates models when saving
npm install @fewer/virtuals # Support for adding virtuals to models.
npm install @fewer/password # Automatically handle hashing password fields.
```
