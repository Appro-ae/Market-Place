# Jira formatting — fetching, rebuilding and colouring descriptions and comments

## Tools (Atlassian Rovo MCP, deferred — load with ToolSearch `select:` first)

| Need | Tool | Notes |
| --- | --- | --- |
| Read a story, comments | `getJiraIssue` `fields: ["summary","description","status","updated","comment"]`, `responseContentFormat: "markdown"` | Markdown flattens table cells and drops colours; fine for reading, not for editing. |
| Read the rendered HTML | `getJiraIssue` `fields: ["description"]`, `expand: "renderedFields"` | Result is big and lands in a file; extract with `jq -r '.issues.nodes[0].renderedFields.description' file > snapshot.html`. Keeps bullets in cells, `<font color>`, `<tt>`, `<br/>`, smart-link macros. |
| Search precedents | `searchJiraIssuesUsingJql` | Three phrasings per concept; results >50k chars are saved to a file — list with `jq -r '.issues.nodes[] | "\(.key) | \(.fields.status.name) | \(.fields.summary)"'`. |
| Confluence baseline | `getConfluencePage` | For IH/HL pages; read sections, quote them. |
| Account ids for mentions | `lookupJiraAccountId` `searchString: "<name>"` | Needed for `mention` nodes in comments. |
| Post a comment | `addCommentToJiraIssue` `commentBody: <ADF JSON as a string>`, `contentFormat: "adf"` | Only on the user's go. `commentId` updates an existing comment. |
| Update the description | `editJiraIssue` `fields: {"description": <ADF document object>}`, `contentFormat: "adf"` | The whole document replaces the old one; there is no partial update. |

`responseContentFormat: "adf"` on `getJiraIssue` still returns markdown for descriptions on
this connector; that is why the rendered HTML route exists.

## Why rebuild from rendered HTML

A description with tables whose cells contain bullet lists cannot round-trip through
markdown: the fetch shows `Displayed after… **Format:** Alphanumeric…` as one run-on cell.
Sending that back would destroy the BA's structure. The rendered HTML keeps `<ul><li>`
inside `<td>`, `<font color>`, `<b>`, `<tt>`, `<br/>` and the issue-macro spans, so
`scripts/build_adf_from_html.py` can rebuild an equivalent ADF and add tracked changes.

Limits: images and attachments in the description cannot be rebuilt (media ids are not in
the HTML) — the script aborts when it meets an `<img>` outside an issue macro unless told to
drop it. Column widths are not preserved (Jira re-lays the table out). Panels, expands and
status lozenges are not handled; check the rendered HTML for `data-type` custom nodes first.

## Colours and meaning

| Purpose | Colour | Rule |
| --- | --- | --- |
| BA "NEW" markers (v-something) | often dark orange `#E65100`, blue `#1565C0` for CHANGED | Leave untouched. |
| PO edits done by hand in Jira | orange `#ff991f` (Jira palette orange) | Leave untouched. |
| Skill: inserted / changed text | purple `#6554c0` | Pick another colour if purple already appears in the description. |
| Skill: removed text | grey `#97a0af` + strikethrough | Text stays visible until the BA accepts. |
| Comment header cells | navy `#1a214d` background, white bold text | |
| Comment status cells | green `#abf5d1` / yellow `#fdba23` / red `#ffbdad` | Done / fix required / Not Done |

Check what is already used before choosing: `grep -o '<font color="[^"]*"' snapshot.html | sort | uniq -c`.

## ADF facts that matter

- Text marks: `strong`, `em`, `underline`, `strike`, `subsup`, `link`, `textColor`
  (`{"attrs":{"color":"#rrggbb"}}`), `code`. `code` combines only with `link`; a coloured or
  struck code span must drop the `code` mark.
- Table cells must contain block nodes (paragraph, bulletList…), never bare text. List items
  start with a paragraph. Headings and paragraphs contain inline nodes only.
