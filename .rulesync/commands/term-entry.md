---
description: "Create a new glossary term entry"
targets: ["*"]
---

# Term entry

Create a new term entry file for the requested topic and term at:

```
src/content/terms/<slug>.md
```

Use this CLI-style command in your response before writing the file:

```bash
$ bean term-entry "<TOPIC>" "<TERM>"
```

`bean` is display text for CLI-style formatting in this project. Do not paste this command into the markdown body of the term entry.

## Required behavior

1. Treat the request as two inputs: `TOPIC` and `TERM`.
2. Create the filename by slugifying the term into lowercase kebab-case and removing punctuation that would not belong in a URL slug.
3. Write the file directly under `src/content/terms/`.
4. Include frontmatter that matches the terms collection schema:

```yaml
---
name: "<display term>"
summary: "<very short one-line summary>"
aliases:
  - "<optional alias>"
---
```

5. Keep the primary descriptive content in the markdown body, not frontmatter arrays.
6. Use exactly one markdown heading, and it must be the term itself.
7. Write only 1 or 2 short paragraphs in the body.
8. Attach 2 to 4 trustworthy hyperlinks directly to the relevant claim or example.
9. Create the file instead of stopping at a draft or diff-only response.

## Writing prompt

Use this prompt to generate the body content after substituting the requested values:

```text
Write a very short glossary entry for "{TERM}" for a small back-pocket field guide or compact intellectual zine about {TOPIC}.

The reader is intelligent, well educated, and curious, but does not want an extended explanation. The goal is to give them a quick conceptual handle on the term, plus one or two expert-level ways of reading it, so they can understand what it signals and say something mildly intelligent about it later.

You may use the internet while preparing the entry. Any factual claims that are not completely obvious should be grounded in a small number of trustworthy hyperlinks so the reader can verify them easily.

Use this voice:

- sound like a knowledgeable professor writing plainly for smart non-specialists
- be compact, direct, and lightly informal
- feel like a note in a pocket field glossary written by someone with real judgment
- not like a blog post, not like a textbook, not like marketing copy, and not like polished AI explainer prose

Important constraints:

- write only 1 or 2 short paragraphs
- use only one heading, which should be the term itself
- do not use bullet points
- do not use em dashes
- do not use en dashes
- avoid parentheses unless genuinely necessary
- when expressing ranges, write them with words rather than dash punctuation
- do not use a concluding wrap-up paragraph
- avoid rhetorical openings, elegant summary lines, and polished takeaway sentences
- avoid generic explanatory phrases such as "serves as a clue," "acts as a proxy," "can be understood as," or similar abstract filler
- do not waste space stating obvious caveats that an intelligent reader would already assume
- do not try to be complete; include only what gives the reader the strongest conceptual grip on the term

Content guidance:

- define {TERM} plainly and early
- explain why the term matters within {TOPIC}
- include the kind of practical interpretation an expert makes on seeing the term
- where useful, give a compact sense of how different values or ranges are read in practice
- include one or two brief concrete examples if they materially improve understanding
- focus on what the term lets a knowledgeable person infer, expect, or compare
- only mention caveats briefly, and only if they sharpen the reader's understanding rather than dilute it
- stay close to the term itself rather than drifting into a broader essay on the subject

Source and citation guidance:

- ground the entry in 2 to 4 trustworthy sources at most
- prefer primary or high-quality specialist sources over generic SEO content
- attach hyperlinks directly to the relevant claim or phrase rather than dumping a reading list at the end
- keep citations light and unobtrusive
- use citations to increase trust and signal, not to clutter the entry
- if a useful example is included, prefer one that can be linked to a real producer, roaster, academic source, or recognized coffee authority

Style guidance:

- prefer plain, short to medium sentences
- keep the prose matter-of-fact
- allow a slightly dry, human cadence
- write with high informational density
- make the prose feel like compressed expert judgment, not balanced pedagogy
- avoid symmetrical compare-and-contrast phrasing unless the topic truly requires it
- stop as soon as the essential point has been made

Aim for something that feels trustworthy, compressed, quietly insider-ish, and lightly sourced, as if a well-read human were telling the reader what is actually worth noticing about the term and giving them just enough grounding to trust it.

TOPIC: {TOPIC}
TERM: {TERM}
```

## Notes

- Use markdown inline links for citations.
- Keep the summary short enough to read cleanly on `/beans/terms/`.
- If the requested term text is awkward as a display label, you may normalize the display name slightly while preserving the user's intent.
