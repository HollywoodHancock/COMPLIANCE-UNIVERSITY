# Production Promotion Checklist

- [ ] Cloudflare preview build succeeds on the expansion branch.
- [ ] `npm run build` completes `build.mjs`, `seo-extra.mjs`, and `validate.mjs` without errors.
- [ ] Preview sitemap contains no duplicate URLs.
- [ ] New pages use self-referencing NewYorkHUT.com canonical URLs.
- [ ] Educational pages include NYHUT.com conversion links.
- [ ] No checkout/order form is added to NewYorkHUT.com.
- [ ] No Product or Offer schema is added to NewYorkHUT.com.
- [ ] Merge expansion PR into `main`.
- [ ] Confirm Cloudflare production deployment from `main`.
- [ ] Verify homepage, robots.txt, sitemap.xml, and representative new pages on the live domain.
- [ ] Resubmit the live sitemap in Google Search Console after production verification.