- Smart links are `inlineCard` nodes (`{"type":"inlineCard","attrs":{"url":"https://…/browse/KEY"}}`).
  Inside struck text they become plain struck text (a card cannot be struck).
- `hardBreak` for `<br/>`; `orderedList` may carry `attrs.order`.
- Cell background for comments: `tableCell.attrs.background` / `tableHeader.attrs.background`.
- Mentions: `{"type":"mention","attrs":{"id":"<accountId>","text":"@Name"}}`.

## Renderer artifacts to expect in the HTML snapshot

- Literal square brackets render as `<span class="error">&#91;N&#93;</span>`; treat as text `[N]`.
- A leading `*` in a paragraph is mangled (`**(*)Of note…**` came back as `<b>(</b>)Of note…*`). Compare with the markdown fetch and restore the original text in the edit spec.
- Issue macros are wrapped in newline + indentation; the script strips the renderer's
  `\n    ` before a macro and the `\n` after it, keeping the author's own spaces.
- `<a name="…">` anchors inside headings are noise.
- Underline renders as `<ins>` and strike as `<del>`; the script renames pre-existing ones to
  `<u>`/`<s>` **before** applying edits so they are not confused with tracked changes. So when
  a `find` string must match text that is already struck in the snapshot (a second round of
  edits on top of a first), write it as `<font color="#97a0af"><s>…</s></font>`, not `<del>`.
- Jira auto-links ticket keys typed as plain text into issue macros on the next render. The
  script keeps such keys as text when they sit inside highlighted or struck runs.

## The chunk-and-paste procedure (description update)

1. `python3 scripts/build_adf_from_html.py --html snapshot.html --edits edits.json --out v5 --show-edits`
2. Read the printed edit rendering; fix the spec until every `[+…+]` / `[-…-]` reads right.
3. `cat v5.chunk_1.txt` … `v5.chunk_N.txt` (each ≤20k characters so nothing is truncated).
4. Call `editJiraIssue` with `contentFormat: "adf"` and `fields: {"description": <the document>}`
   reproduced verbatim. Jira rejects invalid ADF outright; a silent typo would only change
   text, which step 6 catches.
5. `getJiraIssue` with `expand: renderedFields` → `live.html`.
6. `python3 scripts/verify_description.py --live live.html --expected v5.edited.html --summary v5.summary.json --phrases "…"`.
7. Keep `v5.preview.html` as the as-applied record in the repo (after `--strip-old-strikes`,
   wrap the live rendered HTML instead, since the preview still shows the dropped strikes).

## Size limit — `CONTENT_LIMIT_EXCEEDED`

`editJiraIssue` rejects a description whose stored document is too large. The limit is on the
compact ADF JSON, not on the visible text: measured on AMP-2548, 80 KB (26.5k characters of
text) was accepted and 92 KB (28.7k characters) was rejected. Tracked changes double the size
of every edited sentence, so a third round on a long story hits it.

Mitigations, cheapest first:

1. `python3 scripts/shrink_adf.py v5.adf.json --out v5s.adf.json --strike-only` — merges
   adjacent runs with identical marks, drops empty cell attributes and removes the grey colour
   from struck text (strikethrough alone still reads as "removed"). Saves 5–10 %.
2. Rebuild with `build_adf_from_html.py … --strip-old-strikes` — previous rounds' struck text
   (`<s>` / grey runs in the snapshot) is dropped as if accepted, this round's `<del>` stays,
   and empty containers are pruned. Saved 11 % on AMP-2548. Tell the PO which earlier removals
   are no longer visible in the ticket; the earlier as-applied record in the repo keeps them.
3. Ask the BA to accept the tracked changes before the next round (`--accept` run).

Macros and smart links inside struck or highlighted runs are emitted as plain text keys so a
removed reference does not resurface as a live card.

## Comment posting

`python3 scripts/build_review_comment_adf.py spec.json --out comment.adf.json` then
`addCommentToJiraIssue` with `commentBody` set to the file content (a JSON string) and
`contentFormat: "adf"`. Show the user the rendering (`--show`) before asking for the go.
