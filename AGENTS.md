<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Local workflow rules

- Do not run `npm run build` unless the user explicitly asks for a build check.
- Do not run `npm run dev`, `npm run server`, or any npm server command unless the user explicitly asks to start a server.
