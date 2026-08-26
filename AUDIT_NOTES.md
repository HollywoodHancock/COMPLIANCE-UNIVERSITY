# Expansion Audit Notes

This branch adds supplemental informational NY HUT authority pages only. It does not add permit checkout, pricing/offer schema, or a competing order funnel on NewYorkHUT.com.

The build validator checks:
- self-referencing NewYorkHUT.com canonicals
- NYHUT.com conversion links on educational pages
- no local transactional forms
- no Product/Offer schema
- unique sitemap URLs
- sitemap URLs restricted to NewYorkHUT.com

The branch is intended to be promoted to `main` only after the preview build succeeds.
