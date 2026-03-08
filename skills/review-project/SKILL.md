---
name: review-project
description: >
  A skill to analyze a project and find areas for improvement or new ideas to implement.
  Trigger: Use it when evaluating existing projects for enhancements.
license: Apache-2.0
metadata:
  author: brivaro-cloud
  version: "1.0"
---

## When to Use

- When you need to analyze a project for improvements.
- To identify opportunities for refactoring code or enhancing the architecture.
- While exploring ideas for additional features.

## Critical Patterns

- Conduct a detailed walkthrough of the project's directories and files.
- Look for areas with excessive code repetition or inconsistent architectures.
- Detect files that do not align with team conventions or industry standards.
- Review dependencies to ensure they are up-to-date and necessary.

## Code Examples

### Detecting duplicated code with `duplication-linter`:

```bash
npx duplication-linter ./src
```

### Finding unused dependencies:

```bash
npx depcheck
```

### Analyze entry points with `webpack`:

```bash
npx webpack-bundle-analyzer dist/stats.json
```

## Commands

```bash
# To find duplication:
npx duplication-linter ./src

# To check dependencies:
npx depcheck

# To analyze package stats:
npx webpack-bundle-analyzer dist/stats.json
```

## Resources

- **Templates**: See [assets/](assets/) for related templates.
- **Documentation**: Check [references/](references/) for local documentation.